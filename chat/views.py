from django.db.models import Q
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import logout
import json
from .models import User, ChatMessage

def auth_view(request):
    if request.user.is_authenticated:
        return redirect('chat')
    return render(request, 'chat/auth.html')

@csrf_exempt
def login_view(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        email = data.get('email')
        user = User.objects.filter(email=email).first()
        
        if user and authenticate(username=user.username, password=data.get('password')):
            login(request, user)
            user.status = 'online'
            user.save()
            return JsonResponse({'success': True, 'redirect': '/chat/'})
        return JsonResponse({'success': False, 'error': 'Invalid credentials'})

@csrf_exempt
def signup_view(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        username = data.get('username')
        
        # Check if username already exists
        if User.objects.filter(username=username).exists():
            return JsonResponse({
                'success': False,
                'error': 'Username already taken'
            })
            
        # Create new user
        user = User.objects.create_user(
            username=username,
            email=data.get('email'),
            password=data.get('password1')
        )
        login(request, user)
        return JsonResponse({
            'success': True,
            'redirect': '/chat/'
        })
    return JsonResponse({'success': False})

@login_required(login_url='/')
def chat_view(request):
    return render(request, 'chat/index.html')

def logout_view(request):
    logout(request)
    return redirect('auth')

def send_message(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        message = ChatMessage.objects.create(
            sender=request.user,
            receiver_id=data['receiver_id'],
            content=data['content']
        )
        return JsonResponse({'success': True})

@login_required

def get_messages(request, user_id):
    chat_user = User.objects.get(id=user_id)
    messages = ChatMessage.objects.filter(
        Q(sender=request.user, receiver_id=user_id) |
        Q(sender_id=user_id, receiver=request.user)
    ).order_by('timestamp')
    
    return JsonResponse({
        'messages': [{
            'sender': msg.sender.username,
            'content': msg.content,
            'timestamp': msg.timestamp.strftime('%H:%M')
        } for msg in messages],
        'user': {
            'username': chat_user.username,
            'email': chat_user.email,
            'status': chat_user.status
        }
    })
def get_users(request):
    users = User.objects.exclude(id=request.user.id).values('id', 'username', 'status')
    return JsonResponse({'users': list(users)})
