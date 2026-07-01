import os
import django
import sys

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)) + '/../../../')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from jobs.models import Sector
from users.models import Skill

sectors = [
    "Agriculture, Élevage & Pêche",
    "Artisanat & Métiers Manuels",
    "Banque, Finance & Microfinance",
    "BTP & Génie Civil",
    "Commerce & Vente",
    "Éducation & Formation",
    "Hôtellerie, Tourisme & Restauration",
    "Informatique, Digital & TIC",
    "Industries Manufacturières & Production",
    "Services à la Personne & Domestiques",
    "Transport, Logistique & Douane"
]

skills = [
    "Agriculture / Travaux champêtres",
    "Call Center / Service Client",
    "Chauffeur / Moto-taxi",
    "Comptabilité / Caisse",
    "Esthétique / Maquillage",
    "Garde d'enfants (Nounou)",
    "Gestion de Projet",
    "Infographie / Design",
    "Maçonnerie",
    "Marketing / Marketing Digital",
    "Mécanique (Auto / Moto)",
    "Menuiserie",
    "Réseaux & Télécommunications",
    "Soins infirmiers / Auxiliaire de santé",
    "Soudure / Métallurgie",
    "Vente / Commerce ambulant"
]

print("Adding Sectors...")
for s in sectors:
    obj, created = Sector.objects.get_or_create(name=s)
    if created:
        print(f"Created sector: {s}")

print("Adding Skills...")
for s in skills:
    obj, created = Skill.objects.get_or_create(name=s)
    if created:
        print(f"Created skill: {s}")

print("Done!")
