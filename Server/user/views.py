from rest_framework.response import Response
from rest_framework import status, generics
from .models import *
from .serializers import *
from rest_framework.views import APIView
from django.contrib.auth import login

from django.contrib.auth import get_user_model, authenticate
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

User = get_user_model()

from django.shortcuts import render


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_user(request, user_id):
    try:
        target_user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

    requester = request.user

    if requester.role == "admin" and requester != target_user:
        target_user.is_deleted = True
        target_user.save()
        return Response({"message": "User soft-deleted by admin"}, status=status.HTTP_200_OK)

    elif requester == target_user:
        target_user.is_deleted = True
        target_user.save()
        return Response({"message": "Your account has been soft-deleted"}, status=status.HTTP_200_OK)

    else:
        return Response({"error": "You do not have permission to delete this user"}, status=status.HTTP_403_FORBIDDEN)


class LoginView(APIView):
    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        user = serializer.validated_data["user"]
        login(request, user)
        return Response({  # ← JSON response
            "message": "Login successful",
            "username": user.username,
            "role": user.role,
            "id": user.id  # ← Include user ID for deletion
        })

class SignupView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSignupSerializer
