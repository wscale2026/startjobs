import os
import django
import sys

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)) + '/../../../')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from users.models import Skill

skills = [
    # Informatique, Digital & TIC
    "Administration Système et Réseaux",
    "Analyse de Données (Data Science)",
    "Cybersécurité / Sécurité Informatique",
    "Développement d'Applications Mobiles",
    "Maintenance Informatique & Dépannage",
    "Support Technique (Helpdesk)",
    
    # Banque, Finance & Comptabilité
    "Analyse Financière",
    "Audit et Contrôle de Gestion",
    "Conseil en Microfinance",
    "Fiscalité & Déclarations d'impôts",
    "Gestion de Paie",
    "Recouvrement de Créances",
    
    # Artisanat & Métiers Manuels
    "Bijouterie / Joaillerie",
    "Cordonnerie / Fabrication de chaussures",
    "Ébénisterie / Menuiserie d'art",
    "Tapisserie & Décoration d'intérieur",
    "Tissage / Vannerie / Rotin",
    
    # Santé & Action Sociale
    "Aide-soignant(e)",
    "Analyse Médicale & Biologie",
    "Kinésithérapie / Physiothérapie",
    "Médecine Générale",
    "Pharmacie & Auxiliaire de pharmacie",
    "Sage-femme / Maïeutique",
    "Santé Publique / Sensibilisation"
]

print("Adding Skills...")
for s in skills:
    obj, created = Skill.objects.get_or_create(name=s)
    if created:
        print(f"Created skill: {s}")

print("Done!")
