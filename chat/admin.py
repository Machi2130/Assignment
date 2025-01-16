from django.contrib import admin
from .models import User, ChatMessage  # Changed from Message to ChatMessage

class UserAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'status', 'last_seen')
    search_fields = ('username', 'email')

class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ('sender', 'receiver', 'content', 'timestamp')
    list_filter = ('timestamp',)

admin.site.register(User, UserAdmin)
admin.site.register(ChatMessage, ChatMessageAdmin)
