from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db import connection, DatabaseError
import json

# Fetch cart items
@csrf_exempt
def cart_sidebar_view(request, user_id):
    with connection.cursor() as cursor:
        out_cursor = cursor.connection.cursor()
        try:
            cursor.callproc("get_user_cart", [user_id, out_cursor])
            columns = [col[0].lower() for col in out_cursor.description]
            rows = out_cursor.fetchall()
        except DatabaseError as e:
            return JsonResponse({"error": str(e)}, status=400)
        finally:
            out_cursor.close()

    cart_items = []
    for row in rows:
        cart_items.append(dict(zip(columns, row)))

    return JsonResponse({"cart_items": cart_items})


# Add this to your views.py
@csrf_exempt
def add_to_cart_view(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST required"}, status=400)

    data = json.loads(request.body)
    user_id = data.get("user_id")
    plant_id = data.get("plant_id")
    size = data.get("size")
    quantity = data.get("quantity", 1)

    with connection.cursor() as cursor:
        try:
            cursor.callproc("add_to_cart", [user_id, plant_id, size, quantity])
        except DatabaseError as e:
            return JsonResponse({"error": str(e)}, status=400)

    return JsonResponse({"success": True})

# Toggle cart item selection
@csrf_exempt
def toggle_cart_item_view(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST required"}, status=400)

    data = json.loads(request.body)
    cart_id = data.get("cart_id")
    user_id = data.get("user_id")

    with connection.cursor() as cursor:
        try:
            cursor.callproc("toggle_cart_item_selection", [cart_id, user_id])
        except DatabaseError as e:
            return JsonResponse({"error": str(e)}, status=400)

    return JsonResponse({"success": True})


# Update cart item quantity
@csrf_exempt
def update_cart_item_quantity_view(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST required"}, status=400)

    data = json.loads(request.body)
    cart_id = data.get("cart_id")
    user_id = data.get("user_id")
    quantity = data.get("quantity")

    with connection.cursor() as cursor:
        try:
            cursor.callproc("update_cart_item_quantity", [cart_id, user_id, quantity])
        except DatabaseError as e:
            return JsonResponse({"error": str(e)}, status=400)

    return JsonResponse({"success": True})


# Delete cart item
@csrf_exempt
def delete_cart_item_view(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST required"}, status=400)

    data = json.loads(request.body)
    cart_id = data.get("cart_id")
    user_id = data.get("user_id")

    with connection.cursor() as cursor:
        try:
            cursor.callproc("delete_cart_item", [cart_id, user_id])
        except DatabaseError as e:
            return JsonResponse({"error": str(e)}, status=400)

    return JsonResponse({"success": True})
