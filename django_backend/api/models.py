from django.db import models

class Trek(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()
    difficulty = models.CharField(max_length=50)
    duration = models.IntegerField()
    location = models.CharField(max_length=255)

    def __str__(self):
        return self.name
