"""
Parses existing text fields and populates numeric fields:
  cost_range      → cost_min, cost_max
  max_altitude    → altitude_m
  total_distance  → distance_km
  duration        → duration_days_min, duration_days_max
"""

import re
from django.core.management.base import BaseCommand
from api.models import Trek


def parse_cost(value):
    """Returns (cost_min, cost_max) integers or (None, None)."""
    if not value:
        return None, None
    nums = re.findall(r'\d+', value.replace(',', ''))
    if len(nums) >= 2:
        return int(nums[0]), int(nums[1])
    if len(nums) == 1:
        v = int(nums[0])
        return v, v
    return None, None


def parse_altitude(value):
    """Returns altitude as integer metres or None."""
    if not value:
        return None
    nums = re.findall(r'[\d,]+', value)
    if nums:
        return int(nums[0].replace(',', ''))
    return None


def parse_distance(value):
    """Returns max distance as float km or None."""
    if not value:
        return None
    nums = re.findall(r'\d+(?:\.\d+)?', value.replace(',', ''))
    if len(nums) >= 2:
        return float(nums[1])   # use the upper bound of a range
    if len(nums) == 1:
        return float(nums[0])
    return None


def parse_duration(value):
    """Returns (min_days, max_days) integers or (None, None)."""
    if not value:
        return None, None
    nums = re.findall(r'\d+', value)
    if len(nums) >= 2:
        return int(nums[0]), int(nums[1])
    if len(nums) == 1:
        v = int(nums[0])
        return v, v
    return None, None


class Command(BaseCommand):
    help = "Populate cost_min, cost_max, altitude_m, distance_km from existing text fields"

    def handle(self, *args, **kwargs):
        treks = Trek.objects.all()
        updated = 0

        for trek in treks:
            cost_min, cost_max = parse_cost(trek.cost_range)
            altitude_m = parse_altitude(trek.max_altitude)
            distance_km = parse_distance(trek.total_distance)
            duration_days_min, duration_days_max = parse_duration(trek.duration)

            trek.cost_min = cost_min
            trek.cost_max = cost_max
            trek.altitude_m = altitude_m
            trek.distance_km = distance_km
            trek.duration_days_min = duration_days_min
            trek.duration_days_max = duration_days_max
            trek.save(update_fields=[
                'cost_min', 'cost_max', 'altitude_m', 'distance_km',
                'duration_days_min', 'duration_days_max',
            ])

            self.stdout.write(
                f"  {trek.trek_name[:40]:<40} "
                f"dur={duration_days_min}-{duration_days_max}d  "
                f"cost={cost_min}-{cost_max}  "
                f"alt={altitude_m}m  "
                f"dist={distance_km}km"
            )
            updated += 1

        self.stdout.write(self.style.SUCCESS(f"\nDone. {updated} trek(s) updated."))
