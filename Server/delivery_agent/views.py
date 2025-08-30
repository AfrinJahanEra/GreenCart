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
                AND oa.completed_at IS NOT NULL
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
                SELECT NVL(AVG(EXTRACT(DAY FROM (oa.completed_at - oa.assigned_at)) * 24 +
                               EXTRACT(HOUR FROM (oa.completed_at - oa.assigned_at)) +
                               EXTRACT(MINUTE FROM (oa.completed_at - oa.assigned_at)) / 60), 0) 
                FROM order_assignments oa
                JOIN orders o ON oa.order_id = o.order_id
                JOIN order_statuses os ON o.status_id = os.status_id
                WHERE oa.agent_id = %s
                AND os.status_name = 'Delivered'
                AND oa.completed_at IS NOT NULL
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
                AND oa.completed_at IS NOT NULL
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
@require_http_methods(["GET"])
def delivery_agent_stats(request, agent_id):
    """Get delivery agent statistics"""
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
            
            total_assignments = cursor.var(int)
            pending_assignments = cursor.var(int)
            completed_assignments = cursor.var(int)
            total_earnings = cursor.var(float)
            avg_delivery_time = cursor.var(float)
            
            cursor.callproc('get_delivery_agent_stats', [
                actual_agent_id,
                total_assignments,
                pending_assignments,
                completed_assignments,
                total_earnings,
                avg_delivery_time
            ])
            
            return JsonResponse({
                'success': True,
                'data': {
                    'total_assignments': total_assignments.getvalue() or 0,
                    'pending_assignments': pending_assignments.getvalue() or 0,
                    'completed_assignments': completed_assignments.getvalue() or 0,
                    'total_earnings': float(total_earnings.getvalue() or 0),
                    'avg_delivery_time': float(avg_delivery_time.getvalue() or 0)
                }
            })
            
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': f'Stats error: {str(e)}'
        }, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def update_delivery_status(request):
    """Update delivery status for an order using stored procedure"""
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
            
            # Call the stored procedure
            success_var = cursor.var(int)
            message_var = cursor.var(str)
            
            cursor.callproc('update_delivery_status', [
                int(order_id),
                actual_agent_id,
                status,
                notes,
                success_var,
                message_var
            ])
            
            success = success_var.getvalue()
            message = message_var.getvalue()
            
            return JsonResponse({
                'success': bool(success),
                'message': message
            })
            
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'error': 'Invalid JSON data'
        }, status=400)
    except Exception as e:
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
    """Mark delivery as completed using stored procedure"""
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
            
            # Call the stored procedure
            success_var = cursor.var(int)
            message_var = cursor.var(str)
            
            cursor.callproc('mark_delivery_delivered', [
                int(order_id),
                actual_agent_id,
                notes,
                success_var,
                message_var
            ])
            
            success = success_var.getvalue()
            message = message_var.getvalue()
            
            return JsonResponse({
                'success': bool(success),
                'message': message
            })
            
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'error': 'Invalid JSON data'
        }, status=400)
    except Exception as e:
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
            
            if year:
                cursor.callproc('get_delivery_agent_monthly_earnings', [actual_agent_id, int(year), result_cursor])
            else:
                cursor.callproc('get_delivery_agent_monthly_earnings', [actual_agent_id, None, result_cursor])
            
            earnings_data = dictfetchall(result_cursor)
            result_cursor.close()

            return JsonResponse({
                'success': True,
                'monthly_earnings': earnings_data or []
            })
            
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': f'Earnings error: {str(e)}'
        }, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def confirm_agent_delivery(request):
    """Confirm delivery by agent using stored procedure"""
    try:
        data = json.loads(request.body)
        order_id = data.get('order_id')
        agent_id = data.get('agent_id')
        notes = data.get('notes', '')
        confirmation_type = data.get('type', 'delivered')  # Could be 'delivered' or other types
        
        if not order_id or not agent_id:
            return JsonResponse({
                'success': False,
                'error': 'Missing required parameters: order_id, agent_id'
            }, status=400)
        
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
            
            # For delivery confirmation, we use the update_delivery_status procedure with 'DELIVERED' status
            success_var = cursor.var(int)
            message_var = cursor.var(str)
            
            cursor.callproc('update_delivery_status', [
                int(order_id),
                actual_agent_id,
                'DELIVERED',
                notes,
                success_var,
                message_var
            ])
            
            success = success_var.getvalue()
            message = message_var.getvalue()
            
            return JsonResponse({
                'success': bool(success),
                'message': message
            })
            
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'error': 'Invalid JSON data'
        }, status=400)
    except Exception as e:
        import traceback
        error_traceback = traceback.format_exc()
        print(f"Confirm delivery error: {error_traceback}")
        return JsonResponse({
            'success': False,
            'error': f'Delivery confirmation error: {str(e)}'
        }, status=500)