from django.urls import path
from .views import *

urlpatterns = [
    path('signup/', SignupView.as_view(), name='signup'),
    path('login/', LoginView.as_view(), name='login'),
    path('delete/<int:user_id>/', delete_user, name='delete_user'),
    path('active-users/', list_active_users, name='list_active_users'),
]
