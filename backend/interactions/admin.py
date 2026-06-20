from django.contrib import admin
from .models import Conversation, Message, Review

class MessageInline(admin.TabularInline):
    model = Message
    extra = 1

@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ('id', 'created_at', 'updated_at')
    filter_horizontal = ('participants',)
    inlines = [MessageInline]

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('conversation', 'sender', 'is_read', 'created_at')
    list_filter = ('is_read', 'is_audio')
    search_fields = ('text', 'sender__username')

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('reviewer', 'reviewee', 'job_offer', 'rating', 'created_at')
    list_filter = ('rating',)
    search_fields = ('reviewer__username', 'reviewee__username', 'comment')
