from django.http import JsonResponse
from django.db import connection, DatabaseError

def fetch_cursor(cursor):
    """Helper to convert SYS_REFCURSOR to list of dicts"""
    columns = [col[0].lower() for col in cursor.description]
    rows = cursor.fetchall()
    result = [dict(zip(columns, row)) for row in rows]
    return result


def delivery_agent_orders(request, agent_id):
    """Fetch orders assigned to a delivery agent, optionally filtered by status"""
    status_name = request.GET.get("status_name")  # optional filter

    with connection.cursor() as cursor:
        try:
            out_cursor = cursor.var(str)
            cursor.callproc("get_delivery_agent_orders", [agent_id, status_name, out_cursor])
            result = fetch_cursor(out_cursor.getvalue())
        except DatabaseError as e:
            return JsonResponse({"error": str(e)}, status=400)
    
    return JsonResponse({"orders": result})


def delivery_agent_stats(request, agent_id):
    """Fetch stats for a delivery agent: completed/pending deliveries, earnings"""
    with connection.cursor() as cursor:
        try:
            out_cursor = cursor.var(str)
            cursor.callproc("get_delivery_agent_stats", [agent_id, out_cursor])
            result = fetch_cursor(out_cursor.getvalue())
        except DatabaseError as e:
            return JsonResponse({"error": str(e)}, status=400)
    
    return JsonResponse({"stats": result})
