from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from django.contrib.auth.models import User
from .models import Trek, UserFavorite, UserProfile
from .serializers import TrekSerializer, UserSerializer, UserFavoriteSerializer, UserProfileSerializer

class TrekListCreateView(generics.ListCreateAPIView):
    queryset = Trek.objects.all()
    serializer_class = TrekSerializer
    permission_classes = [AllowAny]

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
