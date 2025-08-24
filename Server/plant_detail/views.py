from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db import connection, DatabaseError
import json
import oracledb

def plant_details(request, plant_id):
    with connection.cursor() as cursor:
        out_cursor = cursor.connection.cursor()
        cursor.callproc("get_plant_details", [plant_id, out_cursor])
        row = out_cursor.fetchone()

        if not row:
            out_cursor.close()
            return JsonResponse({"error": "Plant not found"}, status=404)

        # Read LOB while cursor is still open
        reviews_json = None
        if row[12]:
            reviews_json = row[12].read() if hasattr(row[12], 'read') else row[12]

        out_cursor.close()

    plant_data = {
        "plant_id": row[0],
        "name": row[1],
        "description": row[2],
        "base_price": float(row[3]),
        "stock_quantity": row[4],
        "primary_image": row[5],
        "image_urls": row[6].split(',') if row[6] else [],
        "sizes": dict(item.split(':') for item in row[7].split(',')) if row[7] else {},
        "features": row[8].split(',') if row[8] else [],
        "care_tips": row[9].split(',') if row[9] else [],
        "avg_rating": float(row[10]) if row[10] else 0,
        "review_count": row[11],
        "reviews": json.loads(reviews_json) if reviews_json else []
    }

    return JsonResponse(plant_data)

@csrf_exempt
def add_to_cart_view(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST required"}, status=400)

    data = json.loads(request.body)
    user_id = data.get("user_id")
    plant_id = data.get("plant_id")
    size_id = data.get("size_id")
    quantity = data.get("quantity", 1)

    with connection.cursor() as cursor:
        try:
            cursor.callproc("add_to_cart", [user_id, plant_id, size_id, quantity])
        except oracledb.DatabaseError as e:
            return JsonResponse({"error": str(e)}, status=400)

    return JsonResponse({"success": True})

@csrf_exempt
def add_review_view(request, plant_id, user_id):
    if request.method != "POST":
        return JsonResponse({"error": "POST required"}, status=400)

    data = json.loads(request.body)
    order_id = data.get("order_id")
    rating = data.get("rating")
    review_text = data.get("review_text", "")

    with connection.cursor() as cursor:
        try:
            cursor.callproc("add_review", [user_id, plant_id, order_id, rating, review_text])
        except DatabaseError as e:
            return JsonResponse({"error": str(e)}, status=400)

    return JsonResponse({"success": True})

def get_reviews_view(request, plant_id):
    limit = int(request.GET.get("limit", 50))
    offset = int(request.GET.get("offset", 0))
    include_unapproved = int(request.GET.get("include_unapproved", 0))

    with connection.cursor() as cursor:
        out_cursor = cursor.connection.cursor()
        cursor.callproc("get_reviews_for_plant", [plant_id, include_unapproved, limit, offset, out_cursor])
        rows = out_cursor.fetchall()
        out_cursor.close()

    reviews = []
    for row in rows:
        reviews.append({
            "review_id": row[0],
            "user_id": row[1],
            "reviewer_name": row[2],
            "rating": float(row[3]),
            "review_text": row[4],
            "review_date": row[5],
            "is_approved": bool(row[6])
        })

    return JsonResponse({"reviews": reviews})

@csrf_exempt
def delete_review_view(request, requestor_id):
    if request.method != "POST":
        return JsonResponse({"error": "POST required"}, status=400)

    data = json.loads(request.body)
    review_id = data.get("review_id")

    with connection.cursor() as cursor:
        try:
            cursor.callproc("delete_review", [requestor_id, review_id])
        except oracledb.DatabaseError as e:
            return JsonResponse({"error": str(e)}, status=400)

    return JsonResponse({"success": True})