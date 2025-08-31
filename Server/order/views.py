# order/views.py - Updated to fix the VariableWrapper error
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db import connection
import json

def dictfetchall(cursor):
    """Return all rows from a cursor as a list of dictionaries"""
    columns = [col[0].lower() for col in cursor.description]  # Convert to lowercase
    return [dict(zip(columns, row)) for row in cursor.fetchall()]

@csrf_exempt
def customer_orders(request, user_id):
    if request.method == 'GET':
        try:
            status = request.GET.get('status', None)
            
            with connection.cursor() as cursor:
                # Use direct SQL instead of calling PL/SQL procedure
                query = """
                    SELECT 
                        o.order_id,
                        o.order_number,
                        o.order_date,
                        os.status_name AS order_status,
                        o.total_amount,
                        dm.name AS delivery_method,
                        o.delivery_address,
                        o.estimated_delivery_date,
                        o.actual_delivery_date,
                        o.tracking_number,
                        (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.order_id) AS item_count,
                        (SELECT LISTAGG(p.name || ' (x' || oi.quantity || ')', ', ') 
                         WITHIN GROUP (ORDER BY oi.order_item_id)
                         FROM order_items oi 
                         JOIN plants p ON oi.plant_id = p.plant_id
                         WHERE oi.order_id = o.order_id) AS items_summary,
                        NVL(dc.customer_confirmed, 0) AS customer_confirmed,
                        NVL(dc.agent_confirmed, 0) AS agent_confirmed,
                        dc.confirmed_date,
                        (SELECT pi.image_url 
                         FROM order_items oi 
                         JOIN plants p ON oi.plant_id = p.plant_id
                         LEFT JOIN plant_images pi ON p.plant_id = pi.plant_id AND pi.is_primary = 1
                         WHERE oi.order_id = o.order_id AND ROWNUM = 1) AS primary_image
                    FROM orders o
                    JOIN order_statuses os ON o.status_id = os.status_id
                    JOIN delivery_methods dm ON o.delivery_method_id = dm.method_id
                    LEFT JOIN delivery_confirmations dc ON o.order_id = dc.order_id
                    WHERE o.user_id = :user_id
                """
                
                params = {'user_id': user_id}
                
                if status:
                    query += " AND os.status_name = :status"
                    params['status'] = status
                
                query += " ORDER BY o.order_date DESC"
                
                cursor.execute(query, params)
                orders = dictfetchall(cursor)
                
                return JsonResponse({
                    'success': True,
                    'orders': orders
                })
                
        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': str(e)
            }, status=500)

@csrf_exempt
def pending_confirmation_orders(request, user_id):
    if request.method == 'GET':
        try:
            with connection.cursor() as cursor:
                # Direct SQL query - Show orders that customers need to confirm
                cursor.execute("""
                    SELECT 
                        o.order_id,
                        o.order_number,
                        o.order_date,
                        o.total_amount,
                        dm.name AS delivery_method,
                        o.delivery_address,
                        o.estimated_delivery_date,
                        o.actual_delivery_date,
                        da.agent_id,
                        ua.first_name || ' ' || ua.last_name AS delivery_agent_name,
                        ua.phone AS delivery_agent_phone,
                        da.vehicle_type,
                        NVL(dc.agent_confirmed, 0) AS agent_confirmed,
                        NVL(dc.customer_confirmed, 0) AS customer_confirmed,
                        dc.confirmed_date,
                        (SELECT LISTAGG(p.name || ' (x' || oi.quantity || ')', ', ') 
                         WITHIN GROUP (ORDER BY oi.order_item_id)
                         FROM order_items oi 
                         JOIN plants p ON oi.plant_id = p.plant_id
                         WHERE oi.order_id = o.order_id) AS items_summary
                    FROM orders o
                    JOIN order_statuses os ON o.status_id = os.status_id
                    JOIN delivery_methods dm ON o.delivery_method_id = dm.method_id
                    LEFT JOIN order_assignments oa ON o.order_id = oa.order_id
                    LEFT JOIN delivery_agents da ON oa.agent_id = da.agent_id
                    LEFT JOIN users ua ON da.user_id = ua.user_id
                    LEFT JOIN delivery_confirmations dc ON o.order_id = dc.order_id
                    WHERE o.user_id = :user_id
                    AND (
                        -- Orders that are shipped/out for delivery and need customer confirmation
                        (os.status_name IN ('Shipped', 'Out for Delivery') AND NVL(dc.customer_confirmed, 0) = 0)
                        OR
                        -- Orders that are out for delivery with agent confirmed but customer not confirmed
                        (os.status_name = 'Out for Delivery' AND dc.agent_confirmed = 1 AND NVL(dc.customer_confirmed, 0) = 0)
                    )
                    ORDER BY o.order_date DESC
                """, {'user_id': user_id})
                
                orders = dictfetchall(cursor)
                
                return JsonResponse({
                    'success': True,
                    'orders': orders
                })
                
        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': str(e)
            }, status=500)

@csrf_exempt
def completed_orders_for_review(request, user_id):
    if request.method == 'GET':
        try:
            with connection.cursor() as cursor:
                # Direct SQL query
                cursor.execute("""
                    SELECT 
                        o.order_id,
                        o.order_number,
                        o.order_date,
                        o.total_amount,
                        o.actual_delivery_date
                    FROM orders o
                    JOIN order_statuses os ON o.status_id = os.status_id
                    LEFT JOIN delivery_confirmations dc ON o.order_id = dc.order_id
                    WHERE o.user_id = :user_id
                    AND os.status_name = 'Delivered'
                    AND dc.customer_confirmed = 1
                    AND dc.agent_confirmed = 1
                    ORDER BY o.actual_delivery_date DESC
                """, {'user_id': user_id})
                
                orders = dictfetchall(cursor)
                
                # Get items for each order
                for order in orders:
                    cursor.execute("""
                        SELECT 
                            oi.plant_id,
                            p.name AS plant_name,
                            oi.quantity,
                            NVL(ps.size_name, 'Standard') AS size_name,
                            CASE WHEN r.review_id IS NOT NULL THEN 1 ELSE 0 END AS has_review
                        FROM order_items oi 
                        JOIN plants p ON oi.plant_id = p.plant_id
                        LEFT JOIN plant_sizes ps ON oi.size_id = ps.size_id
                        LEFT JOIN reviews r ON oi.plant_id = r.plant_id AND oi.order_id = r.order_id AND r.user_id = :user_id
                        WHERE oi.order_id = :order_id
                        ORDER BY oi.order_item_id
                    """, {'user_id': user_id, 'order_id': order['order_id']})
                    
                    items = dictfetchall(cursor)
                    order['items'] = items
                
                return JsonResponse({
                    'success': True,
                    'orders': orders
                })
                
        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': str(e)
            }, status=500)


@csrf_exempt
def add_review_view(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            user_id = data.get('user_id')
            plant_id = data.get('plant_id')
            order_id = data.get('order_id')
            rating = data.get('rating')
            review_text = data.get('review_text', '')
            
            with connection.cursor() as cursor:
                # Use direct SQL for review validation and insertion
                
                # Validate inputs
                if not all([user_id, plant_id, order_id, rating]):
                    return JsonResponse({
                        'success': False,
                        'message': 'User ID, Plant ID, Order ID, and Rating cannot be null'
                    })
                
                if rating not in [1, 2, 3, 4, 5]:
                    return JsonResponse({
                        'success': False,
                        'message': 'Rating must be between 1 and 5'
                    })
                
                # Check if order exists and get status
                cursor.execute("""
                    SELECT os.status_name, o.user_id
                    FROM orders o
                    JOIN order_statuses os ON o.status_id = os.status_id
                    WHERE o.order_id = :order_id
                """, {'order_id': order_id})
                
                order_result = cursor.fetchone()
                if not order_result:
                    return JsonResponse({
                        'success': False,
                        'message': 'Order not found'
                    })
                
                order_status, customer_id = order_result
                
                # Verify order is delivered
                if order_status != 'Delivered':
                    return JsonResponse({
                        'success': False,
                        'message': 'Order is not delivered yet'
                    })
                
                # Verify user is the customer
                if user_id != customer_id:
                    return JsonResponse({
                        'success': False,
                        'message': 'Not authorized to review this order'
                    })
                
                # Check delivery confirmation
                cursor.execute("""
                    SELECT CASE 
                             WHEN customer_confirmed = 1 AND agent_confirmed = 1 THEN 1 
                             ELSE 0 
                           END
                    FROM delivery_confirmations
                    WHERE order_id = :order_id
                """, {'order_id': order_id})
                
                confirmation_result = cursor.fetchone()
                if not confirmation_result or confirmation_result[0] == 0:
                    return JsonResponse({
                        'success': False,
                        'message': 'Delivery not fully confirmed by both parties'
                    })
                
                # Check if plant is in the order
                cursor.execute("""
                    SELECT COUNT(*)
                    FROM order_items
                    WHERE order_id = :order_id
                    AND plant_id = :plant_id
                """, {'order_id': order_id, 'plant_id': plant_id})
                
                plant_result = cursor.fetchone()
                if not plant_result or plant_result[0] == 0:
                    return JsonResponse({
                        'success': False,
                        'message': 'Plant not found in this order'
                    })
                
                # Check for existing review
                cursor.execute("""
                    SELECT COUNT(*)
                    FROM reviews
                    WHERE user_id = :user_id
                    AND plant_id = :plant_id
                    AND order_id = :order_id
                """, {'user_id': user_id, 'plant_id': plant_id, 'order_id': order_id})
                
                review_result = cursor.fetchone()
                if review_result and review_result[0] > 0:
                    return JsonResponse({
                        'success': False,
                        'message': 'You have already reviewed this plant from this order'
                    })
                
                # Insert the review
                cursor.execute("""
                    INSERT INTO reviews (review_id, user_id, plant_id, order_id, rating, review_text, review_date, is_approved)
                    VALUES (review_id_seq.NEXTVAL, :user_id, :plant_id, :order_id, :rating, :review_text, SYSTIMESTAMP, 1)
                """, {
                    'user_id': user_id,
                    'plant_id': plant_id,
                    'order_id': order_id,
                    'rating': rating,
                    'review_text': review_text
                })
                
                connection.commit()
                
                return JsonResponse({
                    'success': True,
                    'message': 'Review added successfully'
                })
                
        except Exception as e:
            connection.rollback()
            return JsonResponse({
                'success': False,
                'error': str(e)
            }, status=500)

@csrf_exempt
def order_details(request, order_id):
    if request.method == 'GET':
        try:
            user_id = request.GET.get('user_id')
            
            with connection.cursor() as cursor:
                # Get order details
                cursor.execute("""
                    SELECT 
                        o.order_id,
                        o.order_number,
                        o.order_date,
                        os.status_name AS order_status,
                        o.total_amount,
                        dm.name AS delivery_method,
                        dm.base_cost AS delivery_cost,
                        o.delivery_address,
                        o.delivery_notes,
                        o.tracking_number,
                        o.estimated_delivery_date,
                        o.actual_delivery_date,
                        u.user_id AS customer_id,
                        u.first_name || ' ' || u.last_name AS customer_name,
                        u.email AS customer_email,
                        u.phone AS customer_phone,
                        NVL(dc.customer_confirmed, 0) AS customer_confirmed,
                        NVL(dc.agent_confirmed, 0) AS agent_confirmed,
                        dc.confirmed_date
                    FROM orders o
                    JOIN order_statuses os ON o.status_id = os.status_id
                    JOIN delivery_methods dm ON o.delivery_method_id = dm.method_id
                    JOIN users u ON o.user_id = u.user_id
                    LEFT JOIN delivery_confirmations dc ON o.order_id = dc.order_id
                    WHERE o.order_id = :order_id
                """, {'order_id': order_id})
                
                order_details = dictfetchall(cursor)
                if not order_details:
                    return JsonResponse({
                        'success': False,
                        'error': 'Order not found'
                    }, status=404)
                
                # Get order items
                if user_id:
                    cursor.execute("""
                        SELECT 
                            oi.order_item_id,
                            oi.plant_id,
                            p.name AS plant_name,
                            pi.image_url,
                            oi.quantity,
                            oi.unit_price,
                            ps.size_id,
                            ps.size_name,
                            ps.price_adjustment,
                            (oi.quantity * oi.unit_price) AS subtotal,
                            CASE WHEN r.review_id IS NOT NULL THEN 1 ELSE 0 END AS has_review
                        FROM order_items oi
                        JOIN plants p ON oi.plant_id = p.plant_id
                        LEFT JOIN plant_images pi ON p.plant_id = pi.plant_id AND pi.is_primary = 1
                        LEFT JOIN plant_sizes ps ON oi.size_id = ps.size_id
                        LEFT JOIN reviews r ON oi.plant_id = r.plant_id AND oi.order_id = r.order_id AND r.user_id = :user_id
                        WHERE oi.order_id = :order_id
                        ORDER BY oi.order_item_id
                    """, {'order_id': order_id, 'user_id': user_id})
                    
                    items = dictfetchall(cursor)
                    order_details[0]['items'] = items
                else:
                    order_details[0]['items'] = []
                
                return JsonResponse({
                    'success': True,
                    'order': order_details[0]
                })
                
        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': str(e)
            }, status=500)

@csrf_exempt
def customer_order_stats(request, user_id):
    if request.method == 'GET':
        try:
            with connection.cursor() as cursor:
                # Direct SQL queries for statistics
                
                # Total orders
                cursor.execute("""
                    SELECT COUNT(*)
                    FROM orders
                    WHERE user_id = :user_id
                """, {'user_id': user_id})
                total_orders = cursor.fetchone()[0]
                
                # Pending orders
                cursor.execute("""
                    SELECT COUNT(*)
                    FROM orders o
                    JOIN order_statuses os ON o.status_id = os.status_id
                    WHERE o.user_id = :user_id
                    AND os.status_name IN ('Processing', 'Shipped', 'Out for Delivery')
                """, {'user_id': user_id})
                pending_orders = cursor.fetchone()[0]
                
                # Delivered orders
                cursor.execute("""
                    SELECT COUNT(*)
                    FROM orders o
                    JOIN order_statuses os ON o.status_id = os.status_id
                    WHERE o.user_id = :user_id
                    AND os.status_name = 'Delivered'
                """, {'user_id': user_id})
                delivered_orders = cursor.fetchone()[0]
                
                # Total spent
                cursor.execute("""
                    SELECT NVL(SUM(total_amount), 0)
                    FROM orders
                    WHERE user_id = :user_id
                    AND order_id IN (
                        SELECT o.order_id
                        FROM orders o
                        JOIN order_statuses os ON o.status_id = os.status_id
                        WHERE os.status_name = 'Delivered'
                    )
                """, {'user_id': user_id})
                total_spent = cursor.fetchone()[0]
                
                stats = {
                    'total_orders': total_orders,
                    'pending_orders': pending_orders,
                    'delivered_orders': delivered_orders,
                    'total_spent': float(total_spent) if total_spent else 0
                }
                
                return JsonResponse({
                    'success': True,
                    'stats': stats
                })
                
        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': str(e)
            }, status=500)
        



# order/views.py (add these functions)
@csrf_exempt
def get_delivery_methods(request):
    if request.method == 'GET':
        try:
            with connection.cursor() as cursor:
                # Use direct SQL for simplicity and reliability
                cursor.execute("""
                    SELECT 
                        method_id AS id,
                        name,
                        base_cost AS price,
                        estimated_days AS time,
                        description
                    FROM delivery_methods
                    WHERE is_active = 1
                    ORDER BY method_id
                """)
                
                methods = dictfetchall(cursor)
                print(f"DEBUG: Found {len(methods)} delivery methods: {methods}")  # Debug log
                
                # Validate that we have data and required fields
                if not methods:
                    return JsonResponse({'success': False, 'error': 'No delivery methods found'}, status=500)
                
                # Check first method to ensure it has required fields
                first_method = methods[0]
                required_fields = ['id', 'name', 'price', 'time']
                missing_fields = [field for field in required_fields if field not in first_method]
                
                if missing_fields:
                    print(f"ERROR: Missing fields {missing_fields} in delivery method: {first_method}")
                    print(f"Available fields: {list(first_method.keys())}")
                    return JsonResponse({'success': False, 'error': f'Missing required fields: {missing_fields}'}, status=500)
                
                return JsonResponse({'success': True, 'methods': methods})
                
        except Exception as e:
            print(f"ERROR in get_delivery_methods: {str(e)}")  # Debug log
            import traceback
            traceback.print_exc()
            return JsonResponse({'success': False, 'error': str(e)}, status=500)

@csrf_exempt
def test_delivery_methods(request):
    """Test endpoint to debug delivery methods table"""
    if request.method == 'GET':
        try:
            with connection.cursor() as cursor:
                # First, check if table exists and has data
                cursor.execute("SELECT COUNT(*) FROM delivery_methods")
                total_count = cursor.fetchone()[0]
                
                cursor.execute("SELECT COUNT(*) FROM delivery_methods WHERE is_active = 1")
                active_count = cursor.fetchone()[0]
                
                # Get all delivery methods (active and inactive)
                cursor.execute("""
                    SELECT method_id, name, base_cost, estimated_days, is_active
                    FROM delivery_methods
                    ORDER BY method_id
                """)
                all_methods = dictfetchall(cursor)
                
                return JsonResponse({
                    'success': True, 
                    'total_methods': total_count,
                    'active_methods': active_count,
                    'all_methods': all_methods
                })
                
        except Exception as e:
            print(f"ERROR in test_delivery_methods: {str(e)}")
            import traceback
            traceback.print_exc()
            return JsonResponse({'success': False, 'error': str(e)}, status=500)

@csrf_exempt
def create_order_view(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            user_id = data.get('user_id')
            delivery_method_id = data.get('delivery_method_id')
            delivery_address = data.get('delivery_address')
            delivery_notes = data.get('delivery_notes', '')
            cart_ids = data.get('cart_ids', '')
            
            print(f"DEBUG: Received order data: user_id={user_id}, delivery_method_id={delivery_method_id}, address='{delivery_address}', cart_ids='{cart_ids}'")  # Debug log
            
            # Validate required fields
            if not user_id:
                return JsonResponse({'success': False, 'error': 'User ID is required'}, status=400)
            if not delivery_method_id:
                return JsonResponse({'success': False, 'error': 'Delivery method is required'}, status=400)
            if not delivery_address:
                return JsonResponse({'success': False, 'error': 'Delivery address is required'}, status=400)
            
            # Generate order number
            import random
            order_number = f'ORD-{random.randint(10000, 99999)}'
            
            with connection.cursor() as cursor:
                # Use direct SQL instead of stored procedure to avoid VariableWrapper error
                
                # Get status_id for 'Processing'
                cursor.execute("""
                    SELECT status_id FROM order_statuses WHERE status_name = 'Processing'
                """)
                status_id = cursor.fetchone()[0]
                
                # Get delivery method details
                cursor.execute("""
                    SELECT base_cost, estimated_days 
                    FROM delivery_methods 
                    WHERE method_id = :delivery_method_id AND is_active = 1
                """, {'delivery_method_id': delivery_method_id})
                
                delivery_info = cursor.fetchone()
                print(f"DEBUG: Delivery method query result: {delivery_info}")  # Debug log
                
                if not delivery_info:
                    # Check if delivery method exists but is inactive
                    cursor.execute("""
                        SELECT COUNT(*), is_active FROM delivery_methods WHERE method_id = :delivery_method_id GROUP BY is_active
                    """, {'delivery_method_id': delivery_method_id})
                    check_result = cursor.fetchone()
                    if check_result:
                        error_msg = f'Delivery method {delivery_method_id} exists but is inactive (is_active={check_result[1]})'
                    else:
                        error_msg = f'Delivery method {delivery_method_id} does not exist'
                    print(f"DEBUG: {error_msg}")  # Debug log
                    return JsonResponse({'success': False, 'error': error_msg}, status=400)
                
                delivery_cost = float(delivery_info[0]) if delivery_info[0] else 0.0
                estimated_days_str = delivery_info[1]
                
                # Extract numeric days from string like "3-5 days" or "1-2 days"
                import re
                days_match = re.search(r'(\d+)', estimated_days_str)
                estimated_days = int(days_match.group(1)) if days_match else 3  # Default to 3 days
                
                # Calculate estimated delivery date
                from datetime import datetime, timedelta
                estimated_delivery_date = datetime.now() + timedelta(days=estimated_days)
                
                # Calculate total amount BEFORE inserting order
                total_amount = delivery_cost  # Start with delivery cost
                
                if cart_ids:
                    cart_id_list = [int(x.strip()) for x in cart_ids.split(',') if x.strip()]
                    print(f"DEBUG: Processing cart IDs: {cart_id_list}")  # Debug log
                    
                    for cart_id in cart_id_list:
                        # Get cart item details
                        cursor.execute("""
                            SELECT c.plant_id, c.size_id, c.quantity, 
                                   (p.base_price + COALESCE(ps.price_adjustment, 0)) as unit_price
                            FROM carts c
                            JOIN plants p ON c.plant_id = p.plant_id
                            LEFT JOIN plant_sizes ps ON c.plant_id = ps.plant_id AND c.size_id = ps.size_id
                            WHERE c.cart_id = :cart_id AND c.user_id = :user_id
                        """, {'cart_id': cart_id, 'user_id': user_id})
                        
                        cart_item = cursor.fetchone()
                        if cart_item:
                            plant_id, size_id, quantity, unit_price = cart_item
                            unit_price = float(unit_price) if unit_price else 0.0
                            quantity = int(quantity) if quantity else 0
                            item_total = unit_price * quantity
                            total_amount += item_total
                            print(f"DEBUG: Cart item {cart_id}: price={unit_price}, qty={quantity}, total={item_total}")  # Debug log
                        else:
                            print(f"WARNING: Cart item {cart_id} not found for user {user_id}")  # Debug log
                
                print(f"DEBUG: Calculated total amount: {total_amount}")  # Debug log
                
                # Ensure total_amount is not NULL or 0
                if total_amount <= 0:
                    return JsonResponse({'success': False, 'error': 'Invalid order total. Please check your cart items.'}, status=400)
                
                # Insert order with calculated total
                cursor.execute("""
                    INSERT INTO orders (
                        user_id, order_number, status_id, delivery_method_id,
                        delivery_address, delivery_notes, estimated_delivery_date, total_amount
                    ) VALUES (
                        :user_id, :order_number, :status_id, :delivery_method_id,
                        :delivery_address, :delivery_notes, :estimated_delivery_date, :total_amount
                    )
                """, {
                    'user_id': user_id,
                    'order_number': order_number,
                    'status_id': status_id,
                    'delivery_method_id': delivery_method_id,
                    'delivery_address': delivery_address,
                    'delivery_notes': delivery_notes,
                    'estimated_delivery_date': estimated_delivery_date,
                    'total_amount': total_amount
                })
                
                # Get the order_id of the inserted order
                cursor.execute("SELECT seq_orders.CURRVAL FROM DUAL")
                order_id = cursor.fetchone()[0]
                
                print(f"DEBUG: Created order {order_id} with total {total_amount}")  # Debug log
                
                # Create order items
                if cart_ids:
                    cart_id_list = [int(x.strip()) for x in cart_ids.split(',') if x.strip()]
                    
                    for cart_id in cart_id_list:
                        # Get cart item details again for order items
                        cursor.execute("""
                            SELECT c.plant_id, c.size_id, c.quantity, 
                                   (p.base_price + COALESCE(ps.price_adjustment, 0)) as unit_price
                            FROM carts c
                            JOIN plants p ON c.plant_id = p.plant_id
                            LEFT JOIN plant_sizes ps ON c.plant_id = ps.plant_id AND c.size_id = ps.size_id
                            WHERE c.cart_id = :cart_id AND c.user_id = :user_id
                        """, {'cart_id': cart_id, 'user_id': user_id})
                        
                        cart_item = cursor.fetchone()
                        if cart_item:
                            plant_id, size_id, quantity, unit_price = cart_item
                            unit_price = float(unit_price) if unit_price else 0.0
                            quantity = int(quantity) if quantity else 0
                            
                            # Insert order item (no discount_applied since we don't have discount logic yet)
                            cursor.execute("""
                                INSERT INTO order_items (
                                    order_id, plant_id, size_id, quantity, unit_price, discount_applied
                                ) VALUES (
                                    :order_id, :plant_id, :size_id, :quantity, :unit_price, :discount_applied
                                )
                            """, {
                                'order_id': order_id,
                                'plant_id': plant_id,
                                'size_id': size_id,
                                'quantity': quantity,
                                'unit_price': unit_price,
                                'discount_applied': 0.0  # Default to 0 since no discount logic implemented
                            })
                    
                    # Remove items from cart
                    cart_ids_str = ','.join(map(str, cart_id_list))
                    cursor.execute(f"""
                        DELETE FROM carts 
                        WHERE cart_id IN ({cart_ids_str}) AND user_id = :user_id
                    """, {'user_id': user_id})
                
                connection.commit()
                
                return JsonResponse({
                    'success': True,
                    'order_id': order_id,
                    'order_number': order_number,
                    'total_amount': total_amount,
                    'message': 'Order created successfully'
                })
                
        except Exception as e:
            connection.rollback()
            return JsonResponse({'success': False, 'error': str(e)}, status=400)

@csrf_exempt
def get_order_details_view(request, order_id):
    if request.method == 'GET':
        try:
            with connection.cursor() as cursor:
                # Get order details
                cursor.execute("""
                    SELECT 
                        o.order_id,
                        o.order_number,
                        o.order_date,
                        os.status_name AS order_status,
                        u.user_id,
                        u.first_name || ' ' || u.last_name AS customer_name,
                        u.email AS customer_email,
                        u.phone AS customer_phone,
                        o.delivery_address,
                        o.delivery_notes,
                        dm.name AS delivery_method,
                        dm.base_cost AS delivery_cost,
                        o.total_amount,
                        o.tracking_number,
                        o.estimated_delivery_date,
                        o.actual_delivery_date
                    FROM orders o
                    JOIN users u ON o.user_id = u.user_id
                    JOIN order_statuses os ON o.status_id = os.status_id
                    JOIN delivery_methods dm ON o.delivery_method_id = dm.method_id
                    WHERE o.order_id = :order_id
                """, {'order_id': order_id})
                
                order_details = dictfetchall(cursor)
                if not order_details:
                    return JsonResponse({'success': False, 'error': 'Order not found'}, status=404)
                
                # Get order items
                cursor.execute("""
                    SELECT 
                        oi.order_item_id,
                        oi.plant_id,
                        p.name AS plant_name,
                        oi.size_id,
                        ps.size_name,
                        oi.quantity,
                        oi.unit_price,
                        oi.discount_applied,
                        (oi.quantity * oi.unit_price) AS item_total,
                        pi.image_url AS plant_image
                    FROM order_items oi
                    JOIN plants p ON oi.plant_id = p.plant_id
                    LEFT JOIN plant_sizes ps ON oi.size_id = ps.size_id
                    LEFT JOIN plant_images pi ON p.plant_id = pi.plant_id AND pi.is_primary = 1
                    WHERE oi.order_id = :order_id
                    ORDER BY oi.order_item_id
                """, {'order_id': order_id})
                
                items = dictfetchall(cursor)
                
                result = order_details[0]
                result['items'] = items
                
                return JsonResponse({'success': True, 'order': result})
                
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=500)




# order/views.py
@csrf_exempt
def confirm_customer_delivery(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            order_id = data.get('order_id')
            user_id = data.get('user_id')
            
            # Extract the actual value from the database result to avoid VariableWrapper error
            if hasattr(user_id, 'value'):
                user_id = user_id.value
            
            with connection.cursor() as cursor:
                # Verify order belongs to user
                cursor.execute("""
                    SELECT COUNT(*) FROM orders WHERE order_id = %s AND user_id = %s
                """, [order_id, user_id])
                
                order_count = cursor.fetchone()[0]
                if order_count == 0:
                    return JsonResponse({'success': False, 'error': 'Order not found or not authorized'})
                
                # Check if delivery confirmation record exists, create if not
                cursor.execute("""
                    SELECT COUNT(*) FROM delivery_confirmations WHERE order_id = %s
                """, [order_id])
                
                confirmation_exists = cursor.fetchone()[0]
                if confirmation_exists == 0:
                    # Get agent_id from order_assignments
                    cursor.execute("""
                        SELECT agent_id FROM order_assignments WHERE order_id = %s
                    """, [order_id])
                    
                    agent_result = cursor.fetchone()
                    if agent_result:
                        agent_id = agent_result[0]
                        # Extract the actual value from the database result to avoid VariableWrapper error
                        if hasattr(agent_id, 'value'):
                            agent_id = agent_id.value
                    else:
                        # If no agent is assigned, we can't create a delivery confirmation record yet
                        # Return an error message indicating that an agent needs to be assigned first
                        return JsonResponse({
                            'success': False, 
                            'error': 'No delivery agent assigned to this order yet. Please wait for an agent to be assigned before confirming delivery.'
                        })
                    
                    # Create delivery confirmation record
                    cursor.execute("""
                        INSERT INTO delivery_confirmations (order_id, user_id, agent_id, customer_confirmed, agent_confirmed)
                        VALUES (%s, %s, %s, 1, 0)
                    """, [order_id, user_id, agent_id])
                else:
                    # Toggle customer confirmation
                    cursor.execute("""
                        UPDATE delivery_confirmations 
                        SET customer_confirmed = 1
                        WHERE order_id = %s
                    """, [order_id])
                
                # Check if both parties have confirmed
                cursor.execute("""
                    SELECT agent_confirmed, customer_confirmed FROM delivery_confirmations WHERE order_id = %s
                """, [order_id])
                
                agent_confirmed, customer_confirmed = cursor.fetchone()
                
                # If both confirmed, the trigger will automatically update the order status to Delivered
                # We just need to commit and return the appropriate message
                connection.commit()
                
                if agent_confirmed == 1 and customer_confirmed == 1:
                    return JsonResponse({
                        'success': True,
                        'message': 'Delivery completed! Order status updated to Delivered.'
                    })
                elif agent_confirmed == 1:
                    return JsonResponse({
                        'success': True,
                        'message': 'Customer confirmation recorded. Waiting for agent confirmation.'
                    })
                else:
                    return JsonResponse({
                        'success': True,
                        'message': 'Customer confirmation recorded.'
                    })
                
        except Exception as e:
            connection.rollback()
            return JsonResponse({
                'success': False,
                'error': str(e)
            }, status=500)
