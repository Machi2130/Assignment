import os
from django.core.wsgi import get_wsgi_application
from django.contrib import admin
from django.urls import path, include

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'chats.setting')

application = get_wsgi_application()

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('chat_app.urls')),
]
