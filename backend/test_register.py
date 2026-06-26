import requests
import io

url = "http://localhost:8000/api/register/"
data = {
    'username': 'testcandidate5',
    'email': 'test5@example.com',
    'password': 'password123',
    'first_name': 'Test',
    'last_name': 'Candidate',
    'role': 'candidate',
    'profile_data': '{}'
}
files = {
    'photo': ('photo.jpg', io.BytesIO(b"fake image data"), 'image/jpeg')
}

response = requests.post(url, data=data, files=files)
print("Status:", response.status_code)
print("Response:", response.text)

import django
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()
from users.models import User
u = User.objects.get(username='testcandidate5')
print("Photo saved:", bool(u.candidate_profile.photo))
