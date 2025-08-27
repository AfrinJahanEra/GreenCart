from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db import connection, DatabaseError
import json
import hashlib


@csrf_exempt
def signup(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST required"}, status=405)

    try:
        data = json.loads(request.body)

        with connection.cursor() as cursor:
            password = data.get("password")
            password_hash = hashlib.sha256(password.encode()).hexdigest() if password else None
            cursor.callproc("signup_user", [
                data.get("username"),
                data.get("email"),
                password_hash,
                data.get("first_name"),
                data.get("last_name"),
                data.get("phone"),
                data.get("address")
            ])

        return JsonResponse({"message": "Signup successful"}, status=201)

    except DatabaseError as e:
        return JsonResponse({"error": str(e)}, status=400)


@csrf_exempt
def login(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST required"}, status=405)

    try:
        data = json.loads(request.body)
        username = data.get("username")
        password = data.get("password")

        with connection.cursor() as cursor:
            cursor.callproc("test_login_user", [username, password])
            cursor.execute("""
                SELECT user_id, username, email
                FROM users
                WHERE username = :u AND password_hash = :p
            """, {"u": username, "p": password})
            user = cursor.fetchone()

        if user:
            return JsonResponse({
                "message": "Login successful",
                "user": {
                    "id": user[0],
                    "username": user[1],
                    "email": user[2]
                }
            })
        else:
            return JsonResponse({"error": "Invalid username or password"}, status=401)

    except DatabaseError as e:
        return JsonResponse({"error": str(e)}, status=400)
