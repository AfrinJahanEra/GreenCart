from django.urls import path
from . import views

urlpatterns = [
    path('confirm/', views.confirm_delivery_view, name='confirm_delivery'),
]
