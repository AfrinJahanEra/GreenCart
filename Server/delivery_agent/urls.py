from django.urls import path
from . import views

urlpatterns = [
    path('orders/<int:agent_id>/', views.delivery_agent_orders, name='delivery_agent_orders'),
    path('stats/<int:agent_id>/', views.delivery_agent_stats, name='delivery_agent_stats'),
]
