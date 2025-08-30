from django.urls import path
from . import views


urlpatterns = [
    path('stats/', views.get_admin_dashboard_stats, name='admin_dashboard_stats'),
    path('activity-log/', views.get_activity_log, name='activity_log'),
    path('user-list/<str:role_name>/', views.get_user_list, name='user_list'),
    path('assign-delivery-agent/', views.assign_delivery_agent, name='assign_delivery_agent'),
    path('low-stock-alerts/', views.get_low_stock_alerts, name='low_stock_alerts'),
    path('all-orders/', views.get_all_orders_with_delivery, name='all_orders'),
    path('order-details/<int:order_id>/', views.get_order_details, name='order_details'),
    path('apply-discount/', views.apply_discount, name='apply_discount'),
    path('order-overview/', views.get_order_overview, name='order_overview'),
    path('low-stock-details/', views.get_low_stock_details, name='low_stock_details'),
    path('delivery-agent-performance/', views.get_delivery_agent_performance, name='delivery_agent_performance'),
    path('available-delivery-agents/', views.get_available_delivery_agents, name='available_delivery_agents'),
    path('delete-customer/', views.delete_customer, name='delete_customer'),
]