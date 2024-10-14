from rest_framework import serializers
from .models import Trek

class TrekSerializer(serializers.ModelSerializer):
    class Meta:
        model = Trek
        fields = '__all__'
