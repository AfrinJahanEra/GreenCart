from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db import connection, DatabaseError
from datetime import datetime
import json

# Get all orders for a user (optionally filter by status)
def get_user_orders_view(request, user_id):
    status_name = request.GET.get("status")  # optional query param

    with connection.cursor() as cursor:
        out_cursor = cursor.connection.cursor()
        try:
            cursor.callproc("get_user_orders", [user_id, status_name, out_cursor])
            columns = [col[0].lower() for col in out_cursor.description]
            orders = [dict(zip(columns, row)) for row in out_cursor.fetchall()]
        except DatabaseError as e:
            return JsonResponse({"error": str(e)}, status=400)
        finally:
            out_cursor.close()

    return JsonResponse({"orders": orders})

def admin_dashboard_stats(request):
    with connection.cursor() as cursor:
        try:
            # Create output variables
            p_total_customers = cursor.var(int)
            p_total_delivery_agents = cursor.var(int)
            p_total_sellers = cursor.var(int)
            p_total_revenue = cursor.var(float)
            p_pending_orders = cursor.var(int)
            p_low_stock_alerts = cursor.var(int)
            
            # Use raw SQL call
            sql = """
            BEGIN
                get_admin_dashboard_stats(
                    p_total_customers => :total_customers,
                    p_total_delivery_agents => :total_delivery_agents,
                    p_total_sellers => :total_sellers,
                    p_total_revenue => :total_revenue,
                    p_pending_orders => :pending_orders,
                    p_low_stock_alerts => :low_stock_alerts
                );
            END;
            """
            
            # Execute the procedure
            cursor.execute(sql, {
                'total_customers': p_total_customers,
                'total_delivery_agents': p_total_delivery_agents,
                'total_sellers': p_total_sellers,
                'total_revenue': p_total_revenue,
                'pending_orders': p_pending_orders,
                'low_stock_alerts': p_low_stock_alerts
            })
            
            # Get the results
            result = {
                "total_customers": p_total_customers.getvalue() or 0,
                "total_delivery_agents": p_total_delivery_agents.getvalue() or 0,
                "total_sellers": p_total_sellers.getvalue() or 0,
                "total_revenue": float(p_total_revenue.getvalue() or 0),
                "pending_orders": p_pending_orders.getvalue() or 0,
                "low_stock_alerts": p_low_stock_alerts.getvalue() or 0
            }
                
        except Exception as e:
            return JsonResponse({"error": f"Database error: {str(e)}"}, status=500)
    
    return JsonResponse({"stats": result})

def get_user_list(request, role_name):
    with connection.cursor() as cursor:
        try:
            # Create output variables
            p_total_users = cursor.var(int)
            p_avg_metric = cursor.var(float)
            p_max_metric = cursor.var(int)
            
            # Use raw SQL call
            sql = """
            BEGIN
                get_user_list(
                    p_role_name => :role_name,
                    p_total_users => :total_users,
                    p_avg_metric => :avg_metric,
                    p_max_metric => :max_metric
                );
            END;
            """
            
            # Execute the procedure
            cursor.execute(sql, {
                'role_name': role_name,
                'total_users': p_total_users,
                'avg_metric': p_avg_metric,
                'max_metric': p_max_metric
            })
            
            # Get metric name based on role
            metric_name = "Total Delivered Orders" if role_name == 'customer' else \
                         "Total Completed Deliveries" if role_name == 'delivery' else \
                         "Total Plants Listed"
            
            # Get the results
            result = {
                "total_users": p_total_users.getvalue() or 0,
                "average_metric": float(p_avg_metric.getvalue() or 0),
                "max_metric": p_max_metric.getvalue() or 0,
                "metric_name": metric_name
            }
                
        except Exception as e:
            return JsonResponse({"error": f"Database error: {str(e)}"}, status=500)
    
    return JsonResponse({"user_stats": result})

@csrf_exempt
def assign_delivery_agent_view(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST required"}, status=400)
    
    try:
        import json
        data = json.loads(request.body)
        order_id = data.get("order_id")
        agent_id = data.get("agent_id")  # optional
        
        if not order_id:
            return JsonResponse({"error": "order_id is required"}, status=400)

        with connection.cursor() as cursor:
            cursor.callproc("assign_delivery_agent", [order_id, agent_id])
            
        return JsonResponse({"success": True, "message": "Delivery agent assigned successfully"})
    except DatabaseError as e:
        return JsonResponse({"error": str(e)}, status=400)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)

def assign_delivery_agent(request):
    try:
        data = json.loads(request.body)
        order_id = data.get("order_id")
        agent_id = data.get("agent_id")

        if not order_id:
            return JsonResponse({"error": "order_id is required"}, status=400)

        with connection.cursor() as cursor:
            # Extract the actual value from the database result to avoid VariableWrapper error
            if hasattr(agent_id, 'value'):
                agent_id = agent_id.value
            
            cursor.callproc("assign_delivery_agent", [int(order_id), int(agent_id) if agent_id else None])
            
        return JsonResponse({"success": True, "message": "Delivery agent assigned successfully"})
    except DatabaseError as e:
        return JsonResponse({"error": str(e)}, status=400)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)

def get_activity_log(request):
    activity_type = request.GET.get("activity_type")
    start_date_str = request.GET.get("start_date")
    end_date_str = request.GET.get("end_date")
    
    # Convert string dates to appropriate format
    start_date = None
    end_date = None
    
    if start_date_str:
        try:
            start_date = datetime.strptime(start_date_str, '%Y-%m-%d %H:%M:%S')
        except ValueError:
            return JsonResponse({"error": "Invalid start_date format. Use YYYY-MM-DD HH24:MI:SS"}, status=400)
    
    if end_date_str:
        try:
            end_date = datetime.strptime(end_date_str, '%Y-%m-%d %H:%M:%S')
        except ValueError:
            return JsonResponse({"error": "Invalid end_date format. Use YYYY-MM-DD HH24:MI:SS"}, status=400)
    
    with connection.cursor() as cursor:
        try:
            # Create output variables
            p_total_activities = cursor.var(int)
            p_unique_users = cursor.var(int)
            p_most_common_type = cursor.var(str)
            p_recent_activity_count = cursor.var(int)
            
            # Use raw SQL call
            sql = """
            BEGIN
                get_activity_log(
                    p_activity_type => :activity_type,
                    p_start_date => :start_date,
                    p_end_date => :end_date,
                    p_total_activities => :total_activities,
                    p_unique_users => :unique_users,
                    p_most_common_type => :most_common_type,
                    p_recent_activity_count => :recent_activity_count
                );
            END;
            """
            
            # Execute the procedure
            cursor.execute(sql, {
                'activity_type': activity_type,
                'start_date': start_date,
                'end_date': end_date,
                'total_activities': p_total_activities,
                'unique_users': p_unique_users,
                'most_common_type': p_most_common_type,
                'recent_activity_count': p_recent_activity_count
            })
            
            # Get the results
            result = {
                "total_activities": p_total_activities.getvalue() or 0,
                "unique_users": p_unique_users.getvalue() or 0,
                "most_common_activity_type": p_most_common_type.getvalue() or "N/A",
                "recent_24h_activities": p_recent_activity_count.getvalue() or 0
            }
                
        except Exception as e:
            return JsonResponse({"error": f"Database error: {str(e)}"}, status=500)
    
    return JsonResponse({"activity_stats": result})

def get_low_stock_alerts(request):
    resolved_param = request.GET.get("resolved")
    
    # Convert resolved parameter to number (None, 0, or 1)
    resolved = None
    if resolved_param is not None:
        try:
            resolved = 1 if resolved_param.lower() in ['true', '1', 'yes'] else 0
        except:
            resolved = None
    
    with connection.cursor() as cursor:
        try:
            # Create output variables
            p_total_alerts = cursor.var(int)
            p_unresolved_alerts = cursor.var(int)
            p_avg_stock_level = cursor.var(float)
            p_most_affected_seller = cursor.var(str)
            
            # Use raw SQL call
            sql = """
            BEGIN
                get_low_stock_alerts(
                    p_resolved => :resolved,
                    p_total_alerts => :total_alerts,
                    p_unresolved_alerts => :unresolved_alerts,
                    p_avg_stock_level => :avg_stock_level,
                    p_most_affected_seller => :most_affected_seller
                );
            END;
            """
            
            # Execute the procedure
            cursor.execute(sql, {
                'resolved': resolved,
                'total_alerts': p_total_alerts,
                'unresolved_alerts': p_unresolved_alerts,
                'avg_stock_level': p_avg_stock_level,
                'most_affected_seller': p_most_affected_seller
            })
            
            # Get the results
            result = {
                "total_alerts": p_total_alerts.getvalue() or 0,
                "unresolved_alerts": p_unresolved_alerts.getvalue() or 0,
                "average_stock_level": float(p_avg_stock_level.getvalue() or 0),
                "most_affected_seller": p_most_affected_seller.getvalue() or "None"
            }
                
        except Exception as e:
            return JsonResponse({"error": f"Database error: {str(e)}"}, status=500)
    
    return JsonResponse({"low_stock_stats": result})

