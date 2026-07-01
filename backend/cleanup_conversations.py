"""
Script de nettoyage et diagnostic des conversations orphelines.
Ce script:
1. Affiche un rapport complet de la situation
2. Supprime les conversations admin→user qui ne servent qu'à du broadcast 
   mais qui sont visibles par les mauvais utilisateurs
3. Laisse uniquement les conversations légitimes 1-à-1 entre utilisateurs réels
"""
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from interactions.models import Conversation, Message
from users.models import User
from django.db.models import Count

# 1. Rapport
print("=" * 60)
print("RAPPORT DE SÉCURITÉ - CONVERSATIONS")
print("=" * 60)

all_convos = Conversation.objects.annotate(c=Count('participants')).all()
print(f"\nTotal conversations: {all_convos.count()}")

# Trouver les super admins
superadmins = User.objects.filter(is_superuser=True)
print(f"Super admins: {[u.username for u in superadmins]}")

# Analyser les conversations par type
admin_welcome_convos = []  # conversations admin→user (bienvenue, broadcast)
legitimate_convos = []     # conversations user↔user légitimes

for conv in all_convos:
    parts = list(conv.participants.all())
    is_admin_convo = any(p.is_superuser or p.is_staff for p in parts)
    non_admin_parts = [p for p in parts if not p.is_superuser and not p.is_staff]
    
    if is_admin_convo and len(non_admin_parts) == 1:
        # C'est une conversation admin↔user unique
        user = non_admin_parts[0]
        msg_count = conv.messages.count()
        admin_parts = [p for p in parts if p.is_superuser or p.is_staff]
        admin_names = [p.username for p in admin_parts]
        admin_welcome_convos.append({
            'id': conv.id,
            'user': user.username,
            'user_role': user.role,
            'admins': admin_names,
            'msg_count': msg_count
        })
    else:
        legitimate_convos.append({
            'id': conv.id,
            'participants': [p.username for p in parts],
            'msg_count': conv.messages.count()
        })

print(f"\nConversations admin→utilisateur: {len(admin_welcome_convos)}")
print(f"Conversations légitimes user↔user: {len(legitimate_convos)}")

print("\n--- Conversations admin→utilisateur (premières 20) ---")
for c in admin_welcome_convos[:20]:
    print(f"  Conv {c['id']}: Admin({c['admins']}) ↔ {c['user']}({c['user_role']}) - {c['msg_count']} msgs")

print("\n--- Conversations légitimes (premières 10) ---")
for c in legitimate_convos[:10]:
    print(f"  Conv {c['id']}: {c['participants']} - {c['msg_count']} msgs")

# 2. Nettoyage: Supprimer les conversations où seul l'admin a envoyé des messages
print("\n" + "=" * 60)
print("NETTOYAGE")
print("=" * 60)

deleted_count = 0
kept_count = 0

for conv_info in admin_welcome_convos:
    conv = Conversation.objects.get(id=conv_info['id'])
    messages = conv.messages.all()
    
    # Garder la conversation si l'utilisateur non-admin a répondu
    user = User.objects.get(username=conv_info['user'])
    user_replied = messages.filter(sender=user).exists()
    
    if not user_replied:
        # Seul l'admin a écrit (bienvenue/broadcast) - on supprime
        print(f"  SUPPRESSION Conv {conv_info['id']}: {conv_info['admins']} → {conv_info['user']} ({conv_info['msg_count']} msgs, utilisateur n'a pas répondu)")
        conv.delete()
        deleted_count += 1
    else:
        print(f"  CONSERVATION Conv {conv_info['id']}: {conv_info['user']} a répondu ({conv_info['msg_count']} msgs)")
        kept_count += 1

print(f"\nConversations supprimées: {deleted_count}")
print(f"Conversations conservées (avec réponse utilisateur): {kept_count}")
print(f"Conversations légitimes conservées: {len(legitimate_convos)}")
print("\nTerminé!")
