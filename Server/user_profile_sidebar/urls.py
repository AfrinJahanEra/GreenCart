from django.urls import path
from . import views

urlpatterns = [
    # Profile management
    path('profile/<int:user_id>/', views.user_profile_view, name='user_profile'),
    path('update/<int:requestor_id>/<int:user_id>/', views.update_user_profile_view, name='update_user_profile'),
    path('delete/<int:requestor_id>/<int:user_id>/', views.delete_user_account_view, name='delete_user_account'),
    path('current/', views.get_current_user_profile, name='current_user_profile'),
    
    # Utility endpoints
    path('all/', views.get_all_users, name='all_users'),
    path('by-email/', views.get_user_by_email, name='user_by_email'),
    path('test-upload/', views.test_upload, name='test_upload'),
]