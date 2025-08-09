from rest_framework import serializers
from .models import User
import re
from django.contrib.auth import authenticate
from .models import User

class UserLoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        username = data.get("username")
        password = data.get("password")

        if username and password:
            user = authenticate(username=username, password=password)
            if user:
                if not user.is_active:
                    raise serializers.ValidationError("This account is inactive.")
                data["user"] = user
            else:
                raise serializers.ValidationError("Invalid username or password.")
        else:
            raise serializers.ValidationError("Both username and password are required.")
        return data

class UserSignupSerializer(serializers.ModelSerializer):
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'confirm_password', 'role']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def validate_email(self, value):
        allowed_domains = ['gmail.com', 'yahoo.com', 'hotmail.com']
        if not any(value.endswith(f"@{domain}") for domain in allowed_domains):
            raise serializers.ValidationError("Email must be Gmail, Yahoo, or Hotmail.")
        return value

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError({"password": "Passwords do not match."})
        return data

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        password = validated_data.pop('password')
        user = User.objects.create(**validated_data)
        user.set_password(password)
        user.save()
        return user
