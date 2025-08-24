from django.http import JsonResponse
from django.db import connection, DatabaseError
import cloudinary
import os
from dotenv import load_dotenv

load_dotenv()

cloudinary.config(
    cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
    api_key=os.getenv('CLOUDINARY_API_KEY'),
    api_secret=os.getenv('CLOUDINARY_API_SECRET')
)


def fetch_cursor(out_cursor):
    columns = [col[0].lower() for col in out_cursor.description]
    rows = out_cursor.fetchall()
    return [dict(zip(columns, row)) for row in rows]

def seller_stats(request, seller_id):
    with connection.cursor() as cursor:
        out_cursor = cursor.connection.cursor()
        try:
            cursor.callproc("get_seller_stats", [seller_id, out_cursor])
            result = fetch_cursor(out_cursor)
        except DatabaseError as e:
            return JsonResponse({"error": str(e)}, status=400)
        finally:
            out_cursor.close()

    return JsonResponse({"stats": result})

def seller_plants(request, seller_id):
    """Get list of active plants for a seller"""
    with connection.cursor() as cursor:
        out_cursor = cursor.connection.cursor()
        try:
            cursor.callproc("get_seller_plants", [seller_id, out_cursor])
            result = fetch_cursor(out_cursor)
        except DatabaseError as e:
            return JsonResponse({"error": str(e)}, status=400)
        finally:
            out_cursor.close()
    return JsonResponse({"plants": result})


def seller_sales(request, seller_id):
    """Get all delivered sales for a seller"""
    with connection.cursor() as cursor:
        out_cursor = cursor.connection.cursor()
        try:
            cursor.callproc("get_seller_sales", [seller_id, out_cursor])
            result = fetch_cursor(out_cursor)
        except DatabaseError as e:
            return JsonResponse({"error": str(e)}, status=400)
        finally:
            out_cursor.close()
    return JsonResponse({"sales": result})


def upload_images_to_cloudinary(images_list):
    """Upload a list of images to Cloudinary and return their URLs"""
    urls = []
    for img in images_list:
        result = cloudinary.uploader.upload(img)
        urls.append(result['secure_url'])
    return urls

def add_plant(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST method required"}, status=400)
    
    data = request.POST
    files = request.FILES.getlist("images")  # multiple files from form-data

    try:
        # Upload images to Cloudinary if provided
        cloud_urls = upload_images_to_cloudinary(files) if files else None

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
                    ",".join(cloud_urls) if cloud_urls else None,  # send URLs as comma-separated string
                    data.get("features"),
                    data.get("care_tips"),
                    data.get("sizes")
                ]
            )
    except DatabaseError as e:
        return JsonResponse({"error": str(e)}, status=400)
    
    return JsonResponse({"success": True, "message": "Plant added successfully"})

def update_plant(request, requestor_id, plant_id):
    if request.method != "POST":
        return JsonResponse({"error": "POST method required"}, status=400)
    
    data = request.POST
    files = request.FILES.getlist("images")

    try:
        cloud_urls = upload_images_to_cloudinary(files) if files else None

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
                    ",".join(cloud_urls) if cloud_urls else None,
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
