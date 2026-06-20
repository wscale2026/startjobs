from django.db import models
from users.models import User
from jobs.models import JobOffer

class Conversation(models.Model):
    participants = models.ManyToManyField(User, related_name='conversations')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Conversation {self.id} between {', '.join([p.username for p in self.participants.all()])}"

class Message(models.Model):
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    text = models.TextField(blank=True, null=True)
    is_read = models.BooleanField(default=False)
    is_deleted = models.BooleanField(default=False)
    
    # For file/audio attachments if needed later
    attachment = models.FileField(upload_to='messages/attachments/', blank=True, null=True)
    is_audio = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Msg from {self.sender.username} at {self.created_at}"

class Review(models.Model):
    reviewer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews_given')
    reviewee = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews_received')
    job_offer = models.ForeignKey(JobOffer, on_delete=models.SET_NULL, null=True, blank=True, related_name='reviews')
    
    rating = models.FloatField()
    comment = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Review by {self.reviewer.username} for {self.reviewee.username} ({self.rating} stars)"
