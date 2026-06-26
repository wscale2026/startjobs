import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'StartJobs.settings')
django.setup()
from users.models import User, CandidateProfile
from users.serializers import UserMeSerializer
from rest_framework.test import APIRequestFactory

factory = APIRequestFactory()
request = factory.get('/api/users/me/')

user = User.objects.filter(role='candidate').first()
if user:
    # Set a dummy photo if none exists just to see the output format
    if not user.candidate_profile.photo:
        user.candidate_profile.photo.name = 'candidates/photos/test.jpg'
        user.candidate_profile.save()
        
    serializer = UserMeSerializer(user, context={'request': request})
    print(serializer.data['candidate_profile']['photo'])
else:
    print("No candidate user found")
