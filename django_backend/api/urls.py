from django.urls import path
from .views import TrekListCreateView

urlpatterns = [
    path('treks/', TrekListCreateView.as_view(), name='treks_list_create'),
]
