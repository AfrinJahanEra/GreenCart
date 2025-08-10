from django.urls import path
from . import views

urlpatterns = [
    path('signup/', views.signup, name='signup'),
    path('login/', views.login, name='login'),
    path('users/', views.view_all_users, name='view_all_users'),
    path('users/<str:role>/', views.view_users_by_role, name='view_users_by_role'),
    path('users/delete/<str:user_id>/', views.delete_user, name='delete_user'),
]
