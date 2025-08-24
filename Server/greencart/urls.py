from django.contrib import admin
from django.urls import path, include
from home import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('home/', include('home.urls')),
    path("plant_collection/", include("plant_collection.urls")),
    path('plant_detail/', include('plant_detail.urls')),
    path('user/', include('user_profile_sidebar.urls')),
    path('cart/', include('cart_sidebar.urls')),
    path('order/', include('order.urls')),
    path('admin_dashboard/', include('admin_dashboard.urls')),
    path('greencart_admin/', include('greencart_admin.urls')),
    path('delivery_confirmation/', include('delivery_confirmation.urls')),
    path('delivery_agent/', include('delivery_agent.urls')),
    path('seller/', include('seller.urls')),
    path('accounts/', include('accounts.urls')),
]
