from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db import connection, DatabaseError
import json
import uuid

# Fetch delivery methods
def delivery_methods_view(request):
    with connection.cursor() as cursor:
        out_cursor = cursor.connection.cursor()
        try:
            cursor.callproc("get_delivery_methods", [out_cursor])
            columns = [col[0].lower() for col in out_cursor.description]
            rows = out_cursor.fetchall()
        except DatabaseError as e:
            return JsonResponse({"error": str(e)}, status=400)
        finally:
            out_cursor.close()

    methods = [dict(zip(columns, row)) for row in rows]
    return JsonResponse({"delivery_methods": methods})


# Create new order
@csrf_exempt
def create_order_view(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST required"}, status=400)

    data = json.loads(request.body)
    user_id = data.get("user_id")
    delivery_method_id = data.get("delivery_method_id")
    delivery_address = data.get("delivery_address")
    delivery_notes = data.get("delivery_notes", "")
    cart_ids = data.get("cart_ids")  # list of cart IDs

    if not all([user_id, delivery_method_id, delivery_address, cart_ids]):
        return JsonResponse({"error": "Missing required fields"}, status=400)

    order_number = str(uuid.uuid4())  # generate a unique order number

    cart_ids_str = ",".join([str(cid) for cid in cart_ids])

    with connection.cursor() as cursor:
        total_amount = cursor.var(int)
        order_id = cursor.var(int)
        try:
            cursor.callproc("create_order", [
                user_id,
                order_number,
                delivery_method_id,
                delivery_address,
                delivery_notes,
                cart_ids_str,
                total_amount,
                order_id
            ])
        except DatabaseError as e:
            return JsonResponse({"error": str(e)}, status=400)

    return JsonResponse({
        "success": True,
        "order_id": order_id.getvalue(),
        "total_amount": float(total_amount.getvalue())
    })
