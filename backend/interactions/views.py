from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.utils import timezone
from .models import Conversation, Message, Review
from .serializers import ConversationSerializer, MessageSerializer, ReviewSerializer

class ConversationViewSet(viewsets.ModelViewSet):
    queryset = Conversation.objects.all().order_by('-updated_at')
    serializer_class = ConversationSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = Conversation.objects.all().order_by('-updated_at')
        if self.request.user.is_authenticated:
            queryset = queryset.filter(participants=self.request.user)
        return queryset

    def create(self, request, *args, **kwargs):
        participant_ids = request.data.get('participants', [])
        if not participant_ids:
            return Response({'error': 'participants required'}, status=status.HTTP_400_BAD_REQUEST)
        # Filter valid user IDs
        from django.contrib.auth import get_user_model
        User = get_user_model()
        valid_users = User.objects.filter(id__in=participant_ids)
        valid_ids = list(valid_users.values_list('id', flat=True))
        
        if not valid_ids:
            return Response({'error': 'Valid participants required'}, status=status.HTTP_400_BAD_REQUEST)
        
        if request.user.id not in valid_ids:
            valid_ids.append(request.user.id)
            
        # Check if conversation already exists between these exact participants
        from django.db.models import Count
        existing_conversations = Conversation.objects.annotate(c=Count('participants')).filter(c=len(valid_ids))
        for p_id in valid_ids:
            existing_conversations = existing_conversations.filter(participants__id=p_id)
            
        if existing_conversations.exists():
            conversation = existing_conversations.first()
            # If a user previously deleted it for themselves, add them back
            if request.user.id not in conversation.participants.values_list('id', flat=True):
                conversation.participants.add(request.user)
        else:
            conversation = Conversation.objects.create()
            conversation.participants.set(valid_ids)
            
        serializer = self.get_serializer(conversation)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def mark_as_read(self, request, pk=None):
        conversation = self.get_object()
        # Mark all messages sent by others as read
        unread_messages = conversation.messages.exclude(sender=request.user).filter(is_read=False)
        updated_count = unread_messages.update(is_read=True)
        return Response({'status': 'messages marked as read', 'updated_count': updated_count}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def delete_for_me(self, request, pk=None):
        conversation = self.get_object()
        conversation.participants.remove(request.user)
        if conversation.participants.count() == 0:
            conversation.delete()
        return Response({'status': 'conversation deleted for user'}, status=status.HTTP_200_OK)

class MessageViewSet(viewsets.ModelViewSet):
    queryset = Message.objects.all().order_by('created_at')
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)
        
        # Touch the conversation to update its updated_at field
        conversation = serializer.validated_data.get('conversation')
        if conversation:
            conversation.updated_at = timezone.now()
            conversation.save()

    def destroy(self, request, *args, **kwargs):
        message = self.get_object()
        if message.sender == request.user:
            message.is_deleted = True
            message.text = None
            message.save()
            return Response({'status': 'message deleted'}, status=status.HTTP_200_OK)
        return Response({'error': 'Not authorized to delete this message'}, status=status.HTTP_403_FORBIDDEN)

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def bulk_delete(self, request):
        message_ids = request.data.get('message_ids', [])
        messages = Message.objects.filter(id__in=message_ids, sender=request.user)
        updated = messages.update(is_deleted=True, text=None)
        return Response({'status': 'messages deleted', 'count': updated}, status=status.HTTP_200_OK)

class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all().order_by('-created_at')
    serializer_class = ReviewSerializer
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        review = serializer.save(reviewer=self.request.user)
        
        # Recalculate the reviewee's average score
        reviewee = review.reviewee
        all_ratings = Review.objects.filter(reviewee=reviewee).values_list('rating', flat=True)
        if all_ratings:
            avg = sum(all_ratings) / len(all_ratings)
            avg = round(avg * 2) / 2  # Round to nearest 0.5
            # Update the profile score depending on role
            if hasattr(reviewee, 'candidate_profile'):
                reviewee.candidate_profile.score = avg
                reviewee.candidate_profile.save()
            elif hasattr(reviewee, 'employer_profile'):
                reviewee.employer_profile.score = avg
                reviewee.employer_profile.save()

        # Mark the application as reviewed
        if review.job_offer:
            from jobs.models import Application
            try:
                if hasattr(self.request.user, 'employer_profile'):
                    app = Application.objects.get(job_offer=review.job_offer, candidate__user=reviewee)
                else:
                    app = Application.objects.get(job_offer=review.job_offer, candidate__user=self.request.user)
                app.is_reviewed = True
                app.save()
            except Application.DoesNotExist:
                pass
