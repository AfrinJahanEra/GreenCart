from django.http import JsonResponse
from django.db import connection
import oracledb

# Fetch plants by category (using category slug)
def plants_by_category(request, slug):
    rows = []
    with connection.cursor() as cursor:
        out_cursor = cursor.connection.cursor()
        cursor.callproc("get_plants_by_category_with_rating", [slug, out_cursor])
        columns = [col[0].lower() for col in out_cursor.description]
        rows = [dict(zip(columns, row)) for row in out_cursor.fetchall()]
        out_cursor.close()
    return JsonResponse({"plants": rows})


# Search plants (using search term)
def search_plants(request):
    query = request.GET.get("q", "")
    rows = []
    with connection.cursor() as cursor:
        out_cursor = cursor.connection.cursor()
        cursor.callproc("search_plants_with_rating", [query, out_cursor])
        columns = [col[0].lower() for col in out_cursor.description]
        rows = [dict(zip(columns, row)) for row in out_cursor.fetchall()]
        out_cursor.close()
    return JsonResponse({"plants": rows})

def all_categories(request):
    rows = []
    with connection.cursor() as cursor:
        out_cursor = cursor.connection.cursor()
        cursor.callproc("get_all_categories", [out_cursor])
        rows = out_cursor.fetchall()
        out_cursor.close()
    return JsonResponse({"categories": rows})  # or render to a template
