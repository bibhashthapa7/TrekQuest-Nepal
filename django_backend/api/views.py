from rest_framework import generics
from rest_framework.permissions import AllowAny
from .models import Trek
from .serializers import TrekSerializer

class TrekListCreateView(generics.ListCreateAPIView):
    queryset = Trek.objects.all()
    serializer_class = TrekSerializer
    permission_classes = [AllowAny]
