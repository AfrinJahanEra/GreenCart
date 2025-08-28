from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db import connection, DatabaseError
import json
import hashlib
from datetime import datetime


# views.py
@csrf_exempt
def signup(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST required"}, status=405)

    try:
        data = json.loads(request.body)
        
        # Validate required fields
        required_fields = ["username", "email", "password", "first_name", "last_name", "role_name"]
        for field in required_fields:
            if field not in data or not data[field]:
                return JsonResponse({"error": f"{field} is required"}, status=400)

        # Hash the password using SHA256
        password = data.get("password")
        password_hash = hashlib.sha256(password.encode()).hexdigest()

        # Check if secret key is required
        role_name = data.get("role_name")
        secret_key = data.get("secret_key", "")
        
        if role_name in ["admin", "seller", "delivery_agent"] and not secret_key:
            return JsonResponse({"error": f"Secret key is required for {role_name} role"}, status=400)

        with connection.cursor() as cursor:
            if role_name in ["admin", "seller", "delivery_agent"]:
                # Call the procedure with secret key for privileged roles
                cursor.callproc("signup_user", [
                    data.get("username"),
                    data.get("email"),
                    password_hash,
                    data.get("first_name"),
                    data.get("last_name"),
                    data.get("phone"),
                    data.get("address"),
                    role_name,
                    secret_key
                ])
            else:
                # Call the procedure without secret key for customer role
                cursor.callproc("signup_user", [
                    data.get("username"),
                    data.get("email"),
                    password_hash,
                    data.get("first_name"),
                    data.get("last_name"),
                    data.get("phone"),
                    data.get("address"),
                    role_name
                ])

        return JsonResponse({"message": "Signup successful"}, status=201)

    except DatabaseError as e:
        return JsonResponse({"error": str(e)}, status=400)
    except Exception as e:
        return JsonResponse({"error": "Signup failed: " + str(e)}, status=500)


@csrf_exempt
def login(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST required"}, status=405)

    try:
        data = json.loads(request.body)
        username = data.get("username")
        password = data.get("password")
        
        if not username or not password:
            return JsonResponse({"error": "Username and password are required"}, status=400)

        # Hash the password using SHA256
        password_hash = hashlib.sha256(password.encode()).hexdigest()

        with connection.cursor() as cursor:
            # Fetch user details and role from user_roles and roles tables
            cursor.execute("""
                SELECT u.user_id, u.username, u.email, r.role_name
                FROM users u
                LEFT JOIN user_roles ur ON u.user_id = ur.user_id
                LEFT JOIN roles r ON ur.role_id = r.role_id
                WHERE u.username = %s AND u.password_hash = %s AND u.is_active = 1
            """, [username, password_hash])
            user = cursor.fetchone()

        if user:
            # Generate a token
            token = hashlib.sha256(f"{username}{datetime.now()}".encode()).hexdigest()
            
            return JsonResponse({
                "message": "Login successful",
                "token": token,
                "user": {
                    "id": user[0],
                    "username": user[1],
                    "email": user[2],
                    "role": user[3] or "customer" 
                }
            }, status=200)
        else:
            return JsonResponse({"error": "Invalid username or password"}, status=401)

    except DatabaseError as e:
        return JsonResponse({"error": str(e)}, status=400)
    except Exception as e:
        return JsonResponse({"error": "Login failed: " + str(e)}, status=500)