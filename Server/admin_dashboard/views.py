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

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def get_user_list(request, role_name):
    try:
        # Validate role name
        valid_roles = ['customer', 'delivery', 'seller']
        if role_name.lower() not in valid_roles:
            return Response({
                'status': 'error', 
                'message': f'Invalid role. Must be one of: {", ".join(valid_roles)}'
            }, status=400)

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
                '1': role_name.lower(),
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

            with connection.cursor() as cursor:
                # Execute PL/SQL block for procedure without output parameters
                cursor.execute("""
                    BEGIN
                        assign_delivery_agent(:1, :2);
                    END;
                """, [order_id, agent_id])
                
                return JsonResponse({
                    'status': 'success',
                    'message': 'Delivery agent assigned successfully'
                }, status=200)
        except DatabaseError as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': f'Unexpected error: {str(e)}'}, status=500)
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