from rest_framework import serializers
from .models import Conversation, Message, Review
from users.serializers import UserSerializer
from jobs.serializers import JobOfferSerializer
from users.models import User
from jobs.models import JobOffer

class MessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)

    class Meta:
        model = Message
        fields = ('id', 'conversation', 'sender', 'text', 'is_read', 'is_deleted', 'attachment', 'is_audio', 'created_at')

class ConversationSerializer(serializers.ModelSerializer):
    participants = UserSerializer(many=True, read_only=True)
    messages = MessageSerializer(many=True, read_only=True)

    class Meta:
        model = Conversation
        fields = ('id', 'participants', 'created_at', 'updated_at', 'messages')

class ReviewSerializer(serializers.ModelSerializer):
    reviewer = UserSerializer(read_only=True)
    reviewee = UserSerializer(read_only=True)
    job_offer = JobOfferSerializer(read_only=True)
    
    reviewee_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), source='reviewee', write_only=True
    )
    job_offer_id = serializers.PrimaryKeyRelatedField(
        queryset=JobOffer.objects.all(), source='job_offer', write_only=True, required=False, allow_null=True
    )

    class Meta:
        model = Review
        fields = ('id', 'reviewer', 'reviewee', 'reviewee_id', 'job_offer', 'job_offer_id', 'rating', 'comment', 'created_at')
