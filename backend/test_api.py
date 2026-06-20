import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()
from users.models import User, CandidateProfile
cands = CandidateProfile.objects.all()
for c in cands:
    print(f"CandidateProfile ID: {c.id}, User ID: {c.user.id if c.user else 'None'}")
