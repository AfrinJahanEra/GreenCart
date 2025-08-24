from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db import connection, DatabaseError

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


def fetch_cursor(cursor):
    """Helper function to fetch all rows from a SYS_REFCURSOR as list of dicts"""
    columns = [col[0].lower() for col in cursor.description]
    rows = cursor.fetchall()
    result = [dict(zip(columns, row)) for row in rows]
    return result


def admin_dashboard_stats(request):
    with connection.cursor() as cursor:
        try:
            cursor.callproc("get_admin_dashboard_stats", [cursor.var(str)])
            cursor.execute("fetch all from :1", [cursor])  # optional, depends on Oracle setup
            result = fetch_cursor(cursor)
        except DatabaseError as e:
            return JsonResponse({"error": str(e)}, status=400)
    return JsonResponse({"data": result})


def get_user_list(request, role_name):
    with connection.cursor() as cursor:
        try:
            out_cursor = cursor.var(str)  # SYS_REFCURSOR placeholder
            cursor.callproc("get_user_list", [role_name, out_cursor])
            result = fetch_cursor(out_cursor.getvalue())
        except DatabaseError as e:
            return JsonResponse({"error": str(e)}, status=400)
    return JsonResponse({"users": result})


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


def get_activity_log(request):
    activity_type = request.GET.get("activity_type")
    start_date = request.GET.get("start_date")  # format: YYYY-MM-DD HH24:MI:SS
    end_date = request.GET.get("end_date")
    
    with connection.cursor() as cursor:
        try:
            out_cursor = cursor.var(str)
            cursor.callproc("get_activity_log", [activity_type, start_date, end_date, out_cursor])
            result = fetch_cursor(out_cursor.getvalue())
        except DatabaseError as e:
            return JsonResponse({"error": str(e)}, status=400)
    
    return JsonResponse({"activity_log": result})


def get_low_stock_alerts(request):
    resolved = request.GET.get("resolved")  # 0 or 1
    resolved = int(resolved) if resolved is not None else None

    with connection.cursor() as cursor:
        try:
            out_cursor = cursor.var(str)
            cursor.callproc("get_low_stock_alerts", [resolved, out_cursor])
            result = fetch_cursor(out_cursor.getvalue())
        except DatabaseError as e:
            return JsonResponse({"error": str(e)}, status=400)
    
    return JsonResponse({"low_stock_alerts": result})

