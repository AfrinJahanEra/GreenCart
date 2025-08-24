from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db import connection, DatabaseError
import json

@csrf_exempt
def confirm_delivery_view(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST required"}, status=400)

    try:
        data = json.loads(request.body)
        order_id = data.get("order_id")
        user_type = data.get("user_type")  # 'customer' or 'agent'
        user_id = data.get("user_id")

        if not all([order_id, user_type, user_id]):
            return JsonResponse({"error": "order_id, user_type, and user_id are required"}, status=400)

        with connection.cursor() as cursor:
            try:
                cursor.callproc("confirm_delivery", [order_id, user_type, user_id])
            except DatabaseError as e:
                return JsonResponse({"error": str(e)}, status=400)

        return JsonResponse({"success": True, "message": "Delivery confirmed successfully"})

    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)
