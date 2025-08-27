from django.urls import path
from home import views

urlpatterns = [
    path("top-categories/", views.top_categories, name="top_categories"),
    path("top-plants/", views.top_plants, name="top_plants"),
    path("top-sellers/", views.top_sellers, name="top_sellers"),
]
