from django.urls import path
from .views import RegisterView, LoginView, LogoutView, UserUpdateView

urlpatterns = [
    # Auth endpoints
    path('api/register/', RegisterView.as_view(), name='register'),
    path('api/login/', LoginView.as_view(), name='login'),
    path('api/logout/', LogoutView.as_view(), name='logout'),
    
    # User management endpoints
    path('api/users/', UserUpdateView.as_view(), name='user-detail'),  # Get current user data
    path('api/users/<int:pk>/', UserUpdateView.as_view(), name='user-update'),  # Update specific user
]

