# delivery_agent/views.py
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db import connection
import json
from django.shortcuts import get_object_or_404

def dictfetchall(cursor):
    """Return all rows from a cursor as a dict"""
    columns = [col[0] for col in cursor.description]
    return [dict(zip(columns, row)) for row in cursor.fetchall()]

@csrf_exempt
def delivery_agent_dashboard(request, agent_id):
    if request.method == 'GET':
        try:
            with connection.cursor() as cursor:
                # First, check if agent_id is actually user_id and convert to agent_id
                # Check if this is a user_id by looking for delivery agent record
                cursor.execute("""
                    SELECT da.agent_id, da.user_id 
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
                actual_user_id = agent_record[1]
                
                results = {}
                
                # Get delivery agent personal info with enhanced details
                cursor.execute("""
                    SELECT 
                        da.agent_id,
                        u.user_id,
                        u.first_name,
                        u.last_name,
                        u.first_name || ' ' || u.last_name AS full_name,
                        u.email,
                        u.phone,
                        u.address,
                        u.created_at AS user_created_at,
                        da.vehicle_type,
                        da.license_number,
                        da.is_active,
                        r.role_name,
                        -- Calculate agent performance metrics
                        (SELECT COUNT(*) FROM order_assignments oa2 WHERE oa2.agent_id = da.agent_id) AS total_assignments,
                        (SELECT COUNT(*) FROM order_assignments oa2 
                         JOIN orders o2 ON oa2.order_id = o2.order_id 
                         JOIN order_statuses os2 ON o2.status_id = os2.status_id 
                         WHERE oa2.agent_id = da.agent_id AND os2.status_name = 'Delivered') AS completed_assignments,
                        (SELECT ROUND(AVG(o2.total_amount * 0.05), 2) FROM order_assignments oa2 
                         JOIN orders o2 ON oa2.order_id = o2.order_id 
                         JOIN order_statuses os2 ON o2.status_id = os2.status_id 
                         WHERE oa2.agent_id = da.agent_id AND os2.status_name = 'Delivered') AS avg_delivery_fee
                    FROM delivery_agents da
                    JOIN users u ON da.user_id = u.user_id
                    LEFT JOIN user_roles ur ON u.user_id = ur.user_id
                    LEFT JOIN roles r ON ur.role_id = r.role_id
                    WHERE da.agent_id = %s AND da.user_id = %s
                """, [actual_agent_id, actual_user_id])
                
                agent_info = dictfetchall(cursor)
                print(f"DEBUG - Agent Info Raw Result: {agent_info}")
                
                if agent_info:
                    results['agent_info'] = agent_info[0]
                else:
                    # Fallback query using just agent_id with minimal info
                    cursor.execute("""
                        SELECT 
                            da.agent_id,
                            u.user_id,
                            u.first_name,
                            u.last_name,
                            u.first_name || ' ' || u.last_name AS full_name,
                            u.email,
                            u.phone,
                            u.address,
                            da.vehicle_type,
                            da.license_number,
                            da.is_active,
                            'delivery_agent' AS role_name,
                            0 AS total_assignments,
                            0 AS completed_assignments,
                            0 AS avg_delivery_fee
                        FROM delivery_agents da
                        JOIN users u ON da.user_id = u.user_id
                        WHERE da.agent_id = %s
                    """, [actual_agent_id])
                    
                    agent_info_fallback = dictfetchall(cursor)
                    print(f"DEBUG - Agent Info Fallback Result: {agent_info_fallback}")
                    
                    results['agent_info'] = agent_info_fallback[0] if agent_info_fallback else {
                        'agent_id': actual_agent_id,
                        'user_id': actual_user_id,
                        'first_name': 'Unknown',
                        'last_name': 'Agent',
                        'full_name': 'Unknown Agent',
                        'email': 'N/A',
                        'phone': 'N/A',
                        'address': 'N/A',
                        'vehicle_type': 'N/A',
                        'license_number': 'N/A',
                        'is_active': 0,
                        'role_name': 'delivery_agent',
                        'total_assignments': 0,
                        'completed_assignments': 0,
                        'avg_delivery_fee': 0
                    }
                
                # 1. All assigned deliveries
                cursor.execute("""
                    SELECT 
                        o.order_id,
                        o.order_number,
                        o.order_date,
                        os.status_name AS order_status,
                        u.first_name || ' ' || u.last_name AS customer_name,
                        u.first_name AS customer_first_name,
                        u.last_name AS customer_last_name,
                        u.email AS customer_email,
                        u.phone AS customer_phone,
                        o.delivery_address,
                        o.total_amount,
                        o.estimated_delivery_date,
                        o.actual_delivery_date,
                        oa.assigned_at,
                        oa.completed_at,
                        oa.notes AS delivery_notes,
                        dm.name AS delivery_method,
                        dm.description AS delivery_method_description,
                        dm.base_cost AS delivery_cost,
                        dm.estimated_days AS delivery_time,
                        NVL(dc.customer_confirmed, 0) AS customer_confirmed,
                        NVL(dc.agent_confirmed, 0) AS agent_confirmed,
                        dc.confirmed_date,
                        ROUND(o.total_amount * 0.05, 2) AS delivery_fee,
                        (SELECT LISTAGG(p.name || ' (' || ps.size_name || ', Qty: ' || oi.quantity || ')', ', ') 
                         WITHIN GROUP (ORDER BY oi.order_item_id)
                         FROM order_items oi 
                         JOIN plants p ON oi.plant_id = p.plant_id
                         JOIN plant_sizes ps ON oi.size_id = ps.size_id
                         WHERE oi.order_id = o.order_id) AS order_items,
                        (SELECT COUNT(*) 
                         FROM order_items oi 
                         WHERE oi.order_id = o.order_id) AS total_items_count,
                        CASE 
                            WHEN os.status_name = 'Processing' THEN 'Ready for Pickup'
                            WHEN os.status_name = 'Shipped' THEN 'In Transit'
                            WHEN os.status_name = 'Out for Delivery' THEN 'Out for Delivery'
                            WHEN os.status_name = 'Delivered' THEN 'Delivered'
                            ELSE os.status_name
                        END AS delivery_status_display
                    FROM orders o
                    JOIN order_assignments oa ON o.order_id = oa.order_id
                    JOIN order_statuses os ON o.status_id = os.status_id
                    JOIN users u ON o.user_id = u.user_id
                    JOIN delivery_methods dm ON o.delivery_method_id = dm.method_id
                    LEFT JOIN delivery_confirmations dc ON o.order_id = dc.order_id
                    WHERE oa.agent_id = %s
                    ORDER BY 
                        CASE 
                            WHEN os.status_name IN ('Processing', 'Shipped') THEN 1
                            WHEN os.status_name = 'Out for Delivery' THEN 2
                            WHEN os.status_name = 'Delivered' THEN 3
                            ELSE 4
                        END,
                        o.order_date DESC
                """, [actual_agent_id])
                results['all_assignments'] = dictfetchall(cursor)
                
                # 2. Pending deliveries (assigned to this agent but not completed)
                cursor.execute("""
                    SELECT 
                        o.order_id,
                        o.order_number,
                        o.order_date,
                        os.status_name AS order_status,
                        u.first_name || ' ' || u.last_name AS customer_name,
                        u.first_name AS customer_first_name,
                        u.last_name AS customer_last_name,
                        u.email AS customer_email,
                        u.phone AS customer_phone,
                        o.delivery_address,
                        o.total_amount,
                        o.estimated_delivery_date,
                        oa.assigned_at,
                        oa.agent_id,
                        oa.notes AS delivery_notes,
                        dm.name AS delivery_method,
                        dm.description AS delivery_method_description,
                        dm.base_cost AS delivery_cost,
                        dm.estimated_days AS delivery_time,
                        NVL(dc.customer_confirmed, 0) AS customer_confirmed,
                        NVL(dc.agent_confirmed, 0) AS agent_confirmed,
                        dc.confirmed_date,
                        ROUND(o.total_amount * 0.05, 2) AS delivery_fee,
                        (SELECT LISTAGG(p.name || ' (' || ps.size_name || ', Qty: ' || oi.quantity || ')', ', ') 
                         WITHIN GROUP (ORDER BY oi.order_item_id)
                         FROM order_items oi 
                         JOIN plants p ON oi.plant_id = p.plant_id
                         JOIN plant_sizes ps ON oi.size_id = ps.size_id
                         WHERE oi.order_id = o.order_id) AS order_items,
                        (SELECT COUNT(*) 
                         FROM order_items oi 
                         WHERE oi.order_id = o.order_id) AS total_items_count,
                        CASE 
                            WHEN os.status_name = 'Processing' THEN 'Ready for Pickup'
                            WHEN os.status_name = 'Shipped' THEN 'In Transit'
                            WHEN os.status_name = 'Out for Delivery' THEN 'Out for Delivery'
                            ELSE os.status_name
                        END AS delivery_status_display,
                        CASE 
                            WHEN oa.completed_at IS NULL AND dc.agent_confirmed = 0 THEN 'Pending Pickup'
                            WHEN oa.completed_at IS NOT NULL AND dc.agent_confirmed = 1 AND dc.customer_confirmed = 0 THEN 'Awaiting Customer Confirmation'
                            ELSE 'In Progress'
                        END AS action_required
                    FROM orders o
                    JOIN order_assignments oa ON o.order_id = oa.order_id
                    JOIN order_statuses os ON o.status_id = os.status_id
                    JOIN users u ON o.user_id = u.user_id
                    JOIN delivery_methods dm ON o.delivery_method_id = dm.method_id
                    LEFT JOIN delivery_confirmations dc ON o.order_id = dc.order_id
                    WHERE oa.agent_id = %s
                    AND os.status_name IN ('Processing', 'Shipped', 'Out for Delivery')
                    AND (oa.completed_at IS NULL OR dc.agent_confirmed = 0 OR 
                         (dc.agent_confirmed = 1 AND dc.customer_confirmed = 0))
                    ORDER BY 
                        CASE 
                            WHEN os.status_name = 'Processing' THEN 1
                            WHEN os.status_name = 'Shipped' THEN 2
                            WHEN os.status_name = 'Out for Delivery' THEN 3
                            ELSE 4
                        END,
                        o.order_date ASC
                """, [actual_agent_id])
                results['pending_assignments'] = dictfetchall(cursor)
                
                # 3. Completed deliveries
                cursor.execute("""
                    SELECT 
                        o.order_id,
                        o.order_number,
                        o.order_date,
                        os.status_name AS order_status,
                        u.first_name || ' ' || u.last_name AS customer_name,
                        u.first_name AS customer_first_name,
                        u.last_name AS customer_last_name,
                        u.email AS customer_email,
                        u.phone AS customer_phone,
                        o.delivery_address,
                        o.total_amount,
                        o.actual_delivery_date,
                        oa.assigned_at,
                        oa.completed_at,
                        oa.notes AS delivery_notes,
                        dm.name AS delivery_method,
                        dm.description AS delivery_method_description,
                        dm.base_cost AS delivery_cost,
                        dm.estimated_days AS delivery_time,
                        NVL(dc.customer_confirmed, 0) AS customer_confirmed,
                        NVL(dc.agent_confirmed, 0) AS agent_confirmed,
                        dc.confirmed_date,
                        ROUND(o.total_amount * 0.05, 2) AS delivery_fee,
                        (SELECT LISTAGG(p.name || ' (' || ps.size_name || ', Qty: ' || oi.quantity || ')', ', ') 
                         WITHIN GROUP (ORDER BY oi.order_item_id)
                         FROM order_items oi 
                         JOIN plants p ON oi.plant_id = p.plant_id
                         JOIN plant_sizes ps ON oi.size_id = ps.size_id
                         WHERE oi.order_id = o.order_id) AS order_items,
                        (SELECT COUNT(*) 
                         FROM order_items oi 
                         WHERE oi.order_id = o.order_id) AS total_items_count,
                        CASE 
                            WHEN dc.customer_confirmed = 1 AND dc.agent_confirmed = 1 THEN 'Fully Confirmed'
                            WHEN dc.agent_confirmed = 1 AND dc.customer_confirmed = 0 THEN 'Awaiting Customer Confirmation'
                            ELSE 'Completed by Agent'
                        END AS completion_status
                    FROM orders o
                    JOIN order_assignments oa ON o.order_id = oa.order_id
                    JOIN order_statuses os ON o.status_id = os.status_id
                    JOIN users u ON o.user_id = u.user_id
                    JOIN delivery_methods dm ON o.delivery_method_id = dm.method_id
                    LEFT JOIN delivery_confirmations dc ON o.order_id = dc.order_id
                    WHERE oa.agent_id = %s
                    AND (os.status_name = 'Delivered' OR (oa.completed_at IS NOT NULL AND dc.agent_confirmed = 1))
                    ORDER BY COALESCE(o.actual_delivery_date, oa.completed_at) DESC
                """, [actual_agent_id])
                results['completed_assignments'] = dictfetchall(cursor)
                
                # 4. Delivery statistics
                cursor.execute("""
                    SELECT 
                        COUNT(*) AS total_deliveries,
                        SUM(CASE WHEN os.status_name = 'Delivered' THEN 1 ELSE 0 END) AS completed_deliveries,
                        SUM(CASE WHEN os.status_name IN ('Processing', 'Shipped', 'Out for Delivery') THEN 1 ELSE 0 END) AS pending_deliveries,
                        SUM(CASE WHEN os.status_name = 'Delivered' THEN o.total_amount * 0.05 ELSE 0 END) AS total_earnings,
                        AVG(CASE WHEN os.status_name = 'Delivered' THEN o.total_amount * 0.05 ELSE NULL END) AS avg_earnings_per_delivery,
                        ROUND((SUM(CASE WHEN os.status_name = 'Delivered' THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0)) * 100, 2) AS completion_rate
                    FROM orders o
                    JOIN order_assignments oa ON o.order_id = oa.order_id
                    JOIN order_statuses os ON o.status_id = os.status_id
                    WHERE oa.agent_id = %s
                """, [actual_agent_id])
                stats = dictfetchall(cursor)
                
                # Manual calculation to double-check
                cursor.execute("""
                    SELECT COUNT(*) FROM order_assignments WHERE agent_id = %s
                """, [actual_agent_id])
                manual_total = cursor.fetchone()[0]
                
                if stats and len(stats) > 0:
                    stats_data = stats[0]
                    # Ensure pending deliveries matches our manual count
                    stats_data['pending_deliveries'] = len(results.get('pending_assignments', []))
                    stats_data['total_deliveries'] = manual_total
                    results['stats'] = stats_data
                else:
                    results['stats'] = {
                        'total_deliveries': manual_total,
                        'completed_deliveries': 0,
                        'pending_deliveries': len(results.get('pending_assignments', [])),
                        'total_earnings': 0,
                        'avg_earnings_per_delivery': 0,
                        'completion_rate': 0
                    }
                
                # Debug: Print agent info and stats
                print(f"DEBUG - Agent ID: {actual_agent_id}")
                print(f"DEBUG - Agent Info Query Result: {agent_info}")
                print(f"DEBUG - Stats Query Result: {stats}")
                print(f"DEBUG - All Assignments Count: {len(results['all_assignments'])}")
                print(f"DEBUG - Pending Assignments Count: {len(results['pending_assignments'])}")
                print(f"DEBUG - Completed Assignments Count: {len(results['completed_assignments'])}")
                
                # 5. Delivery history (last 30 days)
                cursor.execute("""
                    SELECT 
                        o.order_id,
                        o.order_number,
                        o.order_date,
                        os.status_name AS order_status,
                        u.first_name || ' ' || u.last_name AS customer_name,
                        u.email AS customer_email,
                        u.phone AS customer_phone,
                        o.delivery_address,
                        o.total_amount,
                        o.actual_delivery_date,
                        oa.completed_at,
                        oa.notes AS delivery_notes,
                        dm.name AS delivery_method,
                        dm.estimated_days AS delivery_time,
                        NVL(dc.customer_confirmed, 0) AS customer_confirmed,
                        NVL(dc.agent_confirmed, 0) AS agent_confirmed,
                        dc.confirmed_date,
                        ROUND(o.total_amount * 0.05, 2) AS delivery_fee,
                        (SELECT COUNT(*) FROM order_items WHERE order_id = o.order_id) AS item_count
                    FROM orders o
                    JOIN order_assignments oa ON o.order_id = oa.order_id
                    JOIN order_statuses os ON o.status_id = os.status_id
                    JOIN users u ON o.user_id = u.user_id
                    JOIN delivery_methods dm ON o.delivery_method_id = dm.method_id
                    LEFT JOIN delivery_confirmations dc ON o.order_id = dc.order_id
                    WHERE oa.agent_id = %s
                    AND o.order_date >= SYSDATE - 30
                    ORDER BY o.order_date DESC
                """, [actual_agent_id])
                results['history'] = dictfetchall(cursor)

                return JsonResponse({
                    'success': True,
                    'data': results
                })

        except Exception as e:
            import traceback
            error_details = {
                'error_type': type(e).__name__,
                'error_message': str(e),
                'traceback': traceback.format_exc()
            }
            print(f"Dashboard Error: {error_details}")
            return JsonResponse({
                'success': False,
                'error': str(e),
                'error_details': error_details
            }, status=500)

@csrf_exempt
def mark_delivery_completed(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            order_id = data.get('order_id')
            agent_id = data.get('agent_id')  # This might be user_id
            notes = data.get('notes', '')

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
                        'message': 'Delivery agent not found'
                    }, status=404)
                
                actual_agent_id = agent_record[0]
                # 1. Check if assignment exists and belongs to this agent
                cursor.execute("""
                    SELECT COUNT(*) 
                    FROM order_assignments 
                    WHERE order_id = %s AND agent_id = %s
                """, [order_id, actual_agent_id])
                
                assignment_exists = cursor.fetchone()[0]
                if assignment_exists == 0:
                    return JsonResponse({
                        'success': False,
                        'message': 'Order not assigned to this delivery agent'
                    }, status=400)

                # 2. Update assignment completion time
                cursor.execute("""
                    UPDATE order_assignments
                    SET completed_at = SYSTIMESTAMP,
                        notes = COALESCE(%s, notes)
                    WHERE order_id = %s
                """, [notes, order_id])

                # 3. Update order status to "Out for Delivery"
                cursor.execute("""
                    UPDATE orders
                    SET status_id = (SELECT status_id FROM order_statuses WHERE status_name = 'Out for Delivery')
                    WHERE order_id = %s
                    AND status_id != (SELECT status_id FROM order_statuses WHERE status_name = 'Delivered')
                """, [order_id])

                # 4. Create or update delivery confirmation record
                cursor.execute("""
                    MERGE INTO delivery_confirmations dc
                    USING (SELECT %s AS order_id, 
                                  (SELECT user_id FROM orders WHERE order_id = %s) AS user_id,
                                  %s AS agent_id FROM dual) src
                    ON (dc.order_id = src.order_id)
                    WHEN MATCHED THEN
                        UPDATE SET 
                            agent_confirmed = 1,
                            confirmed_date = CASE WHEN customer_confirmed = 1 THEN SYSTIMESTAMP ELSE confirmed_date END
                    WHEN NOT MATCHED THEN
                        INSERT (order_id, user_id, agent_id, agent_confirmed)
                        VALUES (src.order_id, src.user_id, src.agent_id, 1)
                """, [order_id, order_id, actual_agent_id])

                # 5. If customer already confirmed, mark as delivered
                cursor.execute("""
                    UPDATE orders
                    SET status_id = (SELECT status_id FROM order_statuses WHERE status_name = 'Delivered'),
                        actual_delivery_date = SYSTIMESTAMP
                    WHERE order_id = %s
                    AND EXISTS (
                        SELECT 1 FROM delivery_confirmations 
                        WHERE order_id = %s AND customer_confirmed = 1
                    )
                """, [order_id, order_id])

                connection.commit()

                return JsonResponse({
                    'success': True,
                    'message': 'Delivery marked as delivered successfully. Waiting for customer confirmation.'
                })

        except Exception as e:
            connection.rollback()
            return JsonResponse({
                'success': False,
                'error': str(e)
            }, status=500)

@csrf_exempt
def get_assignment_count(request, agent_id):
    if request.method == 'GET':
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
                if status:
                    cursor.execute("""
                        SELECT COUNT(*)
                        FROM order_assignments oa
                        JOIN orders o ON oa.order_id = o.order_id
                        JOIN order_statuses os ON o.status_id = os.status_id
                        WHERE oa.agent_id = %s
                        AND os.status_name = %s
                        AND oa.completed_at IS NULL
                    """, [actual_agent_id, status])
                else:
                    cursor.execute("""
                        SELECT COUNT(*)
                        FROM order_assignments oa
                        JOIN orders o ON oa.order_id = o.order_id
                        WHERE oa.agent_id = %s
                        AND oa.completed_at IS NULL
                    """, [actual_agent_id])
                
                count = cursor.fetchone()[0]

                return JsonResponse({
                    'success': True,
                    'agent_id': actual_agent_id,
                    'status_filter': status,
                    'assignment_count': count
                })

        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': str(e)
            }, status=500)

@csrf_exempt
def confirm_agent_delivery(request):
    """Enhanced delivery confirmation with detailed status management"""
    if request.method == 'POST':
        try:
            # Debug: Log the raw request body
            print(f"DEBUG - Request body: {request.body}")
            print(f"DEBUG - Request content type: {request.content_type}")
            
            data = json.loads(request.body)
            print(f"DEBUG - Parsed data: {data}")
            
            order_id = data.get('order_id')
            agent_id = data.get('agent_id')  # This might be user_id
            notes = data.get('notes', '')
            confirmation_type = data.get('type', 'delivered')  # 'delivered' or 'picked_up'
            
            # Validate required parameters
            if not order_id:
                return JsonResponse({
                    'success': False,
                    'message': 'order_id is required'
                }, status=400)
            
            if not agent_id:
                return JsonResponse({
                    'success': False,
                    'message': 'agent_id is required'
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
                        'message': 'Delivery agent not found'
                    }, status=404)
                
                actual_agent_id = agent_record[0]
                
                # 1. Verify assignment exists and belongs to this agent
                cursor.execute("""
                    SELECT oa.assignment_id, o.status_id, os.status_name
                    FROM order_assignments oa 
                    JOIN orders o ON oa.order_id = o.order_id
                    JOIN order_statuses os ON o.status_id = os.status_id
                    WHERE oa.order_id = %s AND oa.agent_id = %s
                """, [order_id, actual_agent_id])
                
                assignment = cursor.fetchone()
                if not assignment:
                    return JsonResponse({
                        'success': False,
                        'message': 'Order not assigned to this delivery agent'
                    }, status=400)
                
                assignment_id, current_status_id, current_status = assignment
                
                # 2. Handle different confirmation types
                if confirmation_type == 'picked_up':
                    # Mark as picked up - change status to "Shipped"
                    cursor.execute("""
                        UPDATE orders
                        SET status_id = (SELECT status_id FROM order_statuses WHERE status_name = 'Shipped')
                        WHERE order_id = %s
                    """, [order_id])
                    
                    cursor.execute("""
                        UPDATE order_assignments
                        SET notes = COALESCE(%s, notes)
                        WHERE order_id = %s
                    """, [notes, order_id])
                    
                    message = 'Order marked as picked up and in transit.'
                    
                elif confirmation_type == 'delivered':
                    # Mark as delivered - change status to "Out for Delivery" and set agent confirmation
                    cursor.execute("""
                        UPDATE order_assignments
                        SET completed_at = SYSTIMESTAMP,
                            notes = COALESCE(%s, notes)
                        WHERE order_id = %s
                    """, [notes, order_id])

                    cursor.execute("""
                        UPDATE orders
                        SET status_id = (SELECT status_id FROM order_statuses WHERE status_name = 'Out for Delivery')
                        WHERE order_id = %s
                        AND status_id != (SELECT status_id FROM order_statuses WHERE status_name = 'Delivered')
                    """, [order_id])

                    # Create or update delivery confirmation record
                    cursor.execute("""
                        MERGE INTO delivery_confirmations dc
                        USING (SELECT %s AS order_id, 
                                      (SELECT user_id FROM orders WHERE order_id = %s) AS user_id,
                                      %s AS agent_id FROM dual) src
                        ON (dc.order_id = src.order_id)
                        WHEN MATCHED THEN
                            UPDATE SET 
                                agent_confirmed = 1,
                                confirmed_date = CASE WHEN customer_confirmed = 1 THEN SYSTIMESTAMP ELSE confirmed_date END
                        WHEN NOT MATCHED THEN
                            INSERT (order_id, user_id, agent_id, agent_confirmed)
                            VALUES (src.order_id, src.user_id, src.agent_id, 1)
                    """, [order_id, order_id, actual_agent_id])

                    # If customer already confirmed, mark as fully delivered
                    cursor.execute("""
                        UPDATE orders
                        SET status_id = (SELECT status_id FROM order_statuses WHERE status_name = 'Delivered'),
                            actual_delivery_date = SYSTIMESTAMP
                        WHERE order_id = %s
                        AND EXISTS (
                            SELECT 1 FROM delivery_confirmations 
                            WHERE order_id = %s AND customer_confirmed = 1 AND agent_confirmed = 1
                        )
                    """, [order_id, order_id])

                    message = 'Delivery marked as completed by agent. Waiting for customer confirmation.'
                
                else:
                    return JsonResponse({
                        'success': False,
                        'message': 'Invalid confirmation type. Use "picked_up" or "delivered".'
                    }, status=400)

                connection.commit()

                return JsonResponse({
                    'success': True,
                    'message': message,
                    'confirmation_type': confirmation_type,
                    'order_id': order_id
                })

        except json.JSONDecodeError as e:
            print(f"JSON decode error: {e}")
            return JsonResponse({
                'success': False,
                'message': f'Invalid JSON in request body: {str(e)}'
            }, status=400)
        except Exception as e:
            connection.rollback()
            import traceback
            print(f"Error in confirm_agent_delivery: {traceback.format_exc()}")
            return JsonResponse({
                'success': False,
                'error': str(e)
            }, status=500)
    
    return JsonResponse({
        'success': False,
        'message': 'Only POST method allowed'
    }, status=405)

@csrf_exempt
def get_agent_earnings(request, agent_id):
    if request.method == 'GET':
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
                if year:
                    cursor.execute("""
                        SELECT 
                            EXTRACT(MONTH FROM o.actual_delivery_date) AS month,
                            TO_CHAR(o.actual_delivery_date, 'Month') AS month_name,
                            COUNT(*) AS deliveries_completed,
                            SUM(o.total_amount * 0.05) AS monthly_earnings,
                            AVG(o.total_amount * 0.05) AS avg_earnings_per_delivery
                        FROM orders o
                        JOIN order_assignments oa ON o.order_id = oa.order_id
                        JOIN order_statuses os ON o.status_id = os.status_id
                        WHERE oa.agent_id = %s
                        AND os.status_name = 'Delivered'
                        AND EXTRACT(YEAR FROM o.actual_delivery_date) = %s
                        GROUP BY EXTRACT(MONTH FROM o.actual_delivery_date), TO_CHAR(o.actual_delivery_date, 'Month')
                        ORDER BY EXTRACT(MONTH FROM o.actual_delivery_date)
                    """, [actual_agent_id, int(year)])
                else:
                    cursor.execute("""
                        SELECT 
                            EXTRACT(MONTH FROM o.actual_delivery_date) AS month,
                            TO_CHAR(o.actual_delivery_date, 'Month') AS month_name,
                            COUNT(*) AS deliveries_completed,
                            SUM(o.total_amount * 0.05) AS monthly_earnings,
                            AVG(o.total_amount * 0.05) AS avg_earnings_per_delivery
                        FROM orders o
                        JOIN order_assignments oa ON o.order_id = oa.order_id
                        JOIN order_statuses os ON o.status_id = os.status_id
                        WHERE oa.agent_id = %s
                        AND os.status_name = 'Delivered'
                        GROUP BY EXTRACT(MONTH FROM o.actual_delivery_date), TO_CHAR(o.actual_delivery_date, 'Month')
                        ORDER BY EXTRACT(MONTH FROM o.actual_delivery_date)
                    """, [actual_agent_id])
                
                earnings_data = dictfetchall(cursor)

                return JsonResponse({
                    'success': True,
                    'agent_id': actual_agent_id,
                    'year': year,
                    'monthly_earnings': earnings_data
                })

        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': str(e)
            }, status=500)