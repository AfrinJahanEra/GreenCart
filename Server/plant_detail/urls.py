# plant_detail/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('plant/<int:plant_id>/', views.plant_details, name='plant_details'),
    path('add-to-cart/', views.add_to_cart, name='add_to_cart'),
    path('add-review/<int:plant_id>/', views.add_review, name='add_review'),
]