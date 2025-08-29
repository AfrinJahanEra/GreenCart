# urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('seller/<int:seller_id>/stats/', views.seller_stats, name='seller_stats'),
    path('seller/<int:seller_id>/recent-sales/', views.recent_sales, name='recent_sales'),
    path('seller/<int:seller_id>/low-stock/', views.low_stock_plants, name='low_stock_plants'),
    path('seller/<int:seller_id>/plants/', views.seller_plants, name='seller_plants'),
    path('seller/<int:seller_id>/sales/', views.sales_records, name='sales_records'),
    path('plants/add/', views.add_plant, name='add_plant'),
    path('plants/upload-images/', views.upload_images, name='upload_images'),
    path('plants/<int:plant_id>/', views.plant_details, name='plant_details'),
    path('plants/<int:plant_id>/update/', views.update_plant, name='update_plant'),
    path('test-connection/', views.test_connection, name='test_connection'),
    path('categories/', views.get_categories, name='get_categories'),  # NEW

]