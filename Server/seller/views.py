# views.py - Complete fixed version
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
    """Return all rows from a cursor as a list of dictionaries"""
    columns = [col[0] for col in cursor.description]
    return [dict(zip(columns, row)) for row in cursor.fetchall()]

# views.py - Update the add_plant function
@csrf_exempt
@require_http_methods(["POST"])
def add_plant(request):
    """Add a new plant with image upload to Cloudinary - USING FUNCTION"""
    try:
        # Handle both JSON data and file uploads
        if request.content_type == 'application/json':
            data = json.loads(request.body)
            images = []
        else:
            # Handle form data with files
            data = request.POST.dict()
            images = request.FILES.getlist('images')
        
        # Extract and validate required fields
        seller_id = int(data.get('seller_id'))
        name = data.get('name')
        description = data.get('description')
        base_price = float(data.get('base_price'))
        stock_quantity = int(data.get('stock_quantity'))
        category_ids = data.get('category_ids', '')
        features = data.get('features', '')
        care_tips = data.get('care_tips', '')
        sizes = data.get('sizes', '')
        
        # Handle image uploads
        image_urls = []
        
        # If images are passed as files, upload to Cloudinary
        if images:
            for image_file in images:
                upload_result = cloudinary.uploader.upload(
                    image_file,
                    folder="plants/"
                )
                image_urls.append(upload_result['secure_url'])
        else:
            # If images are passed as URLs (comma-separated string)
            image_urls_str = data.get('images', '')
            if image_urls_str:
                image_urls = [url.strip() for url in image_urls_str.split(',') if url.strip()]
        
        image_urls_str = ','.join(image_urls)
        
        with connection.cursor() as cursor:
            # First check if user is a seller
            cursor.execute("""
                SELECT COUNT(*) 
                FROM users u
                JOIN user_roles ur ON u.user_id = ur.user_id
                JOIN roles r ON ur.role_id = r.role_id
                WHERE u.user_id = :seller_id AND r.role_name = 'seller'
            """, {'seller_id': seller_id})
            
            seller_count = cursor.fetchone()[0]
            
            if seller_count == 0:
                return JsonResponse({
                    'success': False,
                    'error': 'User is not a seller. Please register as a seller first.'
                }, status=400)
            
            # Call the Oracle FUNCTION
            cursor.execute("""
                SELECT add_plant_func(
                    :name, :description, :base_price, :stock_quantity, 
                    :seller_id, :category_ids, :images, :features, 
                    :care_tips, :sizes
                ) FROM dual
            """, {
                'name': name,
                'description': description,
                'base_price': base_price,
                'stock_quantity': stock_quantity,
                'seller_id': seller_id,
                'category_ids': category_ids,
                'images': image_urls_str,
                'features': features,
                'care_tips': care_tips,
                'sizes': sizes
            })
            
            # Get the returned plant_id
            result = cursor.fetchone()
            new_plant_id = result[0] if result else None
            
            if new_plant_id:
                return JsonResponse({
                    'success': True,
                    'message': 'Plant added successfully',
                    'plant_id': new_plant_id,
                    'image_urls': image_urls
                })
            else:
                return JsonResponse({
                    'success': False,
                    'error': 'Failed to add plant'
                }, status=500)
            
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
            # Upload to Cloudinary
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
@require_http_methods(["GET"])
def seller_stats(request, seller_id):
    """Get seller statistics"""
    try:
        with connection.cursor() as cursor:
            result_cursor = cursor.connection.cursor()
            cursor.callproc('get_seller_stats', [seller_id, result_cursor])
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
@require_http_methods(["GET"])
def recent_sales(request, seller_id):
    """Get recent sales for a seller"""
    try:
        with connection.cursor() as cursor:
            result_cursor = cursor.connection.cursor()
            cursor.callproc('get_recent_sales', [seller_id, result_cursor])
            results = dictfetchall(result_cursor)
            result_cursor.close()
            
            return JsonResponse({
                'success': True,
                'data': results
            })
            
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)
    


# views.py - Add these functions
@csrf_exempt
@require_http_methods(["GET"])
def get_categories(request):
    """Get all available plant categories"""
    try:
        with connection.cursor() as cursor:
            # Call the function to get categories
            cursor.execute("SELECT get_plant_categories() FROM dual")
            result_cursor = cursor.fetchone()[0]
            
            results = dictfetchall(result_cursor)
            result_cursor.close()
            
            return JsonResponse({
                'success': True,
                'categories': results
            })
            
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def add_plant(request):
    """Add a new plant with image upload to Cloudinary - WITH CATEGORY VALIDATION"""
    try:
        # Handle both JSON data and file uploads
        if request.content_type == 'application/json':
            data = json.loads(request.body)
            images = []
        else:
            # Handle form data with files
            data = request.POST.dict()
            images = request.FILES.getlist('images')
        
        # Extract and validate required fields
        seller_id = int(data.get('seller_id'))
        name = data.get('name')
        description = data.get('description')
        base_price = float(data.get('base_price'))
        stock_quantity = int(data.get('stock_quantity'))
        category_ids = data.get('category_ids', '')
        features = data.get('features', '')
        care_tips = data.get('care_tips', '')
        sizes = data.get('sizes', '')
        
        # Validate categories exist
        if category_ids:
            category_id_list = [int(cid.strip()) for cid in category_ids.split(',') if cid.strip()]
            
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT COUNT(*) FROM plant_categories 
                    WHERE category_id IN :category_ids
                """, {'category_ids': tuple(category_id_list)})
                
                valid_categories_count = cursor.fetchone()[0]
                
                if valid_categories_count != len(category_id_list):
                    return JsonResponse({
                        'success': False,
                        'error': 'One or more category IDs are invalid. Use /api/categories/ to get valid categories.'
                    }, status=400)
        
        # Handle image uploads
        image_urls = []
        
        # If images are passed as files, upload to Cloudinary
        if images:
            for image_file in images:
                upload_result = cloudinary.uploader.upload(
                    image_file,
                    folder="plants/"
                )
                image_urls.append(upload_result['secure_url'])
        else:
            # If images are passed as URLs (comma-separated string)
            image_urls_str = data.get('images', '')
            if image_urls_str:
                image_urls = [url.strip() for url in image_urls_str.split(',') if url.strip()]
        
        image_urls_str = ','.join(image_urls)
        
        with connection.cursor() as cursor:
            # First check if user is a seller
            cursor.execute("""
                SELECT COUNT(*) 
                FROM users u
                JOIN user_roles ur ON u.user_id = ur.user_id
                JOIN roles r ON ur.role_id = r.role_id
                WHERE u.user_id = :seller_id AND r.role_name = 'seller'
            """, {'seller_id': seller_id})
            
            seller_count = cursor.fetchone()[0]
            
            if seller_count == 0:
                return JsonResponse({
                    'success': False,
                    'error': 'User is not a seller. Please register as a seller first.'
                }, status=400)
            
            # Call the Oracle FUNCTION
            cursor.execute("""
                SELECT add_plant_func(
                    :name, :description, :base_price, :stock_quantity, 
                    :seller_id, :category_ids, :images, :features, 
                    :care_tips, :sizes
                ) FROM dual
            """, {
                'name': name,
                'description': description,
                'base_price': base_price,
                'stock_quantity': stock_quantity,
                'seller_id': seller_id,
                'category_ids': category_ids,
                'images': image_urls_str,
                'features': features,
                'care_tips': care_tips,
                'sizes': sizes
            })
            
            # Get the returned plant_id
            result = cursor.fetchone()
            new_plant_id = result[0] if result else None
            
            if new_plant_id:
                return JsonResponse({
                    'success': True,
                    'message': 'Plant added successfully',
                    'plant_id': new_plant_id,
                    'image_urls': image_urls
                })
            else:
                return JsonResponse({
                    'success': False,
                    'error': 'Failed to add plant'
                }, status=500)
            
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)

@csrf_exempt
@require_http_methods(["GET"])
def low_stock_plants(request, seller_id):
    """Get low stock plants for a seller"""
    try:
        with connection.cursor() as cursor:
            result_cursor = cursor.connection.cursor()
            cursor.callproc('get_low_stock_plants', [seller_id, result_cursor])
            results = dictfetchall(result_cursor)
            result_cursor.close()
            
            return JsonResponse({
                'success': True,
                'data': results
            })
            
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)

@csrf_exempt
@require_http_methods(["GET"])
def seller_plants(request, seller_id):
    """Get all plants for a seller"""
    try:
        with connection.cursor() as cursor:
            result_cursor = cursor.connection.cursor()
            cursor.callproc('get_seller_plants', [seller_id, result_cursor])
            results = dictfetchall(result_cursor)
            result_cursor.close()
            
            return JsonResponse({
                'success': True,
                'data': results
            })
            
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)

@csrf_exempt
@require_http_methods(["GET"])
def sales_records(request, seller_id):
    """Get sales records for a seller"""
    try:
        with connection.cursor() as cursor:
            result_cursor = cursor.connection.cursor()
            cursor.callproc('get_seller_sales', [seller_id, result_cursor])
            results = dictfetchall(result_cursor)
            result_cursor.close()
            
            return JsonResponse({
                'success': True,
                'data': results
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