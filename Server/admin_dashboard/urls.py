from django.urls import path
from . import views

urlpatterns = [
    path('discount/apply/', views.apply_discount_view, name='apply_discount'),
    path('order/details/<int:order_id>/', views.order_details_view, name='order_details'),
]
