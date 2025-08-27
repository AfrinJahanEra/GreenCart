from django.urls import path
from . import views

urlpatterns = [
    path('<int:user_id>/', views.user_profile_view, name='user_profile'),
    path('update/<int:user_id>/', views.update_user_profile_view, name='update_user_profile'),
    path('delete/<int:user_id>/', views.delete_user_account_view, name='delete_user_account'),
]
