from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
from django.contrib.auth.models import User
from .models import Trek, UserFavorite, UserProfile
from .serializers import TrekSerializer, UserSerializer, UserFavoriteSerializer, UserProfileSerializer
from .filters import TrekFilter
from datetime import datetime, timedelta

class TrekListCreateView(generics.ListCreateAPIView):
    queryset = Trek.objects.all()
    serializer_class = TrekSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = TrekFilter
    search_fields = ['trek_name', 'location']
    ordering_fields = ['trek_name', 'max_altitude', 'duration']

class TrekDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Trek.objects.all()
    serializer_class = TrekSerializer
    permission_classes = [AllowAny]

class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        return self.request.user

class UserProfileUpdateView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        profile, created = UserProfile.objects.get_or_create(user=self.request.user)
        return profile

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def user_favorites(request):
    if request.method == 'GET':
        favorites = UserFavorite.objects.filter(user=request.user)
        serializer = UserFavoriteSerializer(favorites, many=True, context={'request': request})
        return Response(serializer.data)
    
    elif request.method == 'POST':
        trek_id = request.data.get('trek_id')
        if not trek_id:
            return Response({'error': 'trek_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            trek = Trek.objects.get(id=trek_id)
        except Trek.DoesNotExist:
            return Response({'error': 'Trek not found'}, status=status.HTTP_404_NOT_FOUND)
        
        favorite, created = UserFavorite.objects.get_or_create(
            user=request.user,
            trek=trek
        )
        
        if created:
            serializer = UserFavoriteSerializer(favorite, context={'request': request})
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response({'message': 'Trek already in favorites'}, status=status.HTTP_200_OK)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_favorite(request, trek_id):
    try:
        favorite = UserFavorite.objects.get(user=request.user, trek_id=trek_id)
        favorite.delete()
        return Response({'message': 'Trek removed from favorites'}, status=status.HTTP_200_OK)
    except UserFavorite.DoesNotExist:
        return Response({'error': 'Favorite not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_stats(request):
    """Get admin dashboard statistics"""
    try:
        # Get total counts
        total_users = User.objects.count()
        total_treks = Trek.objects.count()
        total_favorites = UserFavorite.objects.count()
        
        # Get recent users (last 7 days)
        week_ago = datetime.now() - timedelta(days=7)
        recent_users = User.objects.filter(
            date_joined__gte=week_ago
        ).order_by('-date_joined')[:5]
        
        # Serialize recent users
        recent_users_data = []
        for user in recent_users:
            recent_users_data.append({
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'date_joined': user.date_joined,
                'is_staff': user.is_staff
            })
        
        stats = {
            'totalUsers': total_users,
            'totalTreks': total_treks,
            'totalFavorites': total_favorites,
            'recentUsers': recent_users_data
        }
        
        return Response(stats, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': f'Failed to fetch admin stats: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
