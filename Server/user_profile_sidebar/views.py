from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db import connection, DatabaseError
import json
import os
import cloudinary
from dotenv import load_dotenv

load_dotenv()

cloudinary.config(
    cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
    api_key=os.getenv('CLOUDINARY_API_KEY'),
    api_secret=os.getenv('CLOUDINARY_API_SECRET')
)

# Fetch user profile
@csrf_exempt
def user_profile_view(request, user_id):
    with connection.cursor() as cursor:
        out_cursor = cursor.connection.cursor()
        try:
            cursor.callproc("get_user_profile", [user_id, out_cursor])
            row = out_cursor.fetchone()
        except DatabaseError as e:
            return JsonResponse({"error": str(e)}, status=400)
        finally:
            out_cursor.close()

    if not row:
        return JsonResponse({"error": "User not found"}, status=404)

    profile = {
        "user_id": row[0],
        "name": row[1],
        "email": row[2],
        "phone": row[3],
        "address": row[4],
        "profile_image": row[5]
    }
    return JsonResponse(profile)

# Update user profile
@csrf_exempt
def update_user_profile_view(request, requestor_id, user_id):
    if request.method != "POST":
        return JsonResponse({"error": "POST required"}, status=400)

    data = json.loads(request.body)
    username = data.get("username")
    email = data.get("email")
    first_name = data.get("first_name")
    last_name = data.get("last_name")
    phone = data.get("phone")
    address = data.get("address")
    profile_image = None

    if "profile_image" in request.FILES:
        upload_result = cloudinary.uploader.upload(request.FILES["profile_image"])
        profile_image = upload_result.get("secure_url")

    with connection.cursor() as cursor:
        try:
            cursor.callproc(
                "update_user_profile",
                [requestor_id, user_id, username, email, first_name, last_name, phone, address, profile_image]
            )
        except DatabaseError as e:
            return JsonResponse({"error": str(e)}, status=400)

    return JsonResponse({"success": True})

# Delete user account
@csrf_exempt
def delete_user_account_view(request, requestor_id, user_id):
    if request.method != "POST":
        return JsonResponse({"error": "POST required"}, status=400)

    with connection.cursor() as cursor:
        try:
            cursor.callproc("delete_user_account", [requestor_id, user_id])
        except DatabaseError as e:
            return JsonResponse({"error": str(e)}, status=400)

    return JsonResponse({"success": True})
