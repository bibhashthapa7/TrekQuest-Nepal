from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import User
from .models import UserProfile, Trek, UserFavorite

class UserProfileInline(admin.StackedInline):
    model = UserProfile
    can_delete = False
    verbose_name_plural = 'Profile'

class CustomUserAdmin(UserAdmin):
    inlines = (UserProfileInline,)
    list_display = ('email', 'username', 'first_name', 'last_name', 'is_staff')
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'date_joined')
    search_fields = ('email', 'username', 'first_name', 'last_name')
    ordering = ('email',)

# Re-register UserAdmin
admin.site.unregister(User)
admin.site.register(User, CustomUserAdmin)

@admin.register(Trek)
class TrekAdmin(admin.ModelAdmin):
    list_display = ('trek_name', 'trip_grade', 'duration', 'max_altitude', 'location', 'created_at')
    list_filter = ('trip_grade', 'duration', 'best_travel_time', 'created_at')
    search_fields = ('trek_name', 'description', 'location')
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('trek_name', 'description', 'location', 'featured_image')
        }),
        ('Trek Details', {
            'fields': ('cost_range', 'duration', 'trip_grade', 'max_altitude', 'total_distance', 'best_travel_time')
        }),
        ('Coordinates', {
            'fields': ('coordinates_lat', 'coordinates_lng'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

@admin.register(UserFavorite)
class UserFavoriteAdmin(admin.ModelAdmin):
    list_display = ('user', 'trek', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('user__email', 'user__username', 'trek__trek_name')
    readonly_fields = ('created_at',)
