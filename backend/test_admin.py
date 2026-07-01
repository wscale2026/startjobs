import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

from django.test import Client
from users.models import User

c = Client()
admin = User.objects.filter(username='admin').first()
c.force_login(admin)

response = c.get("/admin/")
print(response.status_code)
