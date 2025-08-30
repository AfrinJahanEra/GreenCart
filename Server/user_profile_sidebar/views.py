from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db import connection, DatabaseError
import json
import os
import cloudinary
import cloudinary.uploader
from dotenv import load_dotenv

load_dotenv()

# Configure Cloudinary
cloudinary.config(
    cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
    api_key=os.getenv('CLOUDINARY_API_KEY'),
    api_secret=os.getenv('CLOUDINARY_API_SECRET')
)

# Utility function to get client IP
def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip

# Fetch user profile
@csrf_exempt
def user_profile_view(request, user_id):
    if request.method != 'GET':
        return JsonResponse({"error": "GET method required"}, status=405)
    
    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT 
                    u.user_id,
                    u.username,
                    u.email,
                    u.first_name,
                    u.last_name,
                    u.phone,
                    u.address,
                    u.profile_image,
                    u.created_at,
                    u.last_login,
                    r.role_name
                FROM users u
                LEFT JOIN user_roles ur ON u.user_id = ur.user_id
                LEFT JOIN roles r ON ur.role_id = r.role_id
                WHERE u.user_id = %s AND u.is_active = 1
            """, [user_id])
            
            row = cursor.fetchone()
            
        if not row:
            return JsonResponse({"error": "User not found or inactive"}, status=404)

        profile = {
            "user_id": row[0],
            "username": row[1],
            "email": row[2],
            "first_name": row[3],
            "last_name": row[4],
            "phone": row[5] or "",
            "address": row[6] or "",
            "profile_image": row[7] or "",
            "created_at": row[8].isoformat() if row[8] else None,
            "last_login": row[9].isoformat() if row[9] else None,
            "role": row[10] or "No role assigned"
        }
        return JsonResponse({"success": True, "profile": profile})
        
    except DatabaseError as e:
        return JsonResponse({"error": f"Database error: {str(e)}"}, status=500)
    except Exception as e:
        return JsonResponse({"error": f"Server error: {str(e)}"}, status=500)

# Update user profile
@csrf_exempt
def update_user_profile_view(request, requestor_id, user_id):
    if request.method != "POST":
        return JsonResponse({"error": "POST method required"}, status=405)

    try:
        # Handle both JSON and form data
        if request.content_type == 'application/json':
            data = json.loads(request.body)
        else:
            data = request.POST.dict()
        
        username = data.get("username")
        email = data.get("email")
        first_name = data.get("first_name")
        last_name = data.get("last_name")
        phone = data.get("phone")
        address = data.get("address")
        profile_image = data.get("profile_image")
        
        # Handle file upload if present
        if "profile_image" in request.FILES:
            try:
                upload_result = cloudinary.uploader.upload(request.FILES["profile_image"])
                profile_image = upload_result.get("secure_url")
            except Exception as e:
                return JsonResponse({"error": f"Image upload failed: {str(e)}"}, status=400)

        # Call the stored procedure
        with connection.cursor() as cursor:
            cursor.callproc(
                "update_user_profile",
                [requestor_id, user_id, username, email, first_name, last_name, phone, address, profile_image]
            )
            
        # Log the activity
        with connection.cursor() as cursor:
            cursor.execute("""
                INSERT INTO activity_log (user_id, activity_type, activity_details, ip_address)
                VALUES (%s, 'PROFILE_UPDATE', 'User updated their profile', %s)
            """, [requestor_id, get_client_ip(request)])
            
        return JsonResponse({"success": True, "message": "Profile updated successfully"})
        
    except DatabaseError as e:
        error_msg = str(e)
        if "ORA-20037" in error_msg:
            return JsonResponse({"error": "Email already in use by another account"}, status=400)
        elif "ORA-20038" in error_msg:
            return JsonResponse({"error": "Username already in use by another account"}, status=400)
        elif "ORA-20036" in error_msg:
            return JsonResponse({"error": "Not authorized to update this profile"}, status=403)
        elif "ORA-20039" in error_msg:
            return JsonResponse({"error": "User not found or no changes applied"}, status=404)
        else:
            return JsonResponse({"error": f"Database error: {error_msg}"}, status=500)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON format"}, status=400)
    except Exception as e:
        return JsonResponse({"error": f"Server error: {str(e)}"}, status=500)

# Delete user account
@csrf_exempt
def delete_user_account_view(request, requestor_id, user_id):
    if request.method != "POST":
        return JsonResponse({"error": "POST method required"}, status=405)

    try:
        # Call the stored procedure
        with connection.cursor() as cursor:
            cursor.callproc("delete_user_account", [requestor_id, user_id])
            
        # Log the activity
        with connection.cursor() as cursor:
            cursor.execute("""
                INSERT INTO activity_log (user_id, activity_type, activity_details, ip_address)
                VALUES (%s, 'ACCOUNT_DELETED', 'User account deleted', %s)
            """, [requestor_id, get_client_ip(request)])
            
        return JsonResponse({"success": True, "message": "Account deleted successfully"})
        
    except DatabaseError as e:
        error_msg = str(e)
        if "ORA-20042" in error_msg:
            return JsonResponse({"error": "Not authorized to delete this account"}, status=403)
        elif "ORA-20043" in error_msg:
            return JsonResponse({"error": "Cannot delete the last admin account"}, status=400)
        elif "ORA-20044" in error_msg:
            return JsonResponse({"error": "User not found"}, status=404)
        else:
            return JsonResponse({"error": f"Database error: {error_msg}"}, status=500)
    except Exception as e:
        return JsonResponse({"error": f"Server error: {str(e)}"}, status=500)

# Get all users (for testing and admin purposes)
@csrf_exempt
def get_all_users(request):
    if request.method != 'GET':
        return JsonResponse({"error": "GET method required"}, status=405)
    
    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT 
                    u.user_id, 
                    u.username, 
                    u.email, 
                    u.first_name, 
                    u.last_name,
                    u.phone,
                    u.address,
                    u.profile_image,
                    u.is_active,
                    u.created_at,
                    u.last_login,
                    r.role_name
                FROM users u
                LEFT JOIN user_roles ur ON u.user_id = ur.user_id
                LEFT JOIN roles r ON ur.role_id = r.role_id
                ORDER BY u.user_id
            """)
            
            users = []
            for row in cursor.fetchall():
                users.append({
                    "user_id": row[0],
                    "username": row[1],
                    "email": row[2],
                    "first_name": row[3],
                    "last_name": row[4],
                    "phone": row[5] or "",
                    "address": row[6] or "",
                    "profile_image": row[7] or "",
                    "is_active": bool(row[8]),
                    "created_at": row[9].isoformat() if row[9] else None,
                    "last_login": row[10].isoformat() if row[10] else None,
                    "role": row[11] or "No role assigned"
                })
            
            return JsonResponse({"success": True, "users": users, "count": len(users)})
            
    except DatabaseError as e:
        return JsonResponse({"error": f"Database error: {str(e)}"}, status=500)
    except Exception as e:
        return JsonResponse({"error": f"Server error: {str(e)}"}, status=500)

# Test Cloudinary upload
@csrf_exempt
def test_upload(request):
    if request.method != 'POST':
        return JsonResponse({"error": "POST method required"}, status=405)
    
    if 'file' not in request.FILES:
        return JsonResponse({"error": "No file provided"}, status=400)
    
    try:
        upload_result = cloudinary.uploader.upload(
            request.FILES['file'],
            folder="user_profiles",
            transformation=[
                {"width": 300, "height": 300, "crop": "fill"},
                {"quality": "auto"},
                {"format": "auto"}
            ]
        )
        
        return JsonResponse({
            "success": True,
            "url": upload_result.get("secure_url"),
            "public_id": upload_result.get("public_id"),
            "format": upload_result.get("format"),
            "width": upload_result.get("width"),
            "height": upload_result.get("height")
        })
    except Exception as e:
        return JsonResponse({"error": f"Upload failed: {str(e)}"}, status=500)

# Get user by email (useful for finding user IDs)
@csrf_exempt
def get_user_by_email(request):
    if request.method != 'POST':
        return JsonResponse({"error": "POST method required"}, status=405)
    
    try:
        data = json.loads(request.body)
        email = data.get('email')
        
        if not email:
            return JsonResponse({"error": "Email parameter required"}, status=400)
        
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT 
                    u.user_id,
                    u.username,
                    u.email,
                    u.first_name,
                    u.last_name,
                    r.role_name
                FROM users u
                LEFT JOIN user_roles ur ON u.user_id = ur.user_id
                LEFT JOIN roles r ON ur.role_id = r.role_id
                WHERE LOWER(u.email) = LOWER(%s) AND u.is_active = 1
            """, [email])
            
            row = cursor.fetchone()
            
        if not row:
            return JsonResponse({"error": "User not found"}, status=404)
            
        user_info = {
            "user_id": row[0],
            "username": row[1],
            "email": row[2],
            "first_name": row[3],
            "last_name": row[4],
            "role": row[5] or "No role assigned"
        }
        
        return JsonResponse({"success": True, "user": user_info})
        
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON format"}, status=400)
    except DatabaseError as e:
        return JsonResponse({"error": f"Database error: {str(e)}"}, status=500)
    except Exception as e:
        return JsonResponse({"error": f"Server error: {str(e)}"}, status=500)

# Get current user profile (based on session/token - you'll need to implement authentication)
@csrf_exempt
def get_current_user_profile(request):
    if request.method != 'GET':
        return JsonResponse({"error": "GET method required"}, status=405)
    
    # This is a placeholder - you'll need to implement proper authentication
    # For now, we'll get user_id from query parameters
    user_id = request.GET.get('user_id')
    
    if not user_id:
        return JsonResponse({"error": "User ID required"}, status=400)
    
    try:
        user_id = int(user_id)
        return user_profile_view(request, user_id)
    except ValueError:
        return JsonResponse({"error": "Invalid user ID"}, status=400)