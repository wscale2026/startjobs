import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

from rest_framework.test import APIClient
from users.models import User, EmployerProfile
import json

c = APIClient()
# find superadmin
admin = User.objects.filter(is_superuser=True).first()
c.force_authenticate(user=admin)

# find dumping corp
emp = EmployerProfile.objects.filter(company_name__icontains='Dumping corp').first()
if emp:
    print(f"Found employer {emp.user.email} with status {emp.kyc_status}")
    response = c.patch(f"/api/admin/update-user/{emp.user.id}/", 
                       json.dumps({'profile': {'kyc_status': 'approved', 'kyc_rejection_reason': ''}}), 
                       content_type="application/json")
    print(response.status_code)
    print(response.content)
else:
    print("Employer not found")
