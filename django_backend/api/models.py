from django.db import models

class Trek(models.Model):
    trek_name = models.CharField(max_length=255)
    cost_range = models.CharField(max_length=50)
    duration = models.CharField(max_length=50)
    trip_grade = models.CharField(max_length=50)
    max_altitude = models.CharField(max_length=50)
    total_distance = models.CharField(max_length=50)
    best_travel_time = models.CharField(max_length=50)

    def __str__(self):
        return self.trek_name
