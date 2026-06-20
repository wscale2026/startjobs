import os
import django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

from django.contrib.auth import get_user_model
from users.models import CandidateProfile
User = get_user_model()
u = User.objects.filter(role='candidate').first()
print(f"Candidate User: {u}")
if u:
    print(f"Has candidate profile: {hasattr(u, 'candidate_profile')}")
