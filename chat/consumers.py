from time import timezone
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import ChatMessage, User
import json

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()

    async def disconnect(self, close_code):
        pass

    async def receive(self, text_data):
        data = json.loads(text_data)
        await self.send(text_data=json.dumps({
            'message': data['message']
        }))

    @database_sync_to_async
    def update_user_status(self, is_online):
        User.objects.filter(id=self.user.id).update(
            status='online' if is_online else 'offline',
            last_active=timezone.now()
        )

    @database_sync_to_async
    def save_message(self, data):
        ChatMessage.objects.create(
            sender_id=self.user.id,
            receiver_id=data['receiver_id'],
            content=data['content']
        )
