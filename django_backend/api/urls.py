from django.urls import path
from . import views

urlpatterns = [
    # Trek endpoints
    path('treks/', views.TrekListCreateView.as_view(), name='trek-list-create'),
    path('treks/<int:pk>/', views.TrekDetailView.as_view(), name='trek-detail'),
    
    # User endpoints
    path('user/profile/', views.UserProfileView.as_view(), name='user-profile'),
    path('user/profile/update/', views.UserProfileUpdateView.as_view(), name='user-profile-update'),
    
    # Favorites endpoints
    path('user/favorites/', views.user_favorites, name='user-favorites'),
    path('user/favorites/<int:trek_id>/', views.remove_favorite, name='remove-favorite'),
]
