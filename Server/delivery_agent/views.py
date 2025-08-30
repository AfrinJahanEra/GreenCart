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
                results = {}
                
                # 1. All assigned deliveries
                cursor.execute("""
                    SELECT 
                        o.order_id,
                        o.order_number,
                        o.order_date,
                        os.status_name AS order_status,
                        u.first_name || ' ' || u.last_name AS customer_name,
                        u.phone AS customer_phone,
                        o.delivery_address,
                        o.total_amount,
                        o.estimated_delivery_date,
                        oa.assigned_at,
                        oa.completed_at,
                        oa.notes,
                        dm.name AS delivery_method,
                        dm.base_cost AS delivery_cost,
                        NVL(dc.customer_confirmed, 0) AS customer_confirmed,
                        NVL(dc.agent_confirmed, 0) AS agent_confirmed,
                        dc.confirmed_date
                    FROM orders o
                    JOIN order_assignments oa ON o.order_id = oa.order_id
                    JOIN order_statuses os ON o.status_id = os.status_id
                    JOIN users u ON o.user_id = u.user_id
                    JOIN delivery_methods dm ON o.delivery_method_id = dm.method_id
                    LEFT JOIN delivery_confirmations dc ON o.order_id = dc.order_id
                    WHERE oa.agent_id = :agent_id
                    ORDER BY o.order_date DESC
                """, {'agent_id': agent_id})
                results['all_assignments'] = dictfetchall(cursor)
                
                # 2. Pending deliveries
                cursor.execute("""
                    SELECT 
                        o.order_id,
                        o.order_number,
                        o.order_date,
                        os.status_name AS order_status,
                        u.first_name || ' ' || u.last_name AS customer_name,
                        u.phone AS customer_phone,
                        o.delivery_address,
                        o.total_amount,
                        o.estimated_delivery_date,
                        oa.assigned_at,
                        dm.name AS delivery_method,
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
                    WHERE oa.agent_id = :agent_id
                    AND os.status_name IN ('Processing', 'Shipped', 'Out for Delivery')
                    AND oa.completed_at IS NULL
                    ORDER BY o.order_date DESC
                """, {'agent_id': agent_id})
                results['pending_assignments'] = dictfetchall(cursor)
                
                # 3. Completed deliveries
                cursor.execute("""
                    SELECT 
                        o.order_id,
                        o.order_number,
                        o.order_date,
                        os.status_name AS order_status,
                        u.first_name || ' ' || u.last_name AS customer_name,
                        u.phone AS customer_phone,
                        o.delivery_address,
                        o.total_amount,
                        o.actual_delivery_date,
                        oa.assigned_at,
                        oa.completed_at,
                        dm.name AS delivery_method,
                        NVL(dc.customer_confirmed, 0) AS customer_confirmed,
                        NVL(dc.agent_confirmed, 0) AS agent_confirmed,
                        dc.confirmed_date
                    FROM orders o
                    JOIN order_assignments oa ON o.order_id = oa.order_id
                    JOIN order_statuses os ON o.status_id = os.status_id
                    JOIN users u ON o.user_id = u.user_id
                    JOIN delivery_methods dm ON o.delivery_method_id = dm.method_id
                    LEFT JOIN delivery_confirmations dc ON o.order_id = dc.order_id
                    WHERE oa.agent_id = :agent_id
                    AND os.status_name = 'Delivered'
                    AND oa.completed_at IS NOT NULL
                    ORDER BY o.actual_delivery_date DESC
                """, {'agent_id': agent_id})
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
                    WHERE oa.agent_id = :agent_id
                """, {'agent_id': agent_id})
                stats = dictfetchall(cursor)
                results['stats'] = stats[0] if stats else {}
                
                # 5. Delivery history (last 30 days)
                cursor.execute("""
                    SELECT 
                        o.order_id,
                        o.order_number,
                        o.order_date,
                        os.status_name AS order_status,
                        u.first_name || ' ' || u.last_name AS customer_name,
                        o.delivery_address,
                        o.total_amount,
                        o.actual_delivery_date,
                        oa.completed_at,
                        NVL(dc.customer_confirmed, 0) AS customer_confirmed,
                        NVL(dc.agent_confirmed, 0) AS agent_confirmed,
                        dc.confirmed_date,
                        ROUND(o.total_amount * 0.05, 2) AS delivery_fee
                    FROM orders o
                    JOIN order_assignments oa ON o.order_id = oa.order_id
                    JOIN order_statuses os ON o.status_id = os.status_id
                    JOIN users u ON o.user_id = u.user_id
                    LEFT JOIN delivery_confirmations dc ON o.order_id = dc.order_id
                    WHERE oa.agent_id = :agent_id
                    AND o.order_date >= SYSDATE - 30
                    ORDER BY o.order_date DESC
                """, {'agent_id': agent_id})
                results['history'] = dictfetchall(cursor)

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
def mark_delivery_completed(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            order_id = data.get('order_id')
            agent_id = data.get('agent_id')
            notes = data.get('notes', '')

            with connection.cursor() as cursor:
                # 1. Check if assignment exists and belongs to this agent
                cursor.execute("""
                    SELECT COUNT(*) 
                    FROM order_assignments 
                    WHERE order_id = :order_id AND agent_id = :agent_id
                """, {'order_id': order_id, 'agent_id': agent_id})
                
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
                        notes = COALESCE(:notes, notes)
                    WHERE order_id = :order_id
                """, {'order_id': order_id, 'notes': notes})

                # 3. Update order status to "Out for Delivery"
                cursor.execute("""
                    UPDATE orders
                    SET status_id = (SELECT status_id FROM order_statuses WHERE status_name = 'Out for Delivery')
                    WHERE order_id = :order_id
                    AND status_id != (SELECT status_id FROM order_statuses WHERE status_name = 'Delivered')
                """, {'order_id': order_id})

                # 4. Create or update delivery confirmation record
                cursor.execute("""
                    MERGE INTO delivery_confirmations dc
                    USING (SELECT :order_id AS order_id, 
                                  (SELECT user_id FROM orders WHERE order_id = :order_id) AS user_id,
                                  :agent_id AS agent_id FROM dual) src
                    ON (dc.order_id = src.order_id)
                    WHEN MATCHED THEN
                        UPDATE SET 
                            agent_confirmed = 1,
                            confirmed_date = CASE WHEN customer_confirmed = 1 THEN SYSTIMESTAMP ELSE confirmed_date END
                    WHEN NOT MATCHED THEN
                        INSERT (order_id, user_id, agent_id, agent_confirmed)
                        VALUES (src.order_id, src.user_id, src.agent_id, 1)
                """, {'order_id': order_id, 'agent_id': agent_id})

                # 5. If customer already confirmed, mark as delivered
                cursor.execute("""
                    UPDATE orders
                    SET status_id = (SELECT status_id FROM order_statuses WHERE status_name = 'Delivered'),
                        actual_delivery_date = SYSTIMESTAMP
                    WHERE order_id = :order_id
                    AND EXISTS (
                        SELECT 1 FROM delivery_confirmations 
                        WHERE order_id = :order_id AND customer_confirmed = 1
                    )
                """, {'order_id': order_id})

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
                if status:
                    cursor.execute("""
                        SELECT COUNT(*)
                        FROM order_assignments oa
                        JOIN orders o ON oa.order_id = o.order_id
                        JOIN order_statuses os ON o.status_id = os.status_id
                        WHERE oa.agent_id = :agent_id
                        AND os.status_name = :status
                        AND oa.completed_at IS NULL
                    """, {'agent_id': agent_id, 'status': status})
                else:
                    cursor.execute("""
                        SELECT COUNT(*)
                        FROM order_assignments oa
                        JOIN orders o ON oa.order_id = o.order_id
                        WHERE oa.agent_id = :agent_id
                        AND oa.completed_at IS NULL
                    """, {'agent_id': agent_id})
                
                count = cursor.fetchone()[0]

                return JsonResponse({
                    'success': True,
                    'agent_id': agent_id,
                    'status_filter': status,
                    'assignment_count': count
                })

        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': str(e)
            }, status=500)

@csrf_exempt
def get_monthly_earnings(request, agent_id):
    if request.method == 'GET':
        try:
            year = request.GET.get('year', None)
            
            with connection.cursor() as cursor:
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
                        WHERE oa.agent_id = :agent_id
                        AND os.status_name = 'Delivered'
                        AND EXTRACT(YEAR FROM o.actual_delivery_date) = :year
                        GROUP BY EXTRACT(MONTH FROM o.actual_delivery_date), TO_CHAR(o.actual_delivery_date, 'Month')
                        ORDER BY EXTRACT(MONTH FROM o.actual_delivery_date)
                    """, {'agent_id': agent_id, 'year': int(year)})
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
                        WHERE oa.agent_id = :agent_id
                        AND os.status_name = 'Delivered'
                        GROUP BY EXTRACT(MONTH FROM o.actual_delivery_date), TO_CHAR(o.actual_delivery_date, 'Month')
                        ORDER BY EXTRACT(MONTH FROM o.actual_delivery_date)
                    """, {'agent_id': agent_id})
                
                earnings_data = dictfetchall(cursor)

                return JsonResponse({
                    'success': True,
                    'agent_id': agent_id,
                    'year': year,
                    'monthly_earnings': earnings_data
                })

        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': str(e)
            }, status=500)