from django.shortcuts import render
from django.http import JsonResponse
from django.db import connection
import oracledb

def top_categories(request):
    rows = []
    with connection.cursor() as cursor:
        out_cursor = cursor.connection.cursor()  # separate cursor for ref cursor
        cursor.callproc("get_top_4_categories", [out_cursor])
        rows = out_cursor.fetchall()
        out_cursor.close()

    categories = [
        {"category_id": r[0], "name": r[1], "slug": r[2], "plant_count": r[3]}
        for r in rows
    ]
    return JsonResponse({"categories": categories}, safe=False)


def top_plants(request):
    rows = []
    with connection.cursor() as cursor:
        out_cursor = cursor.connection.cursor()
        out_cursor = cursor.callfunc("get_top_4_plants", oracledb.CURSOR)  # specify cursor type
        rows = out_cursor.fetchall()
        desc = [d[0].lower() for d in out_cursor.description]
        out_cursor.close()

    results = [dict(zip(desc, row)) for row in rows]
    return JsonResponse(results, safe=False)


def top_sellers(request):
    rows = []
    with connection.cursor() as cursor:
        out_cursor = cursor.connection.cursor()
        cursor.callproc("get_top_3_sellers", [out_cursor])
        rows = out_cursor.fetchall()
        desc = [d[0].lower() for d in out_cursor.description]
        out_cursor.close()

    results = [dict(zip(desc, row)) for row in rows]
    return JsonResponse(results, safe=False)

