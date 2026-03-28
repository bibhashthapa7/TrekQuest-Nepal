import django_filters
from .models import Trek


class CharInFilter(django_filters.BaseInFilter, django_filters.CharFilter):
    """Accepts a comma-separated list and filters with __in lookup."""
    pass


class TrekFilter(django_filters.FilterSet):
    # Text filters
    trip_grade = django_filters.CharFilter(lookup_expr='iexact')
    best_travel_time = django_filters.CharFilter(lookup_expr='iexact')

    # Multi-select location: ?location=Annapurna Region,Everest Region
    location = CharInFilter(field_name='location', lookup_expr='in')

    # Overlap-based cost filter:
    # trek.cost_max >= user_budget_min  (trek reaches up to user's minimum)
    # trek.cost_min <= user_budget_max  (trek starts below user's maximum)
    cost_max_gte = django_filters.NumberFilter(field_name='cost_max', lookup_expr='gte')
    cost_min_lte = django_filters.NumberFilter(field_name='cost_min', lookup_expr='lte')

    # Numeric range filters — altitude & distance
    altitude_max = django_filters.NumberFilter(field_name='altitude_m', lookup_expr='lte')
    distance_min = django_filters.NumberFilter(field_name='distance_km', lookup_expr='gte')
    distance_max = django_filters.NumberFilter(field_name='distance_km', lookup_expr='lte')

    # Numeric range filters — duration
    duration_min = django_filters.NumberFilter(field_name='duration_days_min', lookup_expr='gte')
    duration_max = django_filters.NumberFilter(field_name='duration_days_max', lookup_expr='lte')

    class Meta:
        model = Trek
        fields = [
            'trip_grade', 'location', 'best_travel_time',
            'cost_max_gte', 'cost_min_lte',
            'altitude_max', 'distance_min', 'distance_max',
            'duration_min', 'duration_max',
        ]
