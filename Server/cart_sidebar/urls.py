# In your urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('<int:user_id>/', views.cart_sidebar_view, name='cart_sidebar'),
    path('add/', views.add_to_cart_view, name='add_to_cart'),  # Add this line
    path('toggle/', views.toggle_cart_item_view, name='toggle_cart_item'),
    path('update_quantity/', views.update_cart_item_quantity_view, name='update_cart_item_quantity'),
    path('delete/', views.delete_cart_item_view, name='delete_cart_item'),
]