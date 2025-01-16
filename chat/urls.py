from django.urls import path
from . import views

urlpatterns = [
    path('', views.auth_view, name='auth'),
    path('chat/', views.chat_view, name='chat'),
    path('login/', views.login_view, name='login'),
    path('signup/', views.signup_view, name='signup'),
    path('logout/', views.logout_view, name='logout'),
    path('send-message/', views.send_message, name='send_message'),
    path('get-messages/<int:user_id>/', views.get_messages, name='get_messages'),
    path('get-users/', views.get_users, name='get-users'),
]

