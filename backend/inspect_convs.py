import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from interactions.models import Conversation
from users.models import User

print("Conversations with > 2 participants:")
for c in Conversation.objects.all():
    parts = c.participants.all()
    if len(parts) > 2:
        print(f"Conversation {c.id} has {len(parts)} participants: {[p.username for p in parts]}")
    
print("\nConversations for candidates:")
candidates = User.objects.filter(role='candidate')
for c in candidates:
    convos = Conversation.objects.filter(participants=c)
    for conv in convos:
        parts = conv.participants.all()
        if len(parts) != 2:
            print(f"Candidate {c.username} in Convo {conv.id} with parts: {[p.username for p in parts]}")

print("\nDuplicate 1-on-1 conversations:")
from django.db.models import Count
convos = Conversation.objects.annotate(c=Count('participants')).filter(c=2)
seen_pairs = {}
for conv in convos:
    p_ids = tuple(sorted([p.id for p in conv.participants.all()]))
    if p_ids in seen_pairs:
        print(f"DUPLICATE Convo: {conv.id} duplicates {seen_pairs[p_ids]}")
    else:
        seen_pairs[p_ids] = conv.id
