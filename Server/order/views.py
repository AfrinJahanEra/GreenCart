# order/views.py - Updated to fix the VariableWrapper error
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db import connection
import json

def dictfetchall(cursor):
    """Return all rows from a cursor as a list of dictionaries"""
    columns = [col[0] for col in cursor.description]
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
                # Direct SQL query
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
                        dc.agent_confirmed,
                        dc.customer_confirmed,
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
                    AND os.status_name = 'Out for Delivery'
                    AND dc.agent_confirmed = 1
                    AND dc.customer_confirmed = 0
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
def confirm_delivery(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            order_id = data.get('order_id')
            user_id = data.get('user_id')
            
            with connection.cursor() as cursor:
                # Use direct SQL for the confirmation process
                
                # 1. Check if order exists and belongs to user
                cursor.execute("""
                    SELECT COUNT(*), user_id
                    FROM orders
                    WHERE order_id = :order_id
                """, {'order_id': order_id})
                
                result = cursor.fetchone()
                if not result or result[0] == 0:
                    return JsonResponse({
                        'success': False,
                        'message': 'Order not found'
                    })
                
                if result[1] != user_id:
                    return JsonResponse({
                        'success': False,
                        'message': 'Not authorized to confirm this delivery'
                    })
                
                # 2. Check order status
                cursor.execute("""
                    SELECT os.status_name
                    FROM orders o
                    JOIN order_statuses os ON o.status_id = os.status_id
                    WHERE o.order_id = :order_id
                """, {'order_id': order_id})
                
                status_result = cursor.fetchone()
                if not status_result or status_result[0] != 'Out for Delivery':
                    return JsonResponse({
                        'success': False,
                        'message': 'Order is not out for delivery'
                    })
                
                # 3. Check if agent has confirmed
                cursor.execute("""
                    SELECT NVL(agent_confirmed, 0)
                    FROM delivery_confirmations
                    WHERE order_id = :order_id
                """, {'order_id': order_id})
                
                agent_confirmed_result = cursor.fetchone()
                if not agent_confirmed_result or agent_confirmed_result[0] == 0:
                    return JsonResponse({
                        'success': False,
                        'message': 'Delivery agent has not confirmed delivery yet'
                    })
                
                # 4. Update customer confirmation
                cursor.execute("""
                    MERGE INTO delivery_confirmations dc
                    USING (SELECT :order_id AS order_id, :user_id AS user_id FROM dual) src
                    ON (dc.order_id = src.order_id)
                    WHEN MATCHED THEN
                        UPDATE SET 
                            customer_confirmed = 1,
                            confirmed_date = CASE WHEN agent_confirmed = 1 THEN SYSTIMESTAMP ELSE confirmed_date END
                    WHEN NOT MATCHED THEN
                        INSERT (order_id, user_id, agent_id, customer_confirmed)
                        VALUES (src.order_id, src.user_id, 
                               (SELECT agent_id FROM order_assignments WHERE order_id = :order_id), 1)
                """, {'order_id': order_id, 'user_id': user_id})
                
                # 5. If both confirmed, update order status to Delivered
                cursor.execute("""
                    UPDATE orders
                    SET status_id = (SELECT status_id FROM order_statuses WHERE status_name = 'Delivered'),
                        actual_delivery_date = SYSTIMESTAMP
                    WHERE order_id = :order_id
                    AND EXISTS (
                        SELECT 1 FROM delivery_confirmations 
                        WHERE order_id = :order_id 
                        AND customer_confirmed = 1 
                        AND agent_confirmed = 1
                    )
                """, {'order_id': order_id})
                
                connection.commit()
                
                return JsonResponse({
                    'success': True,
                    'message': 'Delivery confirmed successfully'
                })
                
        except Exception as e:
            connection.rollback()
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
                cursor.execute("""
                    SELECT 
                        method_id AS id,
                        name,
                        base_cost AS price,
                        estimated_days AS time
                    FROM delivery_methods
                    WHERE is_active = 1
                    ORDER BY method_id
                """)
                
                methods = dictfetchall(cursor)
                return JsonResponse({'success': True, 'methods': methods})
                
        except Exception as e:
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
            
            # Generate order number
            import random
            order_number = f'ORD-{random.randint(10000, 99999)}'
            
            with connection.cursor() as cursor:
                total_amount_var = cursor.var(float)
                order_id_var = cursor.var(int)
                
                cursor.callproc('create_order', [
                    user_id, order_number, delivery_method_id, 
                    delivery_address, delivery_notes, cart_ids,
                    total_amount_var, order_id_var
                ])
                
                total_amount = total_amount_var.getvalue()
                order_id = order_id_var.getvalue()
                
                return JsonResponse({
                    'success': True,
                    'order_id': order_id,
                    'order_number': order_number,
                    'total_amount': total_amount,
                    'message': 'Order created successfully'
                })
                
        except Exception as e:
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