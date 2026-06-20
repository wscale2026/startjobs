import os
import django
import sys
import json

sys.path.append('/home/dumping/Documents/projet/StartJobs/backend')
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

from interactions.models import Conversation
from django.contrib.auth import get_user_model
from interactions.serializers import ConversationSerializer

User = get_user_model()
user = User.objects.filter(email='hackdumping@gmail.com').first()

if not user:
    print("User not found!")
else:
    qs = Conversation.objects.filter(participants=user)
    print("Conversations count:", qs.count())
    serializer = ConversationSerializer(qs, many=True)
    print(json.dumps(serializer.data, indent=2))
