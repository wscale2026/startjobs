import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from interactions.models import Conversation
from users.models import User
from django.db.models import Count

convos = Conversation.objects.annotate(c=Count('participants')).all()
for c in convos:
    if c.c > 2:
        print(f"Conversation {c.id} has {c.c} participants")

users_with_many_convos = User.objects.annotate(conv_count=Count('conversations')).filter(conv_count__gt=2)
for u in users_with_many_convos:
    roles = []
    if u.is_superuser: roles.append("superuser")
    if hasattr(u, 'candidate_profile'): roles.append("candidate")
    if hasattr(u, 'employer_profile'): roles.append("employer")
    print(f"User {u.username} (ID: {u.id}) has {u.conv_count} conversations. Roles: {roles}")
