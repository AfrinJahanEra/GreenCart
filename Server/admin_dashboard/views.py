from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db import connection, DatabaseError
import json
from datetime import datetime

@csrf_exempt
def apply_discount_view(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST required"}, status=400)

    data = json.loads(request.body)
    discount_type_id = data.get("discount_type_id")
    discount_value = data.get("discount_value")
    is_percentage = 1 if data.get("is_percentage") else 0
    start_date = data.get("start_date")  # "YYYY-MM-DD HH:MM:SS"
    end_date = data.get("end_date")
    category_id = data.get("category_id")
    plant_id = data.get("plant_id")

    if not all([discount_type_id, discount_value, start_date, end_date]):
        return JsonResponse({"error": "Missing required fields"}, status=400)

    start_ts = datetime.strptime(start_date, "%Y-%m-%d %H:%M:%S")
    end_ts = datetime.strptime(end_date, "%Y-%m-%d %H:%M:%S")

    with connection.cursor() as cursor:
        try:
            cursor.callproc("apply_discount", [
                discount_type_id,
                discount_value,
                is_percentage,
                start_ts,
                end_ts,
                category_id,
                plant_id
            ])
        except DatabaseError as e:
            return JsonResponse({"error": str(e)}, status=400)

    return JsonResponse({"success": True})

def order_details_view(request, order_id):
    with connection.cursor() as cursor:
        out_cursor = cursor.connection.cursor()
        try:
            cursor.callproc("get_order_details_with_delivery", [order_id, out_cursor])
            row = out_cursor.fetchone()
            if not row:
                return JsonResponse({"error": "Order not found"}, status=404)

            columns = [col[0].lower() for col in out_cursor.description]
            result = dict(zip(columns, row))

        except DatabaseError as e:
            return JsonResponse({"error": str(e)}, status=400)
        finally:
            out_cursor.close()

    return JsonResponse({"order": result})
