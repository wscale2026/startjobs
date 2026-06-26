import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()
from django.conf import settings
print("DEFAULT_FILE_STORAGE:", settings.DEFAULT_FILE_STORAGE)
print("CLOUDINARY_URL:", os.environ.get('CLOUDINARY_URL'))
from users.models import User
try:
    u = User.objects.get(username='realcandidate7')
    cp = u.candidate_profile
    print("Photo name:", cp.photo.name)
    print("Photo url:", cp.photo.url)
except Exception as e:
    print(e)
