from django.http import JsonResponse
from django.db import connection
import oracledb
import json

def plants_by_category(request, slug):
    rows = []
    try:
        with connection.cursor() as cursor:
            out_cursor = cursor.connection.cursor()
            cursor.callproc("get_plants_by_category_with_rating", [slug, out_cursor])
            columns = [col[0].lower() for col in out_cursor.description]
            rows = [dict(zip(columns, row)) for row in out_cursor.fetchall()]
            out_cursor.close()
        
        # Ensure image fields are properly named and id field is set
        for plant in rows:
            # Map plant_id to id for frontend compatibility
            if 'plant_id' in plant and 'id' not in plant:
                plant['id'] = plant['plant_id']
            # Map primary_image to image for frontend compatibility
            if 'primary_image' in plant and 'image' not in plant:
                plant['image'] = plant['primary_image']
            # Ensure image_url field exists
            if 'image_url' not in plant and 'image' in plant:
                plant['image_url'] = plant['image']
            # Map other fields for consistency
            if 'base_price' in plant and 'price' not in plant:
                plant['price'] = float(plant['base_price'])
            # Format rating for display
            if 'avg_rating' in plant:
                rating = float(plant['avg_rating'])
                full_stars = int(round(rating))
                plant['ratingStars'] = '★' * full_stars + '☆' * (5 - full_stars)
                plant['reviewCount'] = plant.get('review_count', 0)
                
        return JsonResponse({"plants": rows})
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

def search_plants(request):
    query = request.GET.get("q", "")
    rows = []
    try:
        with connection.cursor() as cursor:
            out_cursor = cursor.connection.cursor()
            cursor.callproc("search_plants_with_rating", [f"%{query}%", out_cursor])
            columns = [col[0].lower() for col in out_cursor.description]
            rows = [dict(zip(columns, row)) for row in out_cursor.fetchall()]
            out_cursor.close()
        
        # Ensure image fields are properly named and id field is set
        for plant in rows:
            # Map plant_id to id for frontend compatibility
            if 'plant_id' in plant and 'id' not in plant:
                plant['id'] = plant['plant_id']
            # Map primary_image to image for frontend compatibility
            if 'primary_image' in plant and 'image' not in plant:
                plant['image'] = plant['primary_image']
            # Ensure image_url field exists
            if 'image_url' not in plant and 'image' in plant:
                plant['image_url'] = plant['image']
            # Map other fields for consistency
            if 'base_price' in plant and 'price' not in plant:
                plant['price'] = float(plant['base_price'])
            # Format rating for display
            if 'avg_rating' in plant:
                rating = float(plant['avg_rating'])
                full_stars = int(round(rating))
                plant['ratingStars'] = '★' * full_stars + '☆' * (5 - full_stars)
                plant['reviewCount'] = plant.get('review_count', 0)
                
        return JsonResponse({"plants": rows})
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

def all_categories(request):
    rows = []
    try:
        with connection.cursor() as cursor:
            out_cursor = cursor.connection.cursor()
            cursor.callproc("get_all_categories", [out_cursor])
            columns = [col[0].lower() for col in out_cursor.description]
            rows = [dict(zip(columns, row)) for row in out_cursor.fetchall()]
            out_cursor.close()
        return JsonResponse({"categories": rows})
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)