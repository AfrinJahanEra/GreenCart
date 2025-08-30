from django.urls import path
from . import views

urlpatterns = [
    path('dashboard/<int:agent_id>/', views.delivery_agent_dashboard, name='delivery_agent_dashboard'),
    path('mark-delivered/', views.mark_delivery_completed, name='mark_delivery_completed'),
    path('assignment-count/<int:agent_id>/', views.get_assignment_count, name='get_assignment_count'),
    path('monthly-earnings/<int:agent_id>/', views.get_agent_earnings, name='get_agent_earnings'),
    path('confirm-delivery/', views.confirm_agent_delivery, name='confirm_agent_delivery'),
]