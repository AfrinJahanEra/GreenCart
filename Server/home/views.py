from django.shortcuts import render
from django.db import connection
import oracledb

def top_categories(request):
    rows = []
    with connection.cursor() as cursor:
        out_cursor = cursor.connection.cursor()  # separate cursor for ref cursor
        cursor.callproc("get_top_4_categories", [out_cursor])
        rows = out_cursor.fetchall()
        out_cursor.close()
    return render(request, "home/top_categories.html", {"categories": rows})


def top_plants(request):
    rows = []
    with connection.cursor() as cursor:
        out_cursor = cursor.connection.cursor()
        out_cursor = cursor.callfunc("get_top_4_plants", oracledb.CURSOR)  # specify cursor type
        rows = out_cursor.fetchall()
        out_cursor.close()
    return render(request, "home/top_plants.html", {"plants": rows})


def top_sellers(request):
    rows = []
    with connection.cursor() as cursor:
        out_cursor = cursor.connection.cursor()
        cursor.callproc("get_top_3_sellers", [out_cursor])
        rows = out_cursor.fetchall()
        out_cursor.close()
    return render(request, "home/top_sellers.html", {"sellers": rows})

