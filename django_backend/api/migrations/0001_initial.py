# Generated by Django 5.1.7 on 2025-03-12 18:22

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Trek',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('trek_name', models.CharField(max_length=255)),
                ('cost_range', models.CharField(max_length=50)),
                ('duration', models.CharField(max_length=50)),
                ('trip_grade', models.CharField(max_length=50)),
                ('max_altitude', models.CharField(max_length=50)),
                ('total_distance', models.CharField(max_length=50)),
                ('best_travel_time', models.CharField(max_length=50)),
            ],
        ),
    ]
