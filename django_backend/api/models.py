from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    date_of_birth = models.DateField(blank=True, null=True)
    profile_picture = models.ImageField(upload_to='profile_pictures/', blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    trekking_experience = models.CharField(
        max_length=20,
        choices=[
            ('beginner', 'Beginner'),
            ('intermediate', 'Intermediate'),
            ('advanced', 'Advanced'),
            ('expert', 'Expert'),
        ],
        default='beginner'
    )
    fitness_level = models.CharField(
        max_length=20,
        choices=[
            ('low', 'Low'),
            ('moderate', 'Moderate'),
            ('high', 'High'),
            ('very_high', 'Very High'),
        ],
        default='moderate'
    )
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.first_name} {self.user.last_name} Profile"

class Trek(models.Model):
    trek_name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    cost_range = models.CharField(max_length=50)
    duration = models.CharField(max_length=50)
    trip_grade = models.CharField(max_length=50)
    max_altitude = models.CharField(max_length=50)
    total_distance = models.CharField(max_length=50)
    best_travel_time = models.CharField(max_length=50)
    location = models.CharField(max_length=255, blank=True, null=True)
    coordinates_lat = models.DecimalField(max_digits=10, decimal_places=8, blank=True, null=True)
    coordinates_lng = models.DecimalField(max_digits=11, decimal_places=8, blank=True, null=True)
    featured_image = models.ImageField(upload_to='trek_images/', blank=True, null=True)
    # Numeric fields for accurate filtering and sorting
    cost_min = models.PositiveIntegerField(blank=True, null=True)
    cost_max = models.PositiveIntegerField(blank=True, null=True)
    altitude_m = models.PositiveIntegerField(blank=True, null=True)
    distance_km = models.DecimalField(max_digits=6, decimal_places=1, blank=True, null=True)
    duration_days_min = models.PositiveIntegerField(blank=True, null=True)
    duration_days_max = models.PositiveIntegerField(blank=True, null=True)
    # GeoJSON route for map rendering
    route_geojson = models.JSONField(blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.trek_name

class RecommendationRequest(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='recommendation_requests')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.created_at.date()}"

class UserFavorite(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='favorites')
    trek = models.ForeignKey(Trek, on_delete=models.CASCADE, related_name='favorited_by')
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        unique_together = ['user', 'trek']

    def __str__(self):
        return f"{self.user.email} - {self.trek.trek_name}"
