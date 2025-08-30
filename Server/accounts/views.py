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
            
            # Simple direct database check (no PL/SQL function needed)
            with connection.cursor() as cursor:
                # Check if user exists and credentials match
                cursor.execute("""
                    SELECT u.user_id, u.username, u.email, u.first_name, u.last_name, 
                           r.role_name, u.phone, u.address, u.is_active, u.password_hash
                    FROM users u
                    JOIN user_roles ur ON u.user_id = ur.user_id
                    JOIN roles r ON ur.role_id = r.role_id
                    WHERE u.email = :email
                """, {'email': email})
                
                user_data = cursor.fetchone()
                
                if not user_data:
                    # Log failed login attempt
                    cursor.execute("""
                        INSERT INTO activity_log (activity_type, activity_details, ip_address)
                        VALUES ('LOGIN_FAILED', 'User not found: ' || :email, :ip_address)
                    """, {'email': email, 'ip_address': ip_address})
                    
                    return JsonResponse({
                        'success': False,
                        'message': 'USER NOT FOUND'
                    }, status=401)
                
                # Extract user data
                user_id, username, user_email, first_name, last_name, role, phone, address, is_active, stored_hash = user_data
                
                # Check if account is active
                if is_active == 0:
                    cursor.execute("""
                        INSERT INTO activity_log (user_id, activity_type, activity_details, ip_address)
                        VALUES (:user_id, 'LOGIN_FAILED', 'Account inactive', :ip_address)
                    """, {'user_id': user_id, 'ip_address': ip_address})
                    
                    return JsonResponse({
                        'success': False,
                        'message': 'ACCOUNT INACTIVE'
                    }, status=401)
                
                # Check password
                if stored_hash != password_hash:
                    cursor.execute("""
                        INSERT INTO activity_log (user_id, activity_type, activity_details, ip_address)
                        VALUES (:user_id, 'LOGIN_FAILED', 'Invalid password', :ip_address)
                    """, {'user_id': user_id, 'ip_address': ip_address})
                    
                    return JsonResponse({
                        'success': False,
                        'message': 'INVALID CREDENTIALS'
                    }, status=401)
                
                # Successful login - update last login and log activity
                cursor.execute("""
                    UPDATE users 
                    SET last_login = SYSTIMESTAMP 
                    WHERE user_id = :user_id
                """, {'user_id': user_id})
                
                cursor.execute("""
                    INSERT INTO activity_log (user_id, activity_type, activity_details, ip_address)
                    VALUES (:user_id, 'LOGIN', 'User logged in successfully', :ip_address)
                """, {'user_id': user_id, 'ip_address': ip_address})
                
                # Prepare user info
                user_info = {
                    'user_id': user_id,
                    'username': username,
                    'email': user_email,
                    'first_name': first_name,
                    'last_name': last_name,
                    'role': role,
                    'phone': phone or '',
                    'address': address or ''
                }
                
                return JsonResponse({
                    'success': True,
                    'message': 'Login successful',
                    'user': user_info
                })
                
        except Exception as e:
            # Log the error
            try:
                with connection.cursor() as cursor:
                    cursor.execute("""
                        INSERT INTO activity_log (activity_type, activity_details, ip_address)
                        VALUES ('LOGIN_ERROR', 'Server error: ' || :error, :ip_address)
                    """, {'error': str(e), 'ip_address': get_client_ip(request)})
            except:
                pass
            
            return JsonResponse({
                'success': False,
                'message': f'Login error: {str(e)}'
            }, status=500)
    
    return JsonResponse({
        'success': False,
        'message': 'Method not allowed'
    }, status=405)