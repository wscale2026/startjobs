import requests
import io
import os
from PIL import Image

# Create a valid dummy image in memory
img = Image.new('RGB', (100, 100), color = 'red')
img_byte_arr = io.BytesIO()
img.save(img_byte_arr, format='JPEG')
img_byte_arr.seek(0)

url = "http://localhost:8000/api/register/"
data = {
    'username': 'realcandidate7',
    'email': 'real7@example.com',
    'password': 'password123',
    'first_name': 'Real',
    'last_name': 'Candidate',
    'role': 'candidate',
    'profile_data': '{}'
}
files = {
    'photo': ('photo.jpg', img_byte_arr, 'image/jpeg')
}

response = requests.post(url, data=data, files=files)
print("Status:", response.status_code)
print("Response:", response.text)

import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()
from users.models import User
u = User.objects.get(username='realcandidate7')
cp = getattr(u, 'candidate_profile', None)
if cp:
    print("Photo saved:", bool(cp.photo))
    print("Photo url:", cp.photo.url if cp.photo else "None")
else:
    print("No profile")
