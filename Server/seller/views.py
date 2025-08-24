from django.http import JsonResponse
from django.db import connection, DatabaseError

def fetch_cursor(cursor):
    """Helper to convert SYS_REFCURSOR to list of dicts"""
    columns = [col[0].lower() for col in cursor.description]
    rows = cursor.fetchall()
    return [dict(zip(columns, row)) for row in rows]


def seller_stats(request, seller_id):
    """Get seller statistics: total plants, sold quantity, earnings"""
    with connection.cursor() as cursor:
        try:
            out_cursor = cursor.var(str)
            cursor.callproc("get_seller_stats", [seller_id, out_cursor])
            result = fetch_cursor(out_cursor.getvalue())
        except DatabaseError as e:
            return JsonResponse({"error": str(e)}, status=400)
    return JsonResponse({"stats": result})


def seller_plants(request, seller_id):
    """Get list of active plants for a seller"""
    with connection.cursor() as cursor:
        try:
            out_cursor = cursor.var(str)
            cursor.callproc("get_seller_plants", [seller_id, out_cursor])
            result = fetch_cursor(out_cursor.getvalue())
        except DatabaseError as e:
            return JsonResponse({"error": str(e)}, status=400)
    return JsonResponse({"plants": result})


def seller_sales(request, seller_id):
    """Get all delivered sales for a seller"""
    with connection.cursor() as cursor:
        try:
            out_cursor = cursor.var(str)
            cursor.callproc("get_seller_sales", [seller_id, out_cursor])
            result = fetch_cursor(out_cursor.getvalue())
        except DatabaseError as e:
            return JsonResponse({"error": str(e)}, status=400)
    return JsonResponse({"sales": result})


def add_plant(request):
    """Add a new plant with full details (expects POST with JSON)"""
    if request.method != "POST":
        return JsonResponse({"error": "POST method required"}, status=400)
    
    data = request.POST  # or request.body + json.loads if JSON
    try:
        with connection.cursor() as cursor:
            out_cursor = cursor.var(str)  # placeholder for procedures
            cursor.callproc(
                "add_plant",
                [
                    data.get("name"),
                    data.get("description"),
                    data.get("base_price"),
                    data.get("stock_quantity"),
                    data.get("seller_id"),
                    data.get("category_ids"),
                    data.get("images"),
                    data.get("features"),
                    data.get("care_tips"),
                    data.get("sizes")
                ]
            )
    except DatabaseError as e:
        return JsonResponse({"error": str(e)}, status=400)
    
    return JsonResponse({"success": True, "message": "Plant added successfully"})


def update_plant(request, requestor_id, plant_id):
    """Update plant details (admin or seller can call)"""
    if request.method != "POST":
        return JsonResponse({"error": "POST method required"}, status=400)
    
    data = request.POST
    try:
        with connection.cursor() as cursor:
            out_cursor = cursor.var(str)
            cursor.callproc(
                "update_plant_details",
                [
                    requestor_id,
                    plant_id,
                    data.get("name"),
                    data.get("description"),
                    data.get("base_price"),
                    data.get("stock_quantity"),
                    data.get("category_ids"),
                    data.get("images"),
                    data.get("features"),
                    data.get("care_tips"),
                    data.get("sizes")
                ]
            )
    except DatabaseError as e:
        return JsonResponse({"error": str(e)}, status=400)

    return JsonResponse({"success": True, "message": "Plant updated successfully"})


def delete_plant(request, requestor_id, plant_id):
    """Soft-delete a plant (admin or seller)"""
    try:
        with connection.cursor() as cursor:
            out_cursor = cursor.var(str)
            cursor.callproc("delete_plant", [requestor_id, plant_id])
    except DatabaseError as e:
        return JsonResponse({"error": str(e)}, status=400)
    
    return JsonResponse({"success": True, "message": "Plant deleted successfully"})
