from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db import connection
import json

def dictfetchall(cursor):
    """Return all rows from a cursor as a list of dictionaries"""
    columns = [col[0].lower() for col in cursor.description]  # Convert to lowercase
    return [dict(zip(columns, row)) for row in cursor.fetchall()]

@csrf_exempt
def plant_details(request, plant_id):
    if request.method == 'GET':
        try:
            with connection.cursor() as cursor:
                # First, check if plant exists and is active
                cursor.execute("""
                    SELECT COUNT(*) 
                    FROM plants 
                    WHERE plant_id = :plant_id AND is_active = 1
                """, {'plant_id': plant_id})
                
                plant_exists = cursor.fetchone()[0]
                if plant_exists == 0:
                    return JsonResponse({'success': False, 'error': 'Plant not found or inactive'}, status=404)
                
                # Get basic plant information
                cursor.execute("""
                    SELECT 
                        p.plant_id,
                        p.name,
                        DBMS_LOB.SUBSTR(p.description, 4000, 1) AS description,
                        p.base_price,
                        p.stock_quantity,
                        (SELECT pi.image_url 
                         FROM plant_images pi 
                         WHERE pi.plant_id = p.plant_id AND pi.is_primary = 1 
                         AND ROWNUM = 1) AS primary_image,
                        NVL(AVG(r.rating), 0) AS avg_rating,
                        COUNT(r.review_id) AS review_count
                    FROM plants p
                    LEFT JOIN reviews r ON p.plant_id = r.plant_id
                    WHERE p.plant_id = :plant_id
                    GROUP BY p.plant_id, p.name, DBMS_LOB.SUBSTR(p.description, 4000, 1), 
                             p.base_price, p.stock_quantity
                """, {'plant_id': plant_id})
                
                plant_data = dictfetchall(cursor)
                if not plant_data:
                    return JsonResponse({'success': False, 'error': 'Plant data not found'}, status=404)
                
                plant = plant_data[0]
                
                # Build result with safe field access
                result = {
                    'plant_id': plant.get('plant_id'),
                    'name': plant.get('name', ''),
                    'description': plant.get('description', ''),
                    'base_price': float(plant.get('base_price', 0)),
                    'stock_quantity': plant.get('stock_quantity', 0),
                    'primary_image': plant.get('primary_image', ''),
                    'avg_rating': float(plant.get('avg_rating', 0)),
                    'review_count': plant.get('review_count', 0),
                    'image_urls': [],
                    'sizes': [],
                    'features': [],
                    'care_tips': [],
                    'reviews': [],
                    'discount': None  # Add discount information
                }
                
                # Get discount information for the plant (including category discounts)
                cursor.execute("""
                    SELECT 
                        d.discount_id,
                        d.name,
                        d.description,
                        d.discount_value,
                        d.is_percentage,
                        d.start_date,
                        d.end_date
                    FROM plant_discounts pd
                    JOIN discounts d ON pd.discount_id = d.discount_id
                    JOIN discount_types dt ON d.discount_type_id = dt.discount_type_id
                    WHERE (pd.plant_id = :plant_id OR pd.category_id IN (
                        SELECT category_id FROM plant_category_mapping WHERE plant_id = :plant_id
                    ))
                    AND d.is_active = 1
                    AND d.start_date <= SYSTIMESTAMP
                    AND d.end_date >= SYSTIMESTAMP
                    ORDER BY d.discount_value DESC
                """, {'plant_id': plant_id})
                
                discount_data = dictfetchall(cursor)
                print(f"Discount data for plant {plant_id}: {discount_data}")  # Debug log
                
                if discount_data:
                    # Get the highest discount for display
                    discount = discount_data[0]
                    # Handle datetime conversion properly
                    start_date_iso = None
                    end_date_iso = None
                    
                    if discount.get('start_date'):
                        try:
                            start_date_iso = discount['start_date'].isoformat() if hasattr(discount['start_date'], 'isoformat') else str(discount['start_date'])
                        except:
                            start_date_iso = str(discount['start_date'])
                    
                    if discount.get('end_date'):
                        try:
                            end_date_iso = discount['end_date'].isoformat() if hasattr(discount['end_date'], 'isoformat') else str(discount['end_date'])
                        except:
                            end_date_iso = str(discount['end_date'])
                    
                    result['discount'] = {
                        'discount_id': discount.get('discount_id'),
                        'name': discount.get('name', ''),
                        'description': discount.get('description', ''),
                        'discount_value': float(discount.get('discount_value', 0)),
                        'is_percentage': int(discount.get('is_percentage', 0)),
                        'start_date': start_date_iso,
                        'end_date': end_date_iso
                    }
                
                # Get additional images
                cursor.execute("""
                    SELECT image_url 
                    FROM plant_images 
                    WHERE plant_id = :plant_id 
                    ORDER BY is_primary DESC, image_id
                """, {'plant_id': plant_id})
                images = dictfetchall(cursor)
                result['image_urls'] = [img.get('image_url', '') for img in images if img.get('image_url')]
                
                # Get sizes
                cursor.execute("""
                    SELECT size_id, size_name, price_adjustment
                    FROM plant_sizes 
                    WHERE plant_id = :plant_id 
                    ORDER BY size_id
                """, {'plant_id': plant_id})
                sizes = dictfetchall(cursor)
                for size in sizes:
                    size['price_adjustment'] = float(size.get('price_adjustment', 0))
                result['sizes'] = sizes
                
                # Get features
                cursor.execute("""
                    SELECT feature_text
                    FROM plant_features 
                    WHERE plant_id = :plant_id 
                    ORDER BY feature_id
                """, {'plant_id': plant_id})
                features = dictfetchall(cursor)
                result['features'] = [feat.get('feature_text', '') for feat in features if feat.get('feature_text')]
                
                # Get care tips
                cursor.execute("""
                    SELECT tip_text
                    FROM plant_care_tips 
                    WHERE plant_id = :plant_id 
                    ORDER BY tip_id
                """, {'plant_id': plant_id})
                care_tips = dictfetchall(cursor)
                result['care_tips'] = [tip.get('tip_text', '') for tip in care_tips if tip.get('tip_text')]
                
                # Get reviews (only approved ones)
                cursor.execute("""
                    SELECT 
                        r.review_id,
                        u.first_name || ' ' || u.last_name AS author,
                        r.rating,
                        DBMS_LOB.SUBSTR(r.review_text, 1000, 1) AS review_text,
                        TO_CHAR(r.review_date, 'YYYY-MM-DD') AS review_date
                    FROM reviews r
                    JOIN users u ON r.user_id = u.user_id
                    WHERE r.plant_id = :plant_id AND r.is_approved = 1
                    ORDER BY r.review_date DESC
                """, {'plant_id': plant_id})
                
                reviews = dictfetchall(cursor)
                # Safe access to review fields
                formatted_reviews = []
                for review in reviews:
                    formatted_reviews.append({
                        'review_id': review.get('review_id'),
                        'author': review.get('author', 'Anonymous'),
                        'rating': float(review.get('rating', 0)),
                        'review_text': review.get('review_text', ''),
                        'review_date': review.get('review_date', '')
                    })
                result['reviews'] = formatted_reviews
                
                print(f"Final result for plant {plant_id}: {result}")  # Debug log
                return JsonResponse({'success': True, 'plant': result})
                
        except Exception as e:
            import traceback
            error_details = traceback.format_exc()
            print(f"Error in plant_details: {error_details}")
            return JsonResponse({'success': False, 'error': str(e)}, status=500)


# Keep the other functions (add_to_cart, add_review) the same
@csrf_exempt
def add_to_cart(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            user_id = data.get('user_id')
            plant_id = data.get('plant_id')
            size_id = data.get('size_id')
            quantity = data.get('quantity', 1)
            
            # Basic validation
            if not all([user_id, plant_id, size_id]):
                return JsonResponse({'success': False, 'error': 'Missing required fields'}, status=400)
            
            if quantity <= 0:
                return JsonResponse({'success': False, 'error': 'Quantity must be positive'}, status=400)
            
            with connection.cursor() as cursor:
                # Use direct SQL instead of procedure to avoid issues
                cursor.execute("""
                    DECLARE
                        v_seller_id NUMBER;
                        v_stock_quantity NUMBER;
                        v_size_exists NUMBER;
                    BEGIN
                        -- Check if plant exists and get stock
                        SELECT seller_id, stock_quantity
                        INTO v_seller_id, v_stock_quantity
                        FROM plants
                        WHERE plant_id = :plant_id AND is_active = 1;
                        
                        IF v_seller_id IS NULL THEN
                            RAISE_APPLICATION_ERROR(-20016, 'Plant not found or inactive');
                        END IF;
                        
                        -- Check if size exists
                        SELECT COUNT(*)
                        INTO v_size_exists
                        FROM plant_sizes
                        WHERE size_id = :size_id;
                        
                        IF v_size_exists = 0 THEN
                            RAISE_APPLICATION_ERROR(-20017, 'Invalid size ID');
                        END IF;
                        
                        -- Check stock
                        IF v_stock_quantity < :quantity THEN
                            RAISE_APPLICATION_ERROR(-20018, 'Insufficient stock');
                        END IF;
                        
                        -- Update or insert cart item
                        UPDATE carts
                        SET quantity = quantity + :quantity,
                            added_at = SYSTIMESTAMP
                        WHERE user_id = :user_id
                          AND plant_id = :plant_id
                          AND size_id = :size_id;
                        
                        IF SQL%ROWCOUNT = 0 THEN
                            INSERT INTO carts (user_id, plant_id, size_id, quantity, added_at)
                            VALUES (:user_id, :plant_id, :size_id, :quantity, SYSTIMESTAMP);
                        END IF;
                        
                        COMMIT;
                    EXCEPTION
                        WHEN NO_DATA_FOUND THEN
                            RAISE_APPLICATION_ERROR(-20016, 'Plant not found');
                        WHEN OTHERS THEN
                            ROLLBACK;
                            RAISE;
                    END;
                """, {
                    'user_id': user_id,
                    'plant_id': plant_id,
                    'size_id': size_id,
                    'quantity': quantity
                })
                
            return JsonResponse({'success': True, 'message': 'Added to cart successfully'})
            
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=400)

@csrf_exempt
def add_review(request, plant_id):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            user_id = data.get('user_id')
            order_id = data.get('order_id')
            rating = data.get('rating')
            review_text = data.get('review_text', '')
            
            # Basic validation
            if not all([user_id, order_id, rating]):
                return JsonResponse({'success': False, 'error': 'Missing required fields'}, status=400)
            
            if rating not in [1, 2, 3, 4, 5]:
                return JsonResponse({'success': False, 'error': 'Rating must be between 1-5'}, status=400)
            
            with connection.cursor() as cursor:
                # Use direct SQL for review addition
                cursor.execute("""
                    DECLARE
                        v_order_status VARCHAR2(50);
                        v_customer_id NUMBER;
                        v_plant_in_order NUMBER;
                        v_both_confirmed NUMBER;
                        v_existing_review NUMBER;
                    BEGIN
                        -- Check if order exists and get status
                        SELECT os.status_name, o.user_id
                        INTO v_order_status, v_customer_id
                        FROM orders o
                        JOIN order_statuses os ON o.status_id = os.status_id
                        WHERE o.order_id = :order_id;
                        
                        -- Verify order is delivered
                        IF v_order_status != 'Delivered' THEN
                            RAISE_APPLICATION_ERROR(-20023, 'Order is not delivered yet');
                        END IF;
                        
                        -- Verify user is the customer
                        IF :user_id != v_customer_id THEN
                            RAISE_APPLICATION_ERROR(-20026, 'Not authorized to review this order');
                        END IF;
                        
                        -- Check delivery confirmation
                        SELECT CASE 
                                 WHEN customer_confirmed = 1 AND agent_confirmed = 1 THEN 1 
                                 ELSE 0 
                               END
                        INTO v_both_confirmed
                        FROM delivery_confirmations
                        WHERE order_id = :order_id;
                        
                        IF v_both_confirmed = 0 THEN
                            RAISE_APPLICATION_ERROR(-20025, 'Delivery not fully confirmed');
                        END IF;
                        
                        -- Check if plant is in the order
                        SELECT COUNT(*)
                        INTO v_plant_in_order
                        FROM order_items
                        WHERE order_id = :order_id
                        AND plant_id = :plant_id;
                        
                        IF v_plant_in_order = 0 THEN
                            RAISE_APPLICATION_ERROR(-20027, 'Plant not found in this order');
                        END IF;
                        
                        -- Check for existing review
                        SELECT COUNT(*)
                        INTO v_existing_review
                        FROM reviews
                        WHERE user_id = :user_id
                        AND plant_id = :plant_id
                        AND order_id = :order_id;
                        
                        IF v_existing_review > 0 THEN
                            RAISE_APPLICATION_ERROR(-20028, 'You have already reviewed this plant');
                        END IF;
                        
                        -- Insert the review
                        INSERT INTO reviews (review_id, user_id, plant_id, order_id, rating, review_text, review_date, is_approved)
                        VALUES (review_id_seq.NEXTVAL, :user_id, :plant_id, :order_id, :rating, :review_text, SYSTIMESTAMP, 1);
                        
                        COMMIT;
                    EXCEPTION
                        WHEN NO_DATA_FOUND THEN
                            RAISE_APPLICATION_ERROR(-20022, 'Order not found');
                        WHEN OTHERS THEN
                            ROLLBACK;
                            RAISE;
                    END;
                """, {
                    'user_id': user_id,
                    'plant_id': plant_id,
                    'order_id': order_id,
                    'rating': rating,
                    'review_text': review_text
                })
                
                return JsonResponse({
                    'success': True,
                    'message': 'Review added successfully'
                })
                
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=400)