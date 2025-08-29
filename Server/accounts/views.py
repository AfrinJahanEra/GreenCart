from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db import connection
import json
import hashlib

def get_client_ip(request):
    """Get the client's IP address from the request"""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip

@csrf_exempt
def signup(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            
            # Extract data from request
            username = data.get('username')
            email = data.get('email')
            password = data.get('password')
            first_name = data.get('first_name')
            last_name = data.get('last_name')
            phone = data.get('phone')
            address = data.get('address')
            role_name = data.get('role_name', 'customer')
            secret_key = data.get('secret_key')
            
            # Validate required fields
            if not all([username, email, password, first_name, last_name]):
                return JsonResponse({
                    'success': False,
                    'message': 'Missing required fields'
                }, status=400)
            
            # Hash password
            password_hash = hashlib.sha256(password.encode()).hexdigest()
            
            # Call the PL/SQL procedure
            with connection.cursor() as cursor:
                try:
                    if secret_key:
                        cursor.callproc('signup_user', [
                            username, email, password_hash, first_name, 
                            last_name, phone, address, role_name, secret_key
                        ])
                    else:
                        cursor.callproc('signup_user', [
                            username, email, password_hash, first_name, 
                            last_name, phone, address, role_name
                        ])
                    
                    return JsonResponse({
                        'success': True,
                        'message': 'User created successfully'
                    })
                    
                except Exception as e:
                    return JsonResponse({
                        'success': False,
                        'message': f'Database error: {str(e)}'
                    }, status=400)
                
        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': f'Server error: {str(e)}'
            }, status=500)
    
    return JsonResponse({
        'success': False,
        'message': 'Method not allowed'
    }, status=405)

@csrf_exempt
def login(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            
            email = data.get('email')
            password = data.get('password')
            
            if not email or not password:
                return JsonResponse({
                    'success': False,
                    'message': 'Email and password are required'
                }, status=400)
            
            # Get client IP address
            ip_address = get_client_ip(request)
            
            # Hash password to match the stored hash
            password_hash = hashlib.sha256(password.encode()).hexdigest()
            
            # Call the PL/SQL function
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT user_login_func(:email, :password, :ip_address) FROM dual
                """, {
                    'email': email,
                    'password': password_hash,
                    'ip_address': ip_address
                })
                
                result = cursor.fetchone()[0]
                
                if result == 'LOGIN SUCCESSFUL':
                    # Get user details
                    cursor.execute("""
                        SELECT u.user_id, u.username, u.email, u.first_name, u.last_name, 
                               r.role_name, u.phone, u.address
                        FROM users u
                        JOIN user_roles ur ON u.user_id = ur.user_id
                        JOIN roles r ON ur.role_id = r.role_id
                        WHERE u.email = :email
                    """, {'email': email})
                    
                    user_data = cursor.fetchone()
                    
                    if user_data:
                        user_info = {
                            'user_id': user_data[0],
                            'username': user_data[1],
                            'email': user_data[2],
                            'first_name': user_data[3],
                            'last_name': user_data[4],
                            'role': user_data[5],
                            'phone': user_data[6] or '',
                            'address': user_data[7] or ''
                        }
                        
                        return JsonResponse({
                            'success': True,
                            'message': 'Login successful',
                            'user': user_info
                        })
                    else:
                        return JsonResponse({
                            'success': False,
                            'message': 'User not found after successful login'
                        }, status=500)
                
                return JsonResponse({
                    'success': False,
                    'message': result
                }, status=401)
                
        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': f'Login error: {str(e)}'
            }, status=500)
    
    return JsonResponse({
        'success': False,
        'message': 'Method not allowed'
    }, status=405)