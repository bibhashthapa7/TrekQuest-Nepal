from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Trek, UserFavorite, UserProfile
import djoser.serializers

class UserCreateSerializer(djoser.serializers.UserCreateSerializer):
    class Meta(djoser.serializers.UserCreateSerializer.Meta):
        fields = ['username', 'email', 'first_name', 'last_name', 'password']

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['phone_number', 'date_of_birth', 'profile_picture', 'bio', 
                 'trekking_experience', 'fitness_level', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']

class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'email', 'username', 'first_name', 'last_name', 'is_staff', 'profile']
        read_only_fields = ['id']

class TrekSerializer(serializers.ModelSerializer):
    is_favorited = serializers.SerializerMethodField()
    
    class Meta:
        model = Trek
        fields = ['id', 'trek_name', 'description', 'cost_range', 'duration', 'trip_grade',
                 'max_altitude', 'total_distance', 'best_travel_time', 'location',
                 'coordinates_lat', 'coordinates_lng', 'featured_image', 'created_at',
                 'updated_at', 'is_favorited']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_is_favorited(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return UserFavorite.objects.filter(user=request.user, trek=obj).exists()
        return False

class UserFavoriteSerializer(serializers.ModelSerializer):
    trek = TrekSerializer(read_only=True)
    
    class Meta:
        model = UserFavorite
        fields = ['id', 'trek', 'created_at']
        read_only_fields = ['id', 'created_at']
