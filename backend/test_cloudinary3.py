import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()
from django.core.files.storage import default_storage
print("Type of default_storage:", type(default_storage))
print("URL of a file:", default_storage.url('candidates/photos/photo.jpg'))
