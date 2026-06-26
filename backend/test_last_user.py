import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()
from users.models import User
users = User.objects.filter(role='candidate').order_by('-date_joined')[:5]
for u in users:
    cp = getattr(u, 'candidate_profile', None)
    if cp:
        print(f"User: {u.username}, Photo: {cp.photo}, Has file: {bool(cp.photo)}")
