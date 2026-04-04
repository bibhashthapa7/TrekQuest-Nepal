from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
from django.contrib.auth.models import User
from django.utils import timezone
from .models import Trek, UserFavorite, UserProfile, RecommendationRequest
from .serializers import TrekSerializer, UserSerializer, UserFavoriteSerializer, UserProfileSerializer
from .filters import TrekFilter
from datetime import datetime, timedelta
import anthropic
import json
from django.conf import settings

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
        
    except Exception:
        return Response(
            {'error': 'Failed to fetch admin stats'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


DAILY_LIMIT = 3

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def get_recommendations(request):
    # Rate limit: max 3 requests per calendar day (admin users are exempt)
    is_admin = request.user.is_staff
    today_start = timezone.now().replace(hour=0, minute=0, second=0, microsecond=0)
    used_today = RecommendationRequest.objects.filter(
        user=request.user,
        created_at__gte=today_start
    ).count()

    if not is_admin and used_today >= DAILY_LIMIT:
        return Response(
            {'error': 'daily_limit_reached', 'used': used_today, 'limit': DAILY_LIMIT},
            status=status.HTTP_429_TOO_MANY_REQUESTS
        )

    # Extract user preferences from request
    fitness    = request.data.get('fitness', '')
    duration   = request.data.get('duration', '')
    budget     = request.data.get('budget', '')
    interests  = request.data.get('interests', [])
    extra_note = request.data.get('note', '').strip()

    # Build a concise trek catalogue for the prompt
    treks = Trek.objects.all().order_by('trek_name')
    trek_lines = []
    for t in treks:
        line = (
            f"- {t.trek_name} | Region: {t.location} | Grade: {t.trip_grade} | "
            f"Duration: {t.duration} days | Cost: ${t.cost_range} | "
            f"Max Altitude: {t.max_altitude} | Best Time: {t.best_travel_time} | "
            f"Description: {(t.description or '')[:120]}"
        )
        trek_lines.append(line)
    trek_catalogue = "\n".join(trek_lines)

    system_prompt = (
        "You are a Nepal trekking advisor for TrekQuest Nepal. "
        "Your ONLY job is to recommend treks from the catalogue provided below. "
        "You must NEVER recommend a trek that is not in this catalogue. "
        "If the user asks about anything unrelated to Nepal trekking, politely decline "
        "and redirect them to describe their trekking preferences. "
        "Always base your reasoning strictly on the data in the catalogue. "
        "Respond ONLY with raw valid JSON. Do NOT wrap in markdown code fences. "
        "Do NOT include any text before or after the JSON object. "
        "The JSON must have this exact structure:\n"
        '{"recommendations": ['
        '{"trek_name": "...", "reason": "...", "grade": "...", "duration": "...", "cost": "..."},'
        '{"trek_name": "...", "reason": "...", "grade": "...", "duration": "...", "cost": "..."},'
        '{"trek_name": "...", "reason": "...", "grade": "...", "duration": "...", "cost": "..."}'
        "]}"
    )

    interests_str = ", ".join(interests) if interests else "no specific preference"
    user_message = (
        f"Here is the full TrekQuest Nepal trek catalogue:\n\n{trek_catalogue}\n\n"
        f"Based on this catalogue only, recommend the 3 best treks for a user with these preferences:\n"
        f"- Fitness/experience level: {fitness or 'not specified'}\n"
        f"- Preferred trip length: {duration or 'not specified'}\n"
        f"- Budget level: {budget or 'not specified'}\n"
        f"- Interests: {interests_str}\n"
        f"- Additional notes: {extra_note or 'none'}\n\n"
        "Provide 3 recommendations with a personalised reason for each explaining "
        "why it suits this specific user. Keep each reason to 2-3 sentences."
    )

    try:
        client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
        message = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=1024,
            system=system_prompt,
            messages=[{"role": "user", "content": user_message}],
        )
        raw = message.content[0].text.strip()
        # Strip markdown code fences if Claude wraps the JSON
        if raw.startswith('```'):
            raw = raw.split('```')[1]
            if raw.startswith('json'):
                raw = raw[4:]
            raw = raw.strip()
        result = json.loads(raw)

        # Log the request only after a successful Claude call
        RecommendationRequest.objects.create(user=request.user)

        return Response({
            'recommendations': result.get('recommendations', []),
            'used': used_today + 1,
            'limit': None if is_admin else DAILY_LIMIT,
            'is_admin': is_admin,
        })

    except json.JSONDecodeError:
        return Response(
            {'error': 'Failed to parse recommendation response'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    except Exception:
        return Response(
            {'error': 'Failed to generate recommendations'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
