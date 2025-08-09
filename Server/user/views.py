from rest_framework.response import Response
from rest_framework import status, generics
from .models import *
from .serializers import *
from django.db import connection
from rest_framework.views import APIView
from django.contrib.auth import login
from django.contrib.auth import get_user_model, authenticate
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

User = get_user_model()

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_active_users(request):
    try:
        with connection.cursor() as cursor:
            cursor.execute('SELECT * FROM view_active_users')
            columns = [col[0].lower() for col in cursor.description]
            rows = cursor.fetchall()
            users = [dict(zip(columns, row)) for row in rows]

        return Response({"users": users}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_user(request, user_id):
    requester = request.user

    if requester.role == "admin" and requester.id != user_id:
        try:
            with connection.cursor() as cursor:
                cursor.callproc('delete_user_by_admin', [user_id])
                connection.commit()
            return Response({"message": "User soft-deleted by admin via procedure"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": f"Database error: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

    elif requester.id == user_id:
        try:
            target_user = User.objects.get(id=user_id)
            target_user.is_deleted = True
            target_user.save()
            return Response({"message": "Your account has been soft-deleted"}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

    else:
        return Response({"error": "You do not have permission to delete this user"}, status=status.HTTP_403_FORBIDDEN)


class LoginView(APIView):
    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        user = serializer.validated_data["user"]
        login(request, user)

        LoginLog.objects.create(user=user, login_time=timezone.now(), username=user.username, email=user.email)
        
        return Response({  # ← JSON response
            "message": "Login successful",
            "username": user.username,
            "role": user.role,
            "id": user.id  # ← Include user ID for deletion
        })

class SignupView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSignupSerializer

    def perform_create(self, serializer):
        user = serializer.save()
        SignupLog.objects.create(user=user, signup_time=timezone.now(), username=user.username, email=user.email)
