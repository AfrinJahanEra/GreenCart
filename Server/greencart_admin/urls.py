from django.urls import path
from . import views

urlpatterns = [
    path('user/<int:user_id>/orders/', views.get_user_orders_view, name='get_user_orders'),
    path('dashboard/stats/', views.admin_dashboard_stats, name='admin_dashboard_stats'),
    path('users/<str:role_name>/', views.get_user_list, name='get_user_list'),
    path('delivery/assign/', views.assign_delivery_agent_view, name='assign_delivery_agent'),
    path('activity-log/', views.get_activity_log, name='get_activity_log'),
    path('low-stock-alerts/', views.get_low_stock_alerts, name='get_low_stock_alerts'),
]
