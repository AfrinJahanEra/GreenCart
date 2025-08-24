from django.urls import path
from . import views

urlpatterns = [
    path('stats/<int:seller_id>/', views.seller_stats, name='seller_stats'),
    path('plants/<int:seller_id>/', views.seller_plants, name='seller_plants'),
    path('sales/<int:seller_id>/', views.seller_sales, name='seller_sales'),
    path('add/', views.add_plant, name='add_plant'),
    path('update/<int:requestor_id>/<int:plant_id>/', views.update_plant, name='update_plant'),
    path('delete/<int:requestor_id>/<int:plant_id>/', views.delete_plant, name='delete_plant'),
]
