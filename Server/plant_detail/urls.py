from django.urls import path
from . import views

urlpatterns = [
    path('plant/<int:plant_id>/', views.plant_details, name='plant_details'),
    path('cart/add/', views.add_to_cart_view, name='add_to_cart'),
    path('review/add/<int:plant_id>/<int:user_id>/', views.add_review_view, name='add_review'),
    path('reviews/<int:plant_id>/', views.get_reviews_view, name='get_reviews'),
    path('review/delete/<int:requestor_id>/', views.delete_review_view, name='delete_review'),
]
