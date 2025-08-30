from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db import connection, DatabaseError
import json
from datetime import datetime
import oracledb

@csrf_exempt
def get_admin_dashboard_stats(request):
    if request.method == 'GET':
        try:
            with connection.cursor() as cursor:
                # Define output parameters as Python variables
                total_customers = 0
                total_agents = 0
                total_sellers = 0
                total_revenue = 0.0
                pending_orders = 0
                low_stock_alerts = 0
                
                # Execute PL/SQL block with bind variables
                cursor.execute("""
                    BEGIN
                        get_admin_dashboard_stats(
                            :1, :2, :3, :4, :5, :6
                        );
                    END;
                """, {
                    '1': cursor.var(oracledb.NUMBER),
                    '2': cursor.var(oracledb.NUMBER),
                    '3': cursor.var(oracledb.NUMBER),
                    '4': cursor.var(oracledb.NUMBER),
                    '5': cursor.var(oracledb.NUMBER),
                    '6': cursor.var(oracledb.NUMBER)
                })
                
                # Fetch output values from bind variables
                total_customers = cursor.bindvars['1'].getvalue() or 0
                total_agents = cursor.bindvars['2'].getvalue() or 0
                total_sellers = cursor.bindvars['3'].getvalue() or 0
                total_revenue = float(cursor.bindvars['4'].getvalue() or 0)
                pending_orders = cursor.bindvars['5'].getvalue() or 0
                low_stock_alerts = cursor.bindvars['6'].getvalue() or 0
                
                return JsonResponse({
                    'status': 'success',
                    'data': {
                        'total_customers': total_customers,
                        'total_delivery_agents': total_agents,
                        'total_sellers': total_sellers,
                        'total_revenue': total_revenue,
                        'pending_orders': pending_orders,
                        'low_stock_alerts': low_stock_alerts
                    }
                }, status=200)
        except DatabaseError as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': f'Unexpected error: {str(e)}'}, status=500)
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=405)

@csrf_exempt
def get_activity_log(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            activity_type = data.get('activity_type')
            start_date = data.get('start_date')
            end_date = data.get('end_date')

            # Convert string dates to Oracle TIMESTAMP format
            start_date = datetime.strptime(start_date, '%Y-%m-%d %H:%M:%S') if start_date else None
            end_date = datetime.strptime(end_date, '%Y-%m-%d %H:%M:%S') if end_date else None

            with connection.cursor() as cursor:
                # Define output parameters
                total_activities = 0
                unique_users = 0
                most_common_type = ''
                recent_activity_count = 0
                
                # Execute PL/SQL block with bind variables
                cursor.execute("""
                    BEGIN
                        get_activity_log(
                            :1, :2, :3, :4, :5, :6, :7
                        );
                    END;
                """, {
                    '1': activity_type,
                    '2': start_date,
                    '3': end_date,
                    '4': cursor.var(oracledb.NUMBER),
                    '5': cursor.var(oracledb.NUMBER),
                    '6': cursor.var(oracledb.STRING),
                    '7': cursor.var(oracledb.NUMBER)
                })
                
                # Fetch output values
                total_activities = cursor.bindvars['4'].getvalue() or 0
                unique_users = cursor.bindvars['5'].getvalue() or 0
                most_common_type = cursor.bindvars['6'].getvalue() or 'N/A'
                recent_activity_count = cursor.bindvars['7'].getvalue() or 0
                
                return JsonResponse({
                    'status': 'success',
                    'data': {
                        'total_activities': total_activities,
                        'unique_users': unique_users,
                        'most_common_type': most_common_type,
                        'recent_activity_count': recent_activity_count
                    }
                }, status=200)
        except (DatabaseError, ValueError) as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': f'Unexpected error: {str(e)}'}, status=500)
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=405)

from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.contrib.auth.models import User  # Adjust based on your user model
from django.db.models import Count, Avg, Max

from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.db import connection
import oracledb

# Remove the permission classes decorator completely
@api_view(['GET'])
def get_user_list(request, role_name):
    try:
        # Validate role name
        valid_roles = ['customer', 'delivery', 'seller']
        if role_name.lower() not in valid_roles:
            return Response({
                'status': 'error', 
                'message': f'Invalid role. Must be one of: {", ".join(valid_roles)}'
            }, status=400)

        # Map 'delivery' to 'delivery_agent' for database compatibility
        db_role_name = 'delivery_agent' if role_name.lower() == 'delivery' else role_name.lower()

        with connection.cursor() as cursor:
            # Define output parameters
            user_details_cursor = None
            total_users = 0
            avg_metric = 0
            max_metric = 0
            
            # Execute PL/SQL block with bind variables
            cursor.execute("""
                DECLARE
                    v_user_details SYS_REFCURSOR;
                    v_total_users NUMBER;
                    v_avg_metric NUMBER;
                    v_max_metric NUMBER;
                BEGIN
                    get_user_list(:1, v_user_details, v_total_users, v_avg_metric, v_max_metric);
                    :2 := v_user_details;
                    :3 := v_total_users;
                    :4 := v_avg_metric;
                    :5 := v_max_metric;
                END;
            """, {
                '1': db_role_name,
                '2': cursor.var(oracledb.DB_TYPE_CURSOR),
                '3': cursor.var(oracledb.NUMBER),
                '4': cursor.var(oracledb.NUMBER),
                '5': cursor.var(oracledb.NUMBER)
            })
            
            # Fetch user details from cursor
            user_details_result = cursor.bindvars['2'].getvalue()
            user_details = []
            if user_details_result:
                columns = [col[0].lower() for col in user_details_result.description]
                while True:
                    row = user_details_result.fetchone()
                    if row is None:
                        break
                    user_details.append(dict(zip(columns, row)))
            
            # Fetch other output values
            total_users = cursor.bindvars['3'].getvalue() or 0
            avg_metric = float(cursor.bindvars['4'].getvalue() or 0)
            max_metric = float(cursor.bindvars['5'].getvalue() or 0)
            
            response_data = {
                'role_name': role_name,
                'total_users': total_users,
                'avg_metric': round(avg_metric, 2),
                'max_metric': max_metric,
                'users': user_details
            }

            return Response({'status': 'success', 'data': response_data})
            
    except Exception as e:
        return Response({'status': 'error', 'message': str(e)}, status=500)

@csrf_exempt
def assign_delivery_agent(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            order_id = data.get('order_id')
            agent_id = data.get('agent_id')
            
            # Add validation
            if not order_id:
                return JsonResponse({
                    'status': 'error', 
                    'message': 'Order ID is required'
                }, status=400)
            
            print(f"Attempting to assign agent {agent_id} to order {order_id}")

            with connection.cursor() as cursor:
                try:
                    # Check if order exists and get its current status
                    cursor.execute("""
                        SELECT o.order_id, o.status_id, os.status_name 
                        FROM orders o 
                        JOIN order_statuses os ON o.status_id = os.status_id 
                        WHERE o.order_id = %s
                    """, [order_id])
                    
                    order_result = cursor.fetchone()
                    if not order_result:
                        return JsonResponse({
                            'status': 'error', 
                            'message': 'Order not found'
                        }, status=404)
                    
                    print(f"Order {order_id} current status: {order_result[2]}")
                    
                    # If agent_id is provided, check if agent exists
                    if agent_id:
                        cursor.execute("""
                            SELECT agent_id, is_active 
                            FROM delivery_agents 
                            WHERE agent_id = %s
                        """, [agent_id])
                        
                        agent_result = cursor.fetchone()
                        if not agent_result:
                            return JsonResponse({
                                'status': 'error', 
                                'message': 'Delivery agent not found'
                            }, status=404)
                        
                        if agent_result[1] != 1:
                            return JsonResponse({
                                'status': 'error', 
                                'message': 'Delivery agent is not active'
                            }, status=400)
                        
                        print(f"Agent {agent_id} is valid and active")
                    
                    # Execute PL/SQL block for procedure
                    cursor.execute("""
                        BEGIN
                            assign_delivery_agent(%s, %s);
                        END;
                    """, [order_id, agent_id])
                    
                    print(f"Assignment procedure executed successfully")
                    
                    return JsonResponse({
                        'status': 'success',
                        'message': 'Delivery agent assigned successfully'
                    }, status=200)
                    
                except DatabaseError as db_error:
                    error_msg = str(db_error)
                    print(f"Database error during assignment: {error_msg}")
                    
                    # Handle specific Oracle error codes
                    if 'ORA-20001' in error_msg:
                        return JsonResponse({
                            'status': 'error', 
                            'message': 'Order is not in a state that can be assigned for delivery'
                        }, status=400)
                    elif 'ORA-20002' in error_msg:
                        return JsonResponse({
                            'status': 'error', 
                            'message': 'No available delivery agents found'
                        }, status=400)
                    elif 'ORA-20003' in error_msg:
                        return JsonResponse({
                            'status': 'error', 
                            'message': 'Specified delivery agent does not exist or is not active'
                        }, status=400)
                    elif 'ORA-20004' in error_msg:
                        return JsonResponse({
                            'status': 'error', 
                            'message': 'Selected agent has no available slots for the delivery date'
                        }, status=400)
                    elif 'ORA-20005' in error_msg:
                        return JsonResponse({
                            'status': 'error', 
                            'message': 'Order does not exist'
                        }, status=404)
                    elif 'ORA-20006' in error_msg:
                        return JsonResponse({
                            'status': 'error', 
                            'message': 'Error in assignment process. Please try again.'
                        }, status=500)
                    else:
                        return JsonResponse({
                            'status': 'error', 
                            'message': f'Database error: {error_msg}'
                        }, status=500)
                        
        except json.JSONDecodeError:
            return JsonResponse({
                'status': 'error', 
                'message': 'Invalid JSON format'
            }, status=400)
        except Exception as e:
            print(f"Unexpected error in assign_delivery_agent: {str(e)}")
            import traceback
            traceback.print_exc()
            return JsonResponse({
                'status': 'error', 
                'message': f'Server error: {str(e)}'
            }, status=500)
            
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=405)

@csrf_exempt
def get_low_stock_alerts(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            resolved = data.get('resolved')

            with connection.cursor() as cursor:
                # Define output parameters
                total_alerts = 0
                unresolved_alerts = 0
                avg_stock_level = 0.0
                most_affected_category = ''
                
                # Execute PL/SQL block with bind variables
                cursor.execute("""
                    BEGIN
                        get_low_stock_alerts(:1, :2, :3, :4, :5);
                    END;
                """, {
                    '1': resolved,
                    '2': cursor.var(oracledb.NUMBER),
                    '3': cursor.var(oracledb.NUMBER),
                    '4': cursor.var(oracledb.NUMBER),
                    '5': cursor.var(oracledb.STRING)
                })
                
                # Fetch output values
                total_alerts = cursor.bindvars['2'].getvalue() or 0
                unresolved_alerts = cursor.bindvars['3'].getvalue() or 0
                avg_stock_level = float(cursor.bindvars['4'].getvalue() or 0)
                most_affected_category = cursor.bindvars['5'].getvalue() or 'None'
                
                return JsonResponse({
                    'status': 'success',
                    'data': {
                        'total_alerts': total_alerts,
                        'unresolved_alerts': unresolved_alerts,
                        'avg_stock_level': avg_stock_level,
                        'most_affected_category': most_affected_category
                    }
                }, status=200)
        except (DatabaseError, ValueError) as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': f'Unexpected error: {str(e)}'}, status=500)
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=405)

@csrf_exempt
def get_all_orders_with_delivery(request):
    if request.method == 'GET':
        try:
            with connection.cursor() as cursor:
                # Execute PL/SQL block to call function and return cursor
                cursor.execute("""
                    DECLARE
                        v_cursor SYS_REFCURSOR;
                    BEGIN
                        v_cursor := get_all_orders_with_delivery();
                        :cursor := v_cursor;
                    END;
                """, {
                    'cursor': cursor.var(oracledb.DB_TYPE_CURSOR)
                })
                
                # Fetch results from the cursor
                result_cursor = cursor.bindvars['cursor'].getvalue()
                columns = [col[0].lower() for col in result_cursor.description]
                result = []
                while True:
                    row = result_cursor.fetchone()
                    if row is None:
                        break
                    result.append(dict(zip(columns, row)))
                
                return JsonResponse({
                    'status': 'success',
                    'data': result
                }, status=200)
        except DatabaseError as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': f'Unexpected error: {str(e)}'}, status=500)
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=405)

@csrf_exempt
def get_order_details(request, order_id):
    if request.method == 'GET':
        try:
            with connection.cursor() as cursor:
                # Execute PL/SQL block to call procedure with two cursors
                cursor.execute("""
                    DECLARE
                        v_order_details SYS_REFCURSOR;
                        v_order_items SYS_REFCURSOR;
                    BEGIN
                        get_order_details(:1, v_order_details, v_order_items);
                        :2 := v_order_details;
                        :3 := v_order_items;
                    END;
                """, {
                    '1': order_id,
                    '2': cursor.var(oracledb.DB_TYPE_CURSOR),
                    '3': cursor.var(oracledb.DB_TYPE_CURSOR)
                })
                
                # Fetch order details
                order_details_result = cursor.bindvars['2'].getvalue()
                order_details_columns = [col[0].lower() for col in order_details_result.description]
                order_details = order_details_result.fetchone()
                order_details_data = dict(zip(order_details_columns, order_details)) if order_details else {}
                
                # Fetch order items
                order_items_result = cursor.bindvars['3'].getvalue()
                order_items_columns = [col[0].lower() for col in order_items_result.description]
                order_items = []
                while True:
                    row = order_items_result.fetchone()
                    if row is None:
                        break
                    order_items.append(dict(zip(order_items_columns, row)))
                
                return JsonResponse({
                    'status': 'success',
                    'data': {
                        'order_details': order_details_data,
                        'order_items': order_items
                    }
                }, status=200)
        except DatabaseError as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': f'Unexpected error: {str(e)}'}, status=500)
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=405)

@csrf_exempt
def apply_discount(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            discount_type_id = data.get('discount_type_id')
            discount_value = data.get('discount_value')
            is_percentage = data.get('is_percentage')
            start_date = datetime.strptime(data.get('start_date'), '%Y-%m-%d %H:%M:%S')
            end_date = datetime.strptime(data.get('end_date'), '%Y-%m-%d %H:%M:%S')
            category_id = data.get('category_id')
            plant_id = data.get('plant_id')

            with connection.cursor() as cursor:
                cursor.execute("""
                    BEGIN
                        apply_discount(:1, :2, :3, :4, :5, :6, :7);
                    END;
                """, [
                    discount_type_id, discount_value, is_percentage,
                    start_date, end_date, category_id, plant_id
                ])
                
                return JsonResponse({
                    'status': 'success',
                    'message': 'Discount applied successfully'
                }, status=200)
        except (DatabaseError, ValueError) as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': f'Unexpected error: {str(e)}'}, status=500)
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=405)

@csrf_exempt
def get_order_overview(request):
    if request.method == 'GET':
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT * FROM vw_admin_order_overview")
                columns = [col[0].lower() for col in cursor.description]
                result = []
                while True:
                    row = cursor.fetchone()
                    if row is None:
                        break
                    result.append(dict(zip(columns, row)))
                
                return JsonResponse({
                    'status': 'success',
                    'data': result
                }, status=200)
        except DatabaseError as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': f'Unexpected error: {str(e)}'}, status=500)
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=405)

@csrf_exempt
def get_low_stock_details(request):
    if request.method == 'GET':
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT * FROM vw_low_stock_alerts_details")
                columns = [col[0].lower() for col in cursor.description]
                result = []
                while True:
                    row = cursor.fetchone()
                    if row is None:
                        break
                    result.append(dict(zip(columns, row)))
                
                return JsonResponse({
                    'status': 'success',
                    'data': result
                }, status=200)
        except DatabaseError as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': f'Unexpected error: {str(e)}'}, status=500)
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=405)

@csrf_exempt
def get_delivery_agent_performance(request):
    if request.method == 'GET':
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT * FROM vw_delivery_agent_performance")
                columns = [col[0].lower() for col in cursor.description]
                result = []
                while True:
                    row = cursor.fetchone()
                    if row is None:
                        break
                    result.append(dict(zip(columns, row)))
                
                return JsonResponse({
                    'status': 'success',
                    'data': result
                }, status=200)
        except DatabaseError as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': f'Unexpected error: {str(e)}'}, status=500)
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=405)

@csrf_exempt
def get_available_delivery_agents(request):
    if request.method == 'GET':
        try:
            delivery_date = request.GET.get('delivery_date')
            
            with connection.cursor() as cursor:
                if delivery_date:
                    # Get agents with available slots for specific date
                    cursor.execute("""
                        SELECT 
                            da.agent_id,
                            u.first_name || ' ' || u.last_name AS name,
                            u.email,
                            u.phone,
                            da.vehicle_type,
                            da.license_number,
                            (3 - COUNT(ds.slot_id)) AS available_slots
                        FROM delivery_agents da
                        JOIN users u ON da.user_id = u.user_id
                        LEFT JOIN delivery_slots ds ON da.agent_id = ds.agent_id 
                            AND ds.slot_date = TO_DATE(:delivery_date, 'YYYY-MM-DD')
                            AND ds.is_available = 0
                        WHERE da.is_active = 1
                        GROUP BY da.agent_id, u.first_name, u.last_name, u.email, u.phone, da.vehicle_type, da.license_number
                        HAVING COUNT(ds.slot_id) < 3
                        ORDER BY COUNT(ds.slot_id) ASC, u.first_name
                    """, {'delivery_date': delivery_date})
                else:
                    # Get all active agents with their current availability
                    cursor.execute("""
                        SELECT 
                            da.agent_id,
                            u.first_name || ' ' || u.last_name AS name,
                            u.email,
                            u.phone,
                            da.vehicle_type,
                            da.license_number,
                            (3 - COUNT(CASE WHEN ds.slot_date >= TRUNC(SYSDATE) AND ds.is_available = 0 THEN ds.slot_id END)) AS available_slots
                        FROM delivery_agents da
                        JOIN users u ON da.user_id = u.user_id
                        LEFT JOIN delivery_slots ds ON da.agent_id = ds.agent_id
                        WHERE da.is_active = 1
                        GROUP BY da.agent_id, u.first_name, u.last_name, u.email, u.phone, da.vehicle_type, da.license_number
                        HAVING COUNT(CASE WHEN ds.slot_date >= TRUNC(SYSDATE) AND ds.is_available = 0 THEN ds.slot_id END) < 3
                        ORDER BY COUNT(CASE WHEN ds.slot_date >= TRUNC(SYSDATE) AND ds.is_available = 0 THEN ds.slot_id END) ASC, u.first_name
                    """)
                
                columns = [col[0].lower() for col in cursor.description]
                result = []
                while True:
                    row = cursor.fetchone()
                    if row is None:
                        break
                    result.append(dict(zip(columns, row)))
                
                return JsonResponse({
                    'status': 'success',
                    'data': result
                }, status=200)
        except DatabaseError as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': f'Unexpected error: {str(e)}'}, status=500)
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=405)

# Delete customer endpoint
@csrf_exempt
def delete_customer(request):
    if request.method != 'POST':
        return JsonResponse({'status': 'error', 'message': 'POST method required'}, status=405)
    
    try:
        data = json.loads(request.body)
        requestor_id = data.get('requestor_id')
        customer_id = data.get('customer_id')
        
        if not requestor_id or not customer_id:
            return JsonResponse({
                'status': 'error', 
                'message': 'Requestor ID and Customer ID are required'
            }, status=400)
        
        # Call the existing delete_user_account procedure
        with connection.cursor() as cursor:
            cursor.callproc('delete_user_account', [requestor_id, customer_id])
            
        return JsonResponse({
            'status': 'success', 
            'message': 'Customer deleted successfully'
        })
        
    except json.JSONDecodeError:
        return JsonResponse({
            'status': 'error', 
            'message': 'Invalid JSON format'
        }, status=400)
    except DatabaseError as e:
        error_msg = str(e)
        if 'ORA-20042' in error_msg:
            return JsonResponse({
                'status': 'error', 
                'message': 'Not authorized to delete this customer'
            }, status=403)
        elif 'ORA-20043' in error_msg:
            return JsonResponse({
                'status': 'error', 
                'message': 'Cannot delete the last admin account'
            }, status=400)
        elif 'ORA-20044' in error_msg:
            return JsonResponse({
                'status': 'error', 
                'message': 'Customer not found'
            }, status=404)
        else:
            return JsonResponse({
                'status': 'error', 
                'message': f'Database error: {error_msg}'
            }, status=500)
    except Exception as e:
        return JsonResponse({
            'status': 'error', 
            'message': f'Server error: {str(e)}'
        }, status=500)
