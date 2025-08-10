from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse, HttpResponseForbidden
from django.views.decorators.csrf import csrf_exempt
from .models import User
from django.utils.timezone import now
from django.utils import timezone
import hashlib
from .models import *

# Simple password hash helper (you can improve with django's auth later)
def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

import json

@csrf_exempt
def signup(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)

        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        role = data.get('role', 'buyer').lower()

        if not password:
            return JsonResponse({'error': 'Password is required'}, status=400)

        if role not in ['admin', 'seller', 'deliveryman', 'buyer']:
            return JsonResponse({'error': 'Invalid role'}, status=400)

        if User.objects.filter(username=username).exists():
            return JsonResponse({'error': 'Username already exists'}, status=400)
        if User.objects.filter(email=email).exists():
            return JsonResponse({'error': 'Email already exists'}, status=400)

        hashed_password = hash_password(password)

        user = User(username=username, email=email, password=hashed_password, role=role)
        user.save()

        return JsonResponse({'message': 'Signup successful', 'user_id': user.user_id})
    else:
        return JsonResponse({'error': 'Only POST allowed'}, status=405)



@csrf_exempt
def login(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)

        username = data.get('username')
        password = data.get('password')

        if not username or not password:
            return JsonResponse({'error': 'Username and password required'}, status=400)

        hashed_password = hash_password(password)
        try:
            user = User.objects.get(username=username, password=hashed_password)

            return JsonResponse({'message': 'Login successful', 'user_id': user.user_id, 'role': user.role})
        except User.DoesNotExist:
            return JsonResponse({'error': 'Invalid username or password'}, status=401)
    else:
        return JsonResponse({'error': 'Only POST allowed'}, status=405)


def view_all_users(request):
    users = User.objects.all().values('user_id', 'username', 'email', 'role')
    return JsonResponse(list(users), safe=False)


def view_users_by_role(request, role):
    role = role.lower()
    if role not in ['admin', 'seller', 'deliveryman', 'buyer']:
        return JsonResponse({'error': 'Invalid role'}, status=400)
    users = User.objects.filter(role=role).values('user_id', 'username', 'email')
    return JsonResponse(list(users), safe=False)


@csrf_exempt
def delete_user(request, user_id):
    if request.method == 'DELETE':
        try:
            user = User.objects.get(user_id=user_id)
            user.delete()
            return JsonResponse({'message': f'User {user_id} deleted'})
        except User.DoesNotExist:
            return JsonResponse({'error': 'User not found'}, status=404)
    else:
        return JsonResponse({'error': 'Only DELETE allowed'}, status=405)
