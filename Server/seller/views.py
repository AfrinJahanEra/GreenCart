# seller/views.py
from django.http import JsonResponse
from django.db import connection
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json
import cloudinary
import cloudinary.uploader
import os
from dotenv import load_dotenv

load_dotenv()

# Cloudinary configuration
cloudinary.config(
    cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
    api_key=os.getenv('CLOUDINARY_API_KEY'),
    api_secret=os.getenv('CLOUDINARY_API_SECRET')
)

def dictfetchall(cursor):
    """Return all rows from a cursor as a list of dictionaries with proper type conversion"""
    columns = [col[0] for col in cursor.description]
    rows = []
    for row in cursor.fetchall():
        row_dict = dict(zip(columns, row))
        
        # Convert numeric fields to proper types
        for key, value in row_dict.items():
            if value is not None:
                # Convert decimal/numeric fields to float
                if key.lower() in ['base_price', 'unit_price', 'total_amount', 'seller_earnings', 'price_adjustment', 'stock_quantity']:
                    try:
                        row_dict[key] = float(value)
                    except (ValueError, TypeError):
                        pass  # Keep original value if conversion fails
                
                # Convert ID fields to int
                elif key.lower().endswith('_id') or key.lower() in ['quantity']:
                    try:
                        row_dict[key] = int(value)
                    except (ValueError, TypeError):
                        pass  # Keep original value if conversion fails
        
        rows.append(row_dict)
    return rows

@csrf_exempt
@require_http_methods(["GET"])
def seller_dashboard(request, seller_id):
    """Complete seller dashboard with all data - SIMPLIFIED VERSION"""
    try:
        with connection.cursor() as cursor:
            # 1. Get Seller Statistics
            cursor.execute("""
                SELECT 
                    (SELECT COUNT(*) FROM plants WHERE seller_id = %s AND is_active = 1) AS total_plants,
                    (
                        SELECT NVL(SUM(oi.quantity), 0) 
                        FROM order_items oi 
                        JOIN plants p ON oi.plant_id = p.plant_id 
                        JOIN orders o ON oi.order_id = o.order_id 
                        JOIN order_statuses os ON o.status_id = os.status_id
                        WHERE p.seller_id = %s 
                        AND os.status_name = 'Delivered'
                    ) AS total_sold,
                    (
                        SELECT NVL(SUM(oi.quantity * oi.unit_price * 0.9), 0) 
                        FROM order_items oi 
                        JOIN plants p ON oi.plant_id = p.plant_id 
                        JOIN orders o ON oi.order_id = o.order_id 
                        JOIN order_statuses os ON o.status_id = os.status_id
                        WHERE p.seller_id = %s 
                        AND os.status_name = 'Delivered'
                    ) AS total_earnings,
                    (
                        SELECT COUNT(*) FROM plants 
                        WHERE seller_id = %s AND stock_quantity < 10 AND is_active = 1
                    ) AS low_stock_count
                FROM dual
            """, [seller_id, seller_id, seller_id, seller_id])
            
            stats_result = cursor.fetchone()
            
            # 2. Get Recent Sales (last 5)
            cursor.execute("""
                SELECT 
                    o.order_id,
                    TO_CHAR(o.order_date, 'YYYY-MM-DD') AS order_date,
                    p.name AS plant_name,
                    oi.quantity,
                    (oi.quantity * oi.unit_price) AS total_amount
                FROM order_items oi
                JOIN plants p ON oi.plant_id = p.plant_id
                JOIN orders o ON oi.order_id = o.order_id
                JOIN order_statuses os ON o.status_id = os.status_id
                WHERE p.seller_id = %s
                AND os.status_name = 'Delivered'
                ORDER BY o.order_date DESC
                FETCH FIRST 5 ROWS ONLY
            """, [seller_id])
            
            columns = [col[0].lower() for col in cursor.description]
            recent_sales = []
            for row in cursor.fetchall():
                recent_sales.append(dict(zip(columns, row)))
            
            # 3. Get Low Stock Plants
            cursor.execute("""
                SELECT 
                    plant_id,
                    name,
                    stock_quantity,
                    base_price
                FROM plants
                WHERE seller_id = %s
                AND stock_quantity < 10
                AND is_active = 1
                ORDER BY stock_quantity ASC
            """, [seller_id])
            
            columns = [col[0].lower() for col in cursor.description]
            low_stock = []
            for row in cursor.fetchall():
                low_stock.append(dict(zip(columns, row)))
            
            # 4. Get All Plants with basic info, images, and categories in one query
            cursor.execute("""
                SELECT 
                    p.plant_id,
                    p.name,
                    DBMS_LOB.SUBSTR(p.description, 1000, 1) as description,
                    p.base_price,
                    p.stock_quantity,
                    p.created_at,
                    (SELECT image_url FROM plant_images WHERE plant_id = p.plant_id AND is_primary = 1 AND ROWNUM = 1) as primary_image,
                    LISTAGG(pc.name, ', ') WITHIN GROUP (ORDER BY pc.name) as categories
                FROM plants p
                LEFT JOIN plant_category_mapping pcm ON p.plant_id = pcm.plant_id
                LEFT JOIN plant_categories pc ON pcm.category_id = pc.category_id
                WHERE p.seller_id = %s
                AND p.is_active = 1
                GROUP BY p.plant_id, p.name, DBMS_LOB.SUBSTR(p.description, 1000, 1), 
                         p.base_price, p.stock_quantity, p.created_at
                ORDER BY p.created_at DESC
            """, [seller_id])
            
            columns = [col[0].lower() for col in cursor.description]
            plants = []
            for row in cursor.fetchall():
                plants.append(dict(zip(columns, row)))
            
            # Prepare stats data
            if stats_result:
                stats = {
                    'total_plants': stats_result[0] or 0,
                    'total_sold': stats_result[1] or 0,
                    'total_earnings': float(stats_result[2] or 0),
                    'low_stock_count': stats_result[3] or 0
                }
            else:
                stats = {
                    'total_plants': 0,
                    'total_sold': 0,
                    'total_earnings': 0.0,
                    'low_stock_count': 0
                }
            
            return JsonResponse({
                'success': True,
                'data': {
                    'stats': stats,
                    'recent_sales': recent_sales or [],
                    'low_stock_plants': low_stock or [],
                    'all_plants': plants or []
                }
            })
            
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': f'Dashboard error: {str(e)}'
        }, status=500)

@csrf_exempt
@require_http_methods(["GET"])
def seller_stats(request, seller_id):
    """Get seller statistics"""
    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT 
                    (SELECT COUNT(*) FROM plants WHERE seller_id = %s AND is_active = 1) AS total_plants,
                    (
                        SELECT NVL(SUM(oi.quantity), 0) 
                        FROM order_items oi 
                        JOIN plants p ON oi.plant_id = p.plant_id 
                        JOIN orders o ON oi.order_id = o.order_id 
                        JOIN order_statuses os ON o.status_id = os.status_id
                        WHERE p.seller_id = %s 
                        AND os.status_name = 'Delivered'
                    ) AS total_sold,
                    (
                        SELECT NVL(SUM(oi.quantity * oi.unit_price * 0.9), 0) 
                        FROM order_items oi 
                        JOIN plants p ON oi.plant_id = p.plant_id 
                        JOIN orders o ON oi.order_id = o.order_id 
                        JOIN order_statuses os ON o.status_id = os.status_id
                        WHERE p.seller_id = %s 
                        AND os.status_name = 'Delivered'
                    ) AS total_earnings
                FROM dual
            """, [seller_id, seller_id, seller_id])
            
            result = cursor.fetchone()
            
            if result:
                data = {
                    'total_plants': result[0] or 0,
                    'total_sold': result[1] or 0,
                    'total_earnings': float(result[2] or 0)
                }
            else:
                data = {
                    'total_plants': 0,
                    'total_sold': 0,
                    'total_earnings': 0.0
                }
            
            return JsonResponse({
                'success': True,
                'data': data
            })
            
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': f'Stats error: {str(e)}'
        }, status=500)

@csrf_exempt
@require_http_methods(["GET"])
def recent_sales(request, seller_id):
    """Get recent sales for a seller"""
    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT 
                    o.order_id,
                    TO_CHAR(o.order_date, 'YYYY-MM-DD') AS order_date,
                    p.name AS plant_name,
                    oi.quantity,
                    (oi.quantity * oi.unit_price) AS total_amount
                FROM order_items oi
                JOIN plants p ON oi.plant_id = p.plant_id
                JOIN orders o ON oi.order_id = o.order_id
                JOIN order_statuses os ON o.status_id = os.status_id
                WHERE p.seller_id = %s
                AND os.status_name = 'Delivered'
                ORDER BY o.order_date DESC
                FETCH FIRST 5 ROWS ONLY
            """, [seller_id])
            
            results = dictfetchall(cursor)
            
            return JsonResponse({
                'success': True,
                'data': results or []
            })
            
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': f'Recent sales error: {str(e)}'
        }, status=500)

@csrf_exempt
@require_http_methods(["GET"])
def low_stock_plants(request, seller_id):
    """Get low stock plants for a seller"""
    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT 
                    plant_id,
                    name,
                    stock_quantity,
                    base_price
                FROM plants
                WHERE seller_id = %s
                AND stock_quantity < 10
                AND is_active = 1
                ORDER BY stock_quantity ASC
            """, [seller_id])
            
            results = dictfetchall(cursor)
            
            return JsonResponse({
                'success': True,
                'data': results or []
            })
            
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': f'Low stock error: {str(e)}'
        }, status=500)

@csrf_exempt
@require_http_methods(["GET"])
def seller_plants(request, seller_id):
    """Get all plants for a seller - SIMPLIFIED VERSION"""
    try:
        with connection.cursor() as cursor:
            # Get all plants with their images and categories in one query
            cursor.execute("""
                SELECT 
                    p.plant_id,
                    p.name,
                    DBMS_LOB.SUBSTR(p.description, 1000, 1) as description,
                    p.base_price,
                    p.stock_quantity,
                    p.created_at,
                    (SELECT image_url FROM plant_images WHERE plant_id = p.plant_id AND is_primary = 1 AND ROWNUM = 1) as primary_image,
                    LISTAGG(pc.name, ', ') WITHIN GROUP (ORDER BY pc.name) as categories
                FROM plants p
                LEFT JOIN plant_category_mapping pcm ON p.plant_id = pcm.plant_id
                LEFT JOIN plant_categories pc ON pcm.category_id = pc.category_id
                WHERE p.seller_id = %s
                AND p.is_active = 1
                GROUP BY p.plant_id, p.name, DBMS_LOB.SUBSTR(p.description, 1000, 1), 
                         p.base_price, p.stock_quantity, p.created_at
                ORDER BY p.created_at DESC
            """, [seller_id])
            
            # Use the improved dictfetchall
            columns = [col[0].lower() for col in cursor.description]
            plants = []
            for row in cursor.fetchall():
                plant_dict = dict(zip(columns, row))
                plants.append(plant_dict)
            
            return JsonResponse({
                'success': True,
                'data': plants or []
            })
            
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': f'Database error: {str(e)}'
        }, status=500)

@csrf_exempt
@require_http_methods(["GET"])
def sales_records(request, seller_id):
    """Get sales records for a seller"""
    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT 
                    o.order_id,
                    o.order_number,
                    TO_CHAR(o.order_date, 'YYYY-MM-DD') AS order_date,
                    p.name AS plant_name,
                    oi.quantity,
                    oi.unit_price,
                    (oi.quantity * oi.unit_price) AS total_amount,
                    (oi.quantity * oi.unit_price * 0.9) AS seller_earnings,
                    os.status_name AS order_status
                FROM order_items oi
                JOIN plants p ON oi.plant_id = p.plant_id
                JOIN orders o ON oi.order_id = o.order_id
                JOIN order_statuses os ON o.status_id = os.status_id
                WHERE p.seller_id = %s
                ORDER BY o.order_date DESC
            """, [seller_id])
            
            results = dictfetchall(cursor)
            
            return JsonResponse({
                'success': True,
                'data': results or []
            })
            
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': f'Sales records error: {str(e)}'
        }, status=500)

@csrf_exempt
@require_http_methods(["GET"])
def get_categories(request):
    """Get all available plant categories"""
    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT category_id, name, slug, description
                FROM plant_categories
                ORDER BY name
            """)
            
            results = dictfetchall(cursor)
            
            if not results:
                default_categories = [
                    ('Indoor Plants', 'indoor-plants', 'Plants perfect for indoor environments'),
                    ('Outdoor Plants', 'outdoor-plants', 'Plants suitable for outdoor gardens'),
                    ('Flowering Plants', 'flowering-plants', 'Beautiful flowering plants'),
                    ('Succulents', 'succulents', 'Low maintenance succulent plants'),
                    ('Herbs', 'herbs', 'Culinary and medicinal herbs')
                ]
                
                for name, slug, description in default_categories:
                    cursor.execute("""
                        INSERT INTO plant_categories (name, slug, description)
                        VALUES (%s, %s, %s)
                    """, [name, slug, description])
                
                cursor.execute("""
                    SELECT category_id, name, slug, description
                    FROM plant_categories
                    ORDER BY name
                """)
                results = dictfetchall(cursor)
            
            return JsonResponse({
                'success': True,
                'categories': results or []
            })
            
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': f'Categories error: {str(e)}'
        }, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def add_plant(request):
    """Add a new plant with image upload to Cloudinary - WITH CATEGORY VALIDATION"""
    try:
        if request.content_type == 'application/json':
            data = json.loads(request.body)
            images = []
        else:
            data = request.POST.dict()
            images = request.FILES.getlist('images')
        
        seller_id = int(data.get('seller_id'))
        name = data.get('name')
        description = data.get('description')
        base_price = float(data.get('base_price'))
        stock_quantity = int(data.get('stock_quantity'))
        category_ids = data.get('category_ids', '')
        features = data.get('features', '')
        care_tips = data.get('care_tips', '')
        sizes = data.get('sizes', '')
        
        category_id_list = []
        if category_ids:
            category_id_list = [int(cid.strip()) for cid in category_ids.split(',') if cid.strip()]
            
            with connection.cursor() as cursor:
                if category_id_list:
                    placeholders = ','.join(['%s'] * len(category_id_list))
                    cursor.execute(f"""
                        SELECT COUNT(*) FROM plant_categories 
                        WHERE category_id IN ({placeholders})
                    """, category_id_list)
                    
                    valid_categories_count = cursor.fetchone()[0]
                    
                    if valid_categories_count != len(category_id_list):
                        return JsonResponse({
                            'success': False,
                            'error': 'One or more category IDs are invalid. Use /seller/categories/ to get valid categories.'
                        }, status=400)
        
        image_urls = []
        
        if images:
            for image_file in images:
                upload_result = cloudinary.uploader.upload(
                    image_file,
                    folder="plants/"
                )
                image_urls.append(upload_result['secure_url'])
        else:
            image_urls_str = data.get('images', '')
            if image_urls_str:
                image_urls = [url.strip() for url in image_urls_str.split(',') if url.strip()]
        
        image_urls_str = ','.join(image_urls)
        
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT COUNT(*) 
                FROM users u
                JOIN user_roles ur ON u.user_id = ur.user_id
                JOIN roles r ON ur.role_id = r.role_id
                WHERE u.user_id = %s AND r.role_name = 'seller'
            """, [seller_id])
            
            seller_count = cursor.fetchone()[0]
            
            if seller_count == 0:
                return JsonResponse({
                    'success': False,
                    'error': 'User is not a seller. Please register as a seller first.'
                }, status=400)
            
            cursor.execute("""
                INSERT INTO plants (name, description, base_price, stock_quantity, seller_id, created_at, is_active)
                VALUES (%s, %s, %s, %s, %s, SYSTIMESTAMP, 1)
            """, [name, description, base_price, stock_quantity, seller_id])
            
            cursor.execute("SELECT seq_plants.CURRVAL FROM dual")
            new_plant_id = cursor.fetchone()[0]
            
            if category_ids and category_id_list:
                for category_id in category_id_list:
                    cursor.execute("""
                        INSERT INTO plant_category_mapping (plant_id, category_id)
                        VALUES (%s, %s)
                    """, [new_plant_id, category_id])
            
            if image_urls:
                for i, image_url in enumerate(image_urls):
                    is_primary = 1 if i == 0 else 0
                    cursor.execute("""
                        INSERT INTO plant_images (plant_id, image_url, is_primary)
                        VALUES (%s, %s, %s)
                    """, [new_plant_id, image_url, is_primary])
            
            if features:
                feature_list = [f.strip() for f in features.split(',') if f.strip()]
                for feature in feature_list:
                    cursor.execute("""
                        INSERT INTO plant_features (plant_id, feature_text)
                        VALUES (%s, %s)
                    """, [new_plant_id, feature])
            
            if care_tips:
                care_tip_list = [tip.strip() for tip in care_tips.split(',') if tip.strip()]
                for care_tip in care_tip_list:
                    cursor.execute("""
                        INSERT INTO plant_care_tips (plant_id, tip_text)
                        VALUES (%s, %s)
                    """, [new_plant_id, care_tip])
            
            if sizes:
                size_list = [s.strip() for s in sizes.split(',') if s.strip()]
                for size_info in size_list:
                    if ':' in size_info:
                        size_name, price_adj = size_info.split(':', 1)
                        try:
                            price_adjustment = float(price_adj.strip())
                            cursor.execute("""
                                INSERT INTO plant_sizes (plant_id, size_name, price_adjustment)
                                VALUES (%s, %s, %s)
                            """, [new_plant_id, size_name.strip(), price_adjustment])
                        except ValueError:
                            pass
            
            return JsonResponse({
                'success': True,
                'message': 'Plant added successfully',
                'plant_id': new_plant_id,
                'image_urls': image_urls
            })
            
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)

@csrf_exempt
@require_http_methods(["PUT"])
def update_plant(request, plant_id):
    """Update plant details"""
    try:
        data = json.loads(request.body)
        requestor_id = data.get('requestor_id')
        
        with connection.cursor() as cursor:
            cursor.callproc('update_plant_details', [
                int(requestor_id), 
                int(plant_id),
                data.get('name'),
                data.get('description'),
                float(data.get('base_price')) if data.get('base_price') else None,
                int(data.get('stock_quantity')) if data.get('stock_quantity') else None,
                data.get('category_ids'),
                data.get('images'),
                data.get('features'),
                data.get('care_tips'),
                data.get('sizes')
            ])
            
            return JsonResponse({
                'success': True,
                'message': 'Plant updated successfully'
            })
            
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)

@csrf_exempt
@require_http_methods(["GET"])
def plant_details(request, plant_id):
    """Get plant details for editing"""
    try:
        with connection.cursor() as cursor:
            result_cursor = cursor.connection.cursor()
            cursor.callproc('get_plant_details', [plant_id, result_cursor])
            results = dictfetchall(result_cursor)
            result_cursor.close()
            
            return JsonResponse({
                'success': True,
                'data': results[0] if results else {}
            })
            
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def upload_images(request):
    """Upload multiple images to Cloudinary and return URLs"""
    try:
        if 'images' not in request.FILES:
            return JsonResponse({
                'success': False,
                'error': 'No image files provided'
            }, status=400)
        
        image_urls = []
        image_files = request.FILES.getlist('images')
        
        for image_file in image_files:
            upload_result = cloudinary.uploader.upload(
                image_file,
                folder="plants/"
            )
            image_urls.append({
                'url': upload_result['secure_url'],
                'public_id': upload_result['public_id'],
                'filename': image_file.name
            })
        
        return JsonResponse({
            'success': True,
            'images': image_urls
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def record_manual_sale(request):
    """Record a manual sale for a seller"""
    try:
        data = json.loads(request.body)
        seller_id = data.get('seller_id')
        plant_id = data.get('plant_id')
        quantity = int(data.get('quantity', 1))
        customer_email = data.get('customer_email')
        sale_price = float(data.get('sale_price', 0))
        
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT stock_quantity, base_price 
                FROM plants 
                WHERE plant_id = %s AND seller_id = %s AND is_active = 1
            """, [plant_id, seller_id])
            
            plant_data = cursor.fetchone()
            if not plant_data:
                return JsonResponse({
                    'success': False,
                    'error': 'Plant not found or not owned by seller'
                }, status=400)
            
            stock_quantity, base_price = plant_data
            
            if stock_quantity < quantity:
                return JsonResponse({
                    'success': False,
                    'error': f'Insufficient stock. Only {stock_quantity} available.'
                }, status=400)
            
            if sale_price <= 0:
                sale_price = base_price
            
            cursor.execute("""
                INSERT INTO orders (
                    order_number, user_id, status_id, total_amount, order_date,
                    delivery_address, payment_status, delivery_method_id
                ) VALUES (
                    'MANUAL_' || TO_CHAR(SYSTIMESTAMP, 'YYYYMMDDHH24MISS') || '_' || %s,
                    (SELECT user_id FROM users WHERE email = %s AND ROWNUM = 1),
                    (SELECT status_id FROM order_statuses WHERE status_name = 'Delivered'),
                    %s,
                    SYSTIMESTAMP,
                    'Manual Sale - No Delivery',
                    'Completed',
                    1
                )
            """, [seller_id, customer_email, sale_price * quantity])
            
            cursor.execute("SELECT seq_orders.CURRVAL FROM dual")
            order_id = cursor.fetchone()[0]
            
            cursor.execute("""
                INSERT INTO order_items (order_id, plant_id, quantity, unit_price)
                VALUES (%s, %s, %s, %s)
            """, [order_id, plant_id, quantity, sale_price])
            
            cursor.execute("""
                UPDATE plants 
                SET stock_quantity = stock_quantity - %s
                WHERE plant_id = %s
            """, [quantity, plant_id])
            
            return JsonResponse({
                'success': True,
                'message': 'Manual sale recorded successfully',
                'order_id': order_id,
                'total_amount': sale_price * quantity
            })
            
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)

@csrf_exempt
@require_http_methods(["GET"])
def test_connection(request):
    """Test database connection"""
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1 FROM dual")
            result = cursor.fetchone()
            
            return JsonResponse({
                'success': True,
                'test_result': result[0] if result else None,
                'message': 'Database connection successful'
            })
            
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)

@csrf_exempt
@require_http_methods(["GET"])
def debug_seller(request, seller_id):
    """Debug seller information and database structure"""
    try:
        with connection.cursor() as cursor:
            debug_info = {
                'seller_id': seller_id,
                'database_checks': {}
            }
            
            # Check if user exists
            cursor.execute("SELECT user_id, username, email, first_name, last_name, is_active FROM users WHERE user_id = %s", [seller_id])
            user_result = cursor.fetchone()
            debug_info['user'] = user_result
            
            # Check user roles
            cursor.execute("""
                SELECT r.role_name 
                FROM user_roles ur
                JOIN roles r ON ur.role_id = r.role_id
                WHERE ur.user_id = %s
            """, [seller_id])
            roles_result = cursor.fetchall()
            debug_info['roles'] = [role[0] for role in roles_result] if roles_result else []
            
            # Check if seller role exists
            cursor.execute("SELECT role_id, role_name FROM roles WHERE role_name = 'seller'")
            seller_role_result = cursor.fetchone()
            debug_info['seller_role_exists'] = seller_role_result is not None
            
            # Check plants table structure
            try:
                cursor.execute("""
                    SELECT column_name, data_type 
                    FROM user_tab_columns 
                    WHERE table_name = 'PLANTS'
                    ORDER BY column_id
                """)
                columns_result = cursor.fetchall()
                debug_info['plants_table_columns'] = [{'name': col[0], 'type': col[1]} for col in columns_result]
            except Exception as e:
                debug_info['plants_table_columns'] = f"Error: {str(e)}"
            
            # Check plants for this seller using different approaches
            plants_checks = {}
            
            # Try uppercase
            try:
                cursor.execute("SELECT COUNT(*) FROM PLANTS WHERE SELLER_ID = %s", [seller_id])
                plants_checks['uppercase_count'] = cursor.fetchone()[0]
            except Exception as e:
                plants_checks['uppercase_error'] = str(e)
            
            # Try lowercase
            try:
                cursor.execute("SELECT COUNT(*) FROM plants WHERE seller_id = %s", [seller_id])
                plants_checks['lowercase_count'] = cursor.fetchone()[0]
            except Exception as e:
                plants_checks['lowercase_error'] = str(e)
            
            # Try simple select all from plants
            try:
                cursor.execute("SELECT * FROM plants WHERE ROWNUM <= 1")
                sample_plant = dictfetchall(cursor)
                plants_checks['sample_plant_structure'] = sample_plant[0] if sample_plant else None
            except Exception as e:
                plants_checks['sample_plant_error'] = str(e)
            
            debug_info['plants_checks'] = plants_checks
            
            return JsonResponse({
                'success': True,
                'debug_info': debug_info
            })
            
    except Exception as e:
        import traceback
        return JsonResponse({
            'success': False,
            'error': str(e),
            'traceback': traceback.format_exc()
        }, status=500)