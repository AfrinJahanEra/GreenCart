from django.urls import path
from . import views

urlpatterns = [
    path('delivery_methods/', views.delivery_methods_view, name='delivery_methods'),
    path('create/', views.create_order_view, name='create_order'),
]
