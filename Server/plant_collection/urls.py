from django.urls import path
from . import views

urlpatterns = [
    path("category/<slug:slug>/", views.plants_by_category, name="plants_by_category"),
    path("search/", views.search_plants, name="search_plants"),
    path("categories/", views.all_categories, name="all_categories"),  
]
