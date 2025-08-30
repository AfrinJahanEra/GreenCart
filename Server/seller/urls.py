# seller/urls.py
from django.urls import path
from . import views

urlpatterns = [
    # Seller Dashboard Endpoints
    path('<int:seller_id>/dashboard/', views.seller_dashboard, name='seller_dashboard'),
    path('<int:seller_id>/stats/', views.seller_stats, name='seller_stats'),
    path('<int:seller_id>/recent-sales/', views.recent_sales, name='recent_sales'),
    path('<int:seller_id>/low-stock/', views.low_stock_plants, name='low_stock_plants'),
    path('<int:seller_id>/plants/', views.seller_plants, name='seller_plants'),
    path('<int:seller_id>/sales/', views.sales_records, name='sales_records'),
    
    # Plant Management
    path('plants/add/', views.add_plant, name='add_plant'),
    path('plants/<int:plant_id>/update/', views.update_plant, name='update_plant'),
    path('plants/<int:plant_id>/', views.plant_details, name='plant_details'),
    
    # Utility Endpoints
    path('categories/', views.get_categories, name='get_categories'),
    path('upload-images/', views.upload_images, name='upload_images'),
    path('record-sale/', views.record_manual_sale, name='record_manual_sale'),
    path('<int:seller_id>/debug/', views.debug_seller, name='debug_seller'),
    path('test-connection/', views.test_connection, name='test_connection'),
]