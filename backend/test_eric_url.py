import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()
from users.models import User
from users.serializers import UserMeSerializer
from rest_framework.test import APIRequestFactory

factory = APIRequestFactory()
request = factory.get('/api/users/me/')
request.META['HTTP_HOST'] = 'localhost:8000'

u = User.objects.get(username='eric')
serializer = UserMeSerializer(u, context={'request': request})
print("UserMeSerializer photo URL:", serializer.data['candidate_profile']['photo'])
