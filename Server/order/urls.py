# customer_orders/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('orders/<int:user_id>/', views.customer_orders, name='customer_orders'),
    path('pending-confirmation/<int:user_id>/', views.pending_confirmation_orders, name='pending_confirmation_orders'),
    path('completed-for-review/<int:user_id>/', views.completed_orders_for_review, name='completed_orders_for_review'),
    path('confirm-delivery/', views.confirm_delivery, name='confirm_delivery'),
    path('add-review/', views.add_review_view, name='add_review'),
    path('order-details/<int:order_id>/', views.order_details, name='order_details'),
    path('stats/<int:user_id>/', views.customer_order_stats, name='customer_order_stats'),

    
    path('delivery-methods/', views.get_delivery_methods, name='get_delivery_methods'),
    path('create-order/', views.create_order_view, name='create_order'),
    path('order-details/<int:order_id>/', views.get_order_details_view, name='order_details'),
]