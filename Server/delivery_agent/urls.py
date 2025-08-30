# delivery_agent/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('dashboard/<int:agent_id>/', views.delivery_agent_dashboard, name='delivery_agent_dashboard'),
    path('orders/<int:agent_id>/', views.delivery_agent_orders, name='delivery_agent_orders'),
    path('pending-orders/<int:agent_id>/', views.delivery_agent_pending_orders, name='delivery_agent_pending_orders'),
    path('completed-orders/<int:agent_id>/', views.delivery_agent_completed_orders, name='delivery_agent_completed_orders'),
    path('stats/<int:agent_id>/', views.delivery_agent_stats, name='delivery_agent_stats'),
    path('update-status/', views.update_delivery_status, name='update_delivery_status'),
    path('mark-delivered/', views.mark_delivery_completed, name='mark_delivery_completed'),
    path('assignment-count/<int:agent_id>/', views.get_assignment_count, name='get_assignment_count'),
    path('monthly-earnings/<int:agent_id>/', views.get_agent_earnings, name='get_agent_earnings'),
    path('confirm-delivery/', views.confirm_agent_delivery, name='confirm_agent_delivery'),
]