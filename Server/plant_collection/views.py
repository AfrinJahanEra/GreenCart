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