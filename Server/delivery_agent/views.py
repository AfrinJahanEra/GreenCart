# delivery_agent/views.py
from django.http import JsonResponse
from django.db import connection
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json

def dictfetchall(cursor):
    """Return all rows from a cursor as a list of dictionaries with lowercase column names"""
    columns = [col[0].lower() for col in cursor.description]
    return [dict(zip(columns, row)) for row in cursor.fetchall()]

@csrf_exempt
@require_http_methods(["GET"])
def delivery_agent_dashboard(request, agent_id):
    """Get delivery agent dashboard with all data - using direct SQL queries"""
    try:
        with connection.cursor() as cursor:
            # Convert user_id to agent_id if needed
            cursor.execute("""
                SELECT da.agent_id 
                FROM delivery_agents da 
                WHERE da.user_id = %s OR da.agent_id = %s
            """, [agent_id, agent_id])
            
            agent_record = cursor.fetchone()
            if not agent_record:
                return JsonResponse({
                    'success': False,
                    'error': 'Delivery agent not found'
                }, status=404)
            
            # Extract the actual value from the database result to avoid VariableWrapper error
            actual_agent_id = agent_record[0]
            # Ensure we're passing the actual integer value, not a VariableWrapper
            if hasattr(actual_agent_id, 'value'):
                actual_agent_id = actual_agent_id.value
            
            # 1. Get agent statistics using direct SQL queries
            # Total assignments
            cursor.execute("""
                SELECT COUNT(*) 
                FROM order_assignments
                WHERE agent_id = %s
            """, [actual_agent_id])
            total_assignments = cursor.fetchone()[0] or 0

            # Pending assignments
            cursor.execute("""
                SELECT COUNT(*) 
                FROM order_assignments oa
                JOIN orders o ON oa.order_id = o.order_id
                JOIN order_statuses os ON o.status_id = os.status_id
                WHERE oa.agent_id = %s
                AND os.status_name IN ('Processing', 'Shipped', 'Out for Delivery')
                AND oa.completed_at IS NULL
            """, [actual_agent_id])
            pending_assignments = cursor.fetchone()[0] or 0

            # Completed assignments
            cursor.execute("""
                SELECT COUNT(*) 
                FROM order_assignments oa
                JOIN orders o ON oa.order_id = o.order_id
                JOIN order_statuses os ON o.status_id = os.status_id
                WHERE oa.agent_id = %s
                AND os.status_name = 'Delivered'
            """, [actual_agent_id])
            completed_assignments = cursor.fetchone()[0] or 0

            # Total earnings (5% of order total)
            cursor.execute("""
                SELECT NVL(SUM(o.total_amount * 0.05), 0) 
                FROM orders o
                JOIN order_assignments oa ON o.order_id = oa.order_id
                JOIN order_statuses os ON o.status_id = os.status_id
                WHERE oa.agent_id = %s
                AND os.status_name = 'Delivered'
            """, [actual_agent_id])
            total_earnings = cursor.fetchone()[0] or 0

            # Average delivery time in hours
            cursor.execute("""
                SELECT NVL(AVG(EXTRACT(DAY FROM (NVL(oa.completed_at, o.actual_delivery_date) - oa.assigned_at)) * 24 +
                               EXTRACT(HOUR FROM (NVL(oa.completed_at, o.actual_delivery_date) - oa.assigned_at)) +
                               EXTRACT(MINUTE FROM (NVL(oa.completed_at, o.actual_delivery_date) - oa.assigned_at)) / 60), 0) 
                FROM order_assignments oa
                JOIN orders o ON oa.order_id = o.order_id
                JOIN order_statuses os ON o.status_id = os.status_id
                WHERE oa.agent_id = %s
                AND os.status_name = 'Delivered'
                AND (oa.completed_at IS NOT NULL OR o.actual_delivery_date IS NOT NULL)
            """, [actual_agent_id])
            avg_delivery_time = cursor.fetchone()[0] or 0

            # 2. Get pending orders using direct SQL
            cursor.execute("""
                SELECT 
                    o.order_id,
                    o.order_number,
                    o.order_date,
                    os.status_name AS order_status,
                    u.first_name || ' ' || u.last_name AS customer_name,
                    u.phone AS customer_phone,
                    o.delivery_address,
                    o.delivery_notes,
                    dm.name AS delivery_method,
                    o.total_amount,
                    o.estimated_delivery_date,
                    oa.assigned_at,
                    -- Order items details
                    (SELECT LISTAGG(p.name || ' (Qty: ' || oi.quantity || ')', ', ') 
                     WITHIN GROUP (ORDER BY oi.order_item_id)
                     FROM order_items oi 
                     JOIN plants p ON oi.plant_id = p.plant_id
                     WHERE oi.order_id = o.order_id) AS order_items
                FROM orders o
                JOIN order_assignments oa ON o.order_id = oa.order_id
                JOIN order_statuses os ON o.status_id = os.status_id
                JOIN users u ON o.user_id = u.user_id
                JOIN delivery_methods dm ON o.delivery_method_id = dm.method_id
                WHERE oa.agent_id = %s
                AND os.status_name IN ('Processing', 'Shipped', 'Out for Delivery')
                AND oa.completed_at IS NULL
                ORDER BY o.estimated_delivery_date ASC, o.order_date DESC
            """, [actual_agent_id])
            
            pending_orders = dictfetchall(cursor)

            # 3. Get completed orders using direct SQL
            cursor.execute("""
                SELECT 
                    o.order_id,
                    o.order_number,
                    o.order_date,
                    os.status_name AS order_status,
                    u.first_name || ' ' || u.last_name AS customer_name,
                    u.phone AS customer_phone,
                    o.delivery_address,
                    dm.name AS delivery_method,
                    o.total_amount,
                    o.actual_delivery_date,
                    oa.assigned_at,
                    oa.completed_at,
                    oa.notes AS delivery_notes,
                    dc.customer_confirmed,
                    dc.agent_confirmed,
                    dc.confirmed_date,
                    -- Delivery performance
                    CASE 
                        WHEN o.actual_delivery_date <= o.estimated_delivery_date THEN 'On Time'
                        ELSE 'Delayed'
                    END AS delivery_performance,
                    -- Order items summary
                    (SELECT LISTAGG(p.name || ' (x' || oi.quantity || ')', ', ') 
                     WITHIN GROUP (ORDER BY oi.order_item_id)
                     FROM order_items oi 
                     JOIN plants p ON oi.plant_id = p.plant_id
                     WHERE oi.order_id = o.order_id) AS items_summary
                FROM orders o
                JOIN order_assignments oa ON o.order_id = oa.order_id
                JOIN order_statuses os ON o.status_id = os.status_id
                JOIN users u ON o.user_id = u.user_id
                JOIN delivery_methods dm ON o.delivery_method_id = dm.method_id
                LEFT JOIN delivery_confirmations dc ON o.order_id = dc.order_id
                WHERE oa.agent_id = %s
                AND os.status_name = 'Delivered'
                ORDER BY o.actual_delivery_date DESC
            """, [actual_agent_id])
            
            completed_orders = dictfetchall(cursor)

            return JsonResponse({
                'success': True,
                'data': {
                    'stats': {
                        'total_assignments': total_assignments,
                        'pending_assignments': pending_assignments,
                        'completed_assignments': completed_assignments,
                        'total_earnings': float(total_earnings),
                        'avg_delivery_time': float(avg_delivery_time)
                    },
                    'pending_orders': pending_orders or [],
                    'completed_orders': completed_orders[:10] if completed_orders else []
                }
            })
            
    except Exception as e:
        import traceback
        error_traceback = traceback.format_exc()
        print(f"Dashboard Error: {error_traceback}")
        return JsonResponse({
            'success': False,
            'error': f'Dashboard error: {str(e)}',
            'traceback': error_traceback
        }, status=500)

@csrf_exempt
@require_http_methods(["GET"])
def delivery_agent_orders(request, agent_id):
    """Get all orders for a delivery agent using direct SQL"""
    try:
        status = request.GET.get('status', None)
        
        with connection.cursor() as cursor:
            # Convert user_id to agent_id if needed
            cursor.execute("""
                SELECT da.agent_id 
                FROM delivery_agents da 
                WHERE da.user_id = %s OR da.agent_id = %s
            """, [agent_id, agent_id])
            
            agent_record = cursor.fetchone()
            if not agent_record:
                return JsonResponse({
                    'success': False,
                    'error': 'Delivery agent not found'
                }, status=404)
            
            actual_agent_id = agent_record[0]
            # Extract the actual value from the database result to avoid VariableWrapper error
            if hasattr(actual_agent_id, 'value'):
                actual_agent_id = actual_agent_id.value
            
            if status:
                cursor.execute("""
                    SELECT 
                        o.order_id,
                        o.order_number,
                        o.order_date,
                        os.status_name AS order_status,
                        u.user_id AS customer_id,
                        u.first_name || ' ' || u.last_name AS customer_name,
                        u.phone AS customer_phone,
                        u.email AS customer_email,
                        o.delivery_address,
                        o.delivery_notes,
                        dm.name AS delivery_method,
                        dm.base_cost AS delivery_cost,
                        dm.estimated_days,
                        o.total_amount,
                        o.tracking_number,
                        o.estimated_delivery_date,
                        o.actual_delivery_date,
                        oa.assigned_at,
                        oa.completed_at,
                        oa.notes AS assignment_notes,
                        dc.customer_confirmed,
                        dc.agent_confirmed,
                        dc.confirmed_date,
                        -- Order items summary
                        (SELECT LISTAGG(p.name || ' (x' || oi.quantity || ')', ', ') 
                         WITHIN GROUP (ORDER BY oi.order_item_id)
                         FROM order_items oi 
                         JOIN plants p ON oi.plant_id = p.plant_id
                         WHERE oi.order_id = o.order_id) AS items_summary,
                        -- Primary image for display
                        (SELECT pi.image_url 
                         FROM order_items oi 
                         JOIN plants p ON oi.plant_id = p.plant_id
                         LEFT JOIN plant_images pi ON p.plant_id = pi.plant_id AND pi.is_primary = 1
                         WHERE oi.order_id = o.order_id AND ROWNUM = 1) AS primary_image
                    FROM orders o
                    JOIN order_assignments oa ON o.order_id = oa.order_id
                    JOIN order_statuses os ON o.status_id = os.status_id
                    JOIN users u ON o.user_id = u.user_id
                    JOIN delivery_methods dm ON o.delivery_method_id = dm.method_id
                    LEFT JOIN delivery_confirmations dc ON o.order_id = dc.order_id
                    WHERE oa.agent_id = %s
                    AND os.status_name = %s
                    ORDER BY 
                        CASE 
                            WHEN os.status_name = 'Out for Delivery' THEN 1
                            WHEN os.status_name = 'Shipped' THEN 2
                            WHEN os.status_name = 'Processing' THEN 3
                            ELSE 4
                        END,
                        o.order_date DESC
                """, [actual_agent_id, status])
            else:
                cursor.execute("""
                    SELECT 
                        o.order_id,
                        o.order_number,
                        o.order_date,
                        os.status_name AS order_status,
                        u.user_id AS customer_id,
                        u.first_name || ' ' || u.last_name AS customer_name,
                        u.phone AS customer_phone,
                        u.email AS customer_email,
                        o.delivery_address,
                        o.delivery_notes,
                        dm.name AS delivery_method,
                        dm.base_cost AS delivery_cost,
                        dm.estimated_days,
                        o.total_amount,
                        o.tracking_number,
                        o.estimated_delivery_date,
                        o.actual_delivery_date,
                        oa.assigned_at,
                        oa.completed_at,
                        oa.notes AS assignment_notes,
                        dc.customer_confirmed,
                        dc.agent_confirmed,
                        dc.confirmed_date,
                        -- Order items summary
                        (SELECT LISTAGG(p.name || ' (x' || oi.quantity || ')', ', ') 
                         WITHIN GROUP (ORDER BY oi.order_item_id)
                         FROM order_items oi 
                         JOIN plants p ON oi.plant_id = p.plant_id
                         WHERE oi.order_id = o.order_id) AS items_summary,
                        -- Primary image for display
                        (SELECT pi.image_url 
                         FROM order_items oi 
                         JOIN plants p ON oi.plant_id = p.plant_id
                         LEFT JOIN plant_images pi ON p.plant_id = pi.plant_id AND pi.is_primary = 1
                         WHERE oi.order_id = o.order_id AND ROWNUM = 1) AS primary_image
                    FROM orders o
                    JOIN order_assignments oa ON o.order_id = oa.order_id
                    JOIN order_statuses os ON o.status_id = os.status_id
                    JOIN users u ON o.user_id = u.user_id
                    JOIN delivery_methods dm ON o.delivery_method_id = dm.method_id
                    LEFT JOIN delivery_confirmations dc ON o.order_id = dc.order_id
                    WHERE oa.agent_id = %s
                    ORDER BY 
                        CASE 
                            WHEN os.status_name = 'Out for Delivery' THEN 1
                            WHEN os.status_name = 'Shipped' THEN 2
                            WHEN os.status_name = 'Processing' THEN 3
                            ELSE 4
                        END,
                        o.order_date DESC
                """, [actual_agent_id])
            
            orders = dictfetchall(cursor)
            
            return JsonResponse({
                'success': True,
                'data': orders or []
            })
            
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': f'Orders error: {str(e)}'
        }, status=500)

@csrf_exempt
@require_http_methods(["GET"])
def delivery_agent_pending_orders(request, agent_id):
    """Get pending orders for a delivery agent"""
    try:
        with connection.cursor() as cursor:
            # Convert user_id to agent_id if needed
            cursor.execute("""
                SELECT da.agent_id 
                FROM delivery_agents da 
                WHERE da.user_id = %s OR da.agent_id = %s
            """, [agent_id, agent_id])
            
            agent_record = cursor.fetchone()
            if not agent_record:
                return JsonResponse({
                    'success': False,
                    'error': 'Delivery agent not found'
                }, status=404)
            
            actual_agent_id = agent_record[0]
            # Extract the actual value from the database result to avoid VariableWrapper error
            if hasattr(actual_agent_id, 'value'):
                actual_agent_id = actual_agent_id.value
            
            result_cursor = cursor.connection.cursor()
            cursor.callproc('get_delivery_agent_pending_orders', [actual_agent_id, result_cursor])
            orders = dictfetchall(result_cursor)
            result_cursor.close()
            
            return JsonResponse({
                'success': True,
                'data': orders or []
            })
            
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': f'Pending orders error: {str(e)}'
        }, status=500)

@csrf_exempt
@require_http_methods(["GET"])
def delivery_agent_completed_orders(request, agent_id):
    """Get completed orders for a delivery agent"""
    try:
        with connection.cursor() as cursor:
            # Convert user_id to agent_id if needed
            cursor.execute("""
                SELECT da.agent_id 
                FROM delivery_agents da 
                WHERE da.user_id = %s OR da.agent_id = %s
            """, [agent_id, agent_id])
            
            agent_record = cursor.fetchone()
            if not agent_record:
                return JsonResponse({
                    'success': False,
                    'error': 'Delivery agent not found'
                }, status=404)
            
            actual_agent_id = agent_record[0]
            # Extract the actual value from the database result to avoid VariableWrapper error
            if hasattr(actual_agent_id, 'value'):
                actual_agent_id = actual_agent_id.value
            
            result_cursor = cursor.connection.cursor()
            cursor.callproc('get_delivery_agent_completed_orders', [actual_agent_id, result_cursor])
            orders = dictfetchall(result_cursor)
            result_cursor.close()
            
            return JsonResponse({
                'success': True,
                'data': orders or []
            })
            
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': f'Completed orders error: {str(e)}'
        }, status=500)



@csrf_exempt
@require_http_methods(["POST"])
def update_delivery_status(request):
    """Update delivery status for an order using direct SQL queries"""
    try:
        data = json.loads(request.body)
        order_id = data.get('order_id')
        agent_id = data.get('agent_id')
        status = data.get('status')
        notes = data.get('notes', '')
        
        if not order_id or not agent_id or not status:
            return JsonResponse({
                'success': False,
                'error': 'Missing required parameters: order_id, agent_id, status'
            }, status=400)
        
        # Extract the actual value from the database result to avoid VariableWrapper error
        if hasattr(agent_id, 'value'):
            agent_id = agent_id.value
            
        with connection.cursor() as cursor:
            # Convert user_id to agent_id if needed
            cursor.execute("""
                SELECT da.agent_id 
                FROM delivery_agents da 
                WHERE da.user_id = %s OR da.agent_id = %s
            """, [agent_id, agent_id])
            
            agent_record = cursor.fetchone()
            if not agent_record:
                return JsonResponse({
                    'success': False,
                    'error': 'Delivery agent not found'
                }, status=404)
            
            actual_agent_id = agent_record[0]
            # Extract the actual value from the database result to avoid VariableWrapper error
            if hasattr(actual_agent_id, 'value'):
                actual_agent_id = actual_agent_id.value
            
            # Check if assignment exists and belongs to this agent
            cursor.execute("""
                SELECT COUNT(*)
                FROM order_assignments oa
                WHERE oa.order_id = %s AND oa.agent_id = %s
            """, [order_id, actual_agent_id])
            
            assignment_exists = cursor.fetchone()[0]
            if assignment_exists == 0:
                return JsonResponse({
                    'success': False,
                    'error': 'Order not assigned to this delivery agent'
                }, status=400)
            
            # Get status ID
            cursor.execute("""
                SELECT status_id 
                FROM order_statuses 
                WHERE status_name = %s
            """, [status])
            
            status_result = cursor.fetchone()
            if not status_result:
                return JsonResponse({
                    'success': False,
                    'error': 'Invalid status'
                }, status=400)
            
            status_id = status_result[0]
            
            # Update order status
            cursor.execute("""
                UPDATE orders
                SET status_id = %s
                WHERE order_id = %s
            """, [status_id, order_id])
            
            # Update assignment notes if provided
            if notes:
                cursor.execute("""
                    UPDATE order_assignments
                    SET notes = %s
                    WHERE order_id = %s
                """, [notes, order_id])
            
            connection.commit()
            
            return JsonResponse({
                'success': True,
                'message': f'Order status updated to {status}'
            })
            
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'error': 'Invalid JSON data'
        }, status=400)
    except Exception as e:
        connection.rollback()
        import traceback
        error_traceback = traceback.format_exc()
        print(f"Update delivery status error: {error_traceback}")
        return JsonResponse({
            'success': False,
            'error': f'Status update error: {str(e)}'
        }, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def mark_delivery_completed(request):
    """Mark delivery as completed using direct SQL queries"""
    try:
        data = json.loads(request.body)
        order_id = data.get('order_id')
        agent_id = data.get('agent_id')
        notes = data.get('notes', '')
        
        if not order_id or not agent_id:
            return JsonResponse({
                'success': False,
                'error': 'Missing required parameters: order_id, agent_id'
            }, status=400)
        
        # Extract the actual value from the database result to avoid VariableWrapper error
        if hasattr(agent_id, 'value'):
            agent_id = agent_id.value
            
        with connection.cursor() as cursor:
            # Convert user_id to agent_id if needed
            cursor.execute("""
                SELECT da.agent_id 
                FROM delivery_agents da 
                WHERE da.user_id = %s OR da.agent_id = %s
            """, [agent_id, agent_id])
            
            agent_record = cursor.fetchone()
            if not agent_record:
                return JsonResponse({
                    'success': False,
                    'error': 'Delivery agent not found'
                }, status=404)
            
            actual_agent_id = agent_record[0]
            # Extract the actual value from the database result to avoid VariableWrapper error
            if hasattr(actual_agent_id, 'value'):
                actual_agent_id = actual_agent_id.value
            
            # Check if agent has already confirmed
            cursor.execute("""
                SELECT COUNT(*) 
                FROM delivery_confirmations 
                WHERE order_id = %s AND agent_confirmed = 1
            """, [order_id])
            
            agent_already_confirmed = cursor.fetchone()[0]
            if agent_already_confirmed > 0:
                return JsonResponse({
                    'success': False,
                    'error': 'Agent has already confirmed this delivery'
                }, status=400)
            
            # Update assignment completion time
            cursor.execute("""
                UPDATE order_assignments
                SET completed_at = SYSTIMESTAMP,
                    notes = NVL(%s, notes)
                WHERE order_id = %s
            """, [notes, order_id])
            
            # Update order status to "Out for Delivery" if not already delivered
            cursor.execute("""
                UPDATE orders
                SET status_id = (SELECT status_id FROM order_statuses WHERE status_name = 'Out for Delivery')
                WHERE order_id = %s AND status_id != (SELECT status_id FROM order_statuses WHERE status_name = 'Delivered')
            """, [order_id])
            
            # Check if delivery confirmation record exists
            cursor.execute("""
                SELECT COUNT(*) 
                FROM delivery_confirmations 
                WHERE order_id = %s
            """, [order_id])
            
            confirmation_exists = cursor.fetchone()[0]
            
            # Get customer ID
            cursor.execute("""
                SELECT user_id 
                FROM orders 
                WHERE order_id = %s
            """, [order_id])
            
            customer_id_result = cursor.fetchone()
            if not customer_id_result:
                return JsonResponse({
                    'success': False,
                    'error': 'Order not found'
                }, status=404)
            
            customer_id = customer_id_result[0]
            
            # Check current confirmation status
            cursor.execute("""
                SELECT agent_confirmed, customer_confirmed 
                FROM delivery_confirmations 
                WHERE order_id = %s
            """, [order_id])
            
            confirmation_result = cursor.fetchone()
            
            # Create delivery confirmation record if it doesn't exist
            if confirmation_exists == 0:
                cursor.execute("""
                    INSERT INTO delivery_confirmations (
                        order_id, 
                        user_id, 
                        agent_id, 
                        agent_confirmed
                    )
                    VALUES (%s, %s, %s, 1)
                """, [order_id, customer_id, actual_agent_id])
                
                # Check if customer already confirmed
                cursor.execute("""
                    SELECT customer_confirmed
                    FROM delivery_confirmations
                    WHERE order_id = %s
                """, [order_id])
                
                customer_confirmed_result = cursor.fetchone()
                if customer_confirmed_result and customer_confirmed_result[0] == 1:
                    # If customer already confirmed, mark as delivered
                    cursor.execute("""
                        UPDATE orders
                        SET status_id = (SELECT status_id FROM order_statuses WHERE status_name = 'Delivered'),
                            actual_delivery_date = SYSTIMESTAMP
                        WHERE order_id = %s
                    """, [order_id])
                else:
                    return JsonResponse({
                        'success': True,
                        'message': 'Order marked as delivered. Waiting for customer confirmation.'
                    })
            else:
                # Update existing confirmation
                cursor.execute("""
                    UPDATE delivery_confirmations
                    SET agent_confirmed = 1,
                        confirmed_date = CASE WHEN customer_confirmed = 1 THEN SYSTIMESTAMP ELSE confirmed_date END
                    WHERE order_id = %s
                """, [order_id])
                
                # Check if customer already confirmed
                if confirmation_result and confirmation_result[1] == 1:
                    # If customer already confirmed, mark as delivered
                    cursor.execute("""
                        UPDATE orders
                        SET status_id = (SELECT status_id FROM order_statuses WHERE status_name = 'Delivered'),
                            actual_delivery_date = SYSTIMESTAMP
                        WHERE order_id = %s
                    """, [order_id])
                    
                    return JsonResponse({
                        'success': True,
                        'message': 'Order delivered successfully'
                    })
                else:
                    return JsonResponse({
                        'success': True,
                        'message': 'Order marked as delivered. Waiting for customer confirmation.'
                    })
            
            connection.commit()
            
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'error': 'Invalid JSON data'
        }, status=400)
    except Exception as e:
        connection.rollback()
        import traceback
        error_traceback = traceback.format_exc()
        print(f"Mark delivery completed error: {error_traceback}")
        return JsonResponse({
            'success': False,
            'error': f'Mark delivery error: {str(e)}'
        }, status=500)

@csrf_exempt
@require_http_methods(["GET"])
def get_assignment_count(request, agent_id):
    """Get assignment count for delivery agent"""
    try:
        status = request.GET.get('status', None)
        
        with connection.cursor() as cursor:
            # Convert user_id to agent_id if needed
            cursor.execute("""
                SELECT da.agent_id 
                FROM delivery_agents da 
                WHERE da.user_id = %s OR da.agent_id = %s
            """, [agent_id, agent_id])
            
            agent_record = cursor.fetchone()
            if not agent_record:
                return JsonResponse({
                    'success': False,
                    'error': 'Delivery agent not found'
                }, status=404)
            
            actual_agent_id = agent_record[0]
            # Extract the actual value from the database result to avoid VariableWrapper error
            if hasattr(actual_agent_id, 'value'):
                actual_agent_id = actual_agent_id.value
            
            if status:
                cursor.execute("""
                    SELECT get_delivery_agent_assignment_count(%s, %s) FROM dual
                """, [actual_agent_id, status])
            else:
                cursor.execute("""
                    SELECT get_delivery_agent_assignment_count(%s, NULL) FROM dual
                """, [actual_agent_id])
            
            count = cursor.fetchone()[0]

            return JsonResponse({
                'success': True,
                'assignment_count': count or 0,
                'status_filter': status
            })
            
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': f'Assignment count error: {str(e)}'
        }, status=500)

@csrf_exempt
@require_http_methods(["GET"])
def get_agent_earnings(request, agent_id):
    """Get monthly earnings for delivery agent"""
    try:
        year = request.GET.get('year', None)
        
        with connection.cursor() as cursor:
            # Convert user_id to agent_id if needed
            cursor.execute("""
                SELECT da.agent_id 
                FROM delivery_agents da 
                WHERE da.user_id = %s OR da.agent_id = %s
            """, [agent_id, agent_id])
            
            agent_record = cursor.fetchone()
            if not agent_record:
                return JsonResponse({
                    'success': False,
                    'error': 'Delivery agent not found'
                }, status=404)
            
            actual_agent_id = agent_record[0]
            # Extract the actual value from the database result to avoid VariableWrapper error
            if hasattr(actual_agent_id, 'value'):
                actual_agent_id = actual_agent_id.value
            
            result_cursor = cursor.connection.cursor()
            
            # Handle year parameter properly
            if year:
                try:
                    year_int = int(year)
                    cursor.callproc('get_delivery_agent_monthly_earnings', [int(actual_agent_id), year_int, result_cursor])
                except ValueError:
                    # If year is not a valid integer, use current year
                    cursor.callproc('get_delivery_agent_monthly_earnings', [int(actual_agent_id), None, result_cursor])
            else:
                cursor.callproc('get_delivery_agent_monthly_earnings', [int(actual_agent_id), None, result_cursor])
            
            earnings_data = dictfetchall(result_cursor)
            result_cursor.close()

            return JsonResponse({
                'success': True,
                'monthly_earnings': earnings_data or []
            })
            
    except Exception as e:
        import traceback
        error_traceback = traceback.format_exc()
        print(f"Agent earnings error: {error_traceback}")
        return JsonResponse({
            'success': False,
            'error': f'Earnings error: {str(e)}'
        }, status=500)

# delivery_agent/views.py
@csrf_exempt
def confirm_agent_delivery(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            order_id = data.get('order_id')
            agent_id = data.get('agent_id')
            
            # Extract the actual value from the database result to avoid VariableWrapper error
            if hasattr(agent_id, 'value'):
                agent_id = agent_id.value
            
            with connection.cursor() as cursor:
                # Convert user_id to agent_id if needed
                cursor.execute("""
                    SELECT da.agent_id 
                    FROM delivery_agents da 
                    WHERE da.user_id = %s OR da.agent_id = %s
                """, [agent_id, agent_id])
                
                agent_record = cursor.fetchone()
                if not agent_record:
                    return JsonResponse({
                        'success': False, 
                        'error': 'Delivery agent not found.'
                    })
                
                actual_agent_id = agent_record[0]
                # Extract the actual value from the database result to avoid VariableWrapper error
                if hasattr(actual_agent_id, 'value'):
                    actual_agent_id = actual_agent_id.value
                
                # Get customer ID (user_id) from the order
                cursor.execute("""
                    SELECT user_id FROM orders WHERE order_id = %s
                """, [order_id])
                
                order_result = cursor.fetchone()
                if not order_result:
                    return JsonResponse({
                        'success': False, 
                        'error': 'Order not found.'
                    })
                
                user_id = order_result[0]
                
                # Check if delivery confirmation record exists, create if not
                cursor.execute("""
                    SELECT COUNT(*) FROM delivery_confirmations WHERE order_id = %s
                """, [order_id])
                
                confirmation_exists = cursor.fetchone()[0]
                if confirmation_exists == 0:
                    # Create delivery confirmation record
                    cursor.execute("""
                        INSERT INTO delivery_confirmations (order_id, user_id, agent_id, customer_confirmed, agent_confirmed)
                        VALUES (%s, %s, %s, 0, 1)
                    """, [order_id, user_id, actual_agent_id])
                else:
                    # Check if agent has already confirmed
                    cursor.execute("""
                        SELECT agent_confirmed FROM delivery_confirmations WHERE order_id = %s
                    """, [order_id])
                    
                    agent_confirmed = cursor.fetchone()[0]
                    if agent_confirmed == 1:
                        return JsonResponse({
                            'success': False, 
                            'error': 'Agent has already confirmed this delivery.'
                        })
                    
                    # Toggle agent confirmation
                    cursor.execute("""
                        UPDATE delivery_confirmations 
                        SET agent_confirmed = 1
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
                elif customer_confirmed == 1:
                    return JsonResponse({
                        'success': True,
                        'message': 'Agent confirmation recorded. Waiting for customer confirmation.'
                    })
                else:
                    return JsonResponse({
                        'success': True,
                        'message': 'Agent confirmation recorded.'
                    })
                
        except Exception as e:
            connection.rollback()
            return JsonResponse({
                'success': False,
                'error': str(e)
            }, status=500)

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
                
                # If both confirmed, update order status to Delivered
                if agent_confirmed == 1 and customer_confirmed == 1:
                    cursor.execute("""
                        UPDATE orders
                        SET status_id = (SELECT status_id FROM order_statuses WHERE status_name = 'Delivered'),
                            actual_delivery_date = SYSTIMESTAMP
                        WHERE order_id = %s
                    """, [order_id])
                    
                    connection.commit()
                    return JsonResponse({
                        'success': True,
                        'message': 'Delivery completed! Order status updated to Delivered.'
                    })
                else:
                    connection.commit()
                    if agent_confirmed == 1:
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


