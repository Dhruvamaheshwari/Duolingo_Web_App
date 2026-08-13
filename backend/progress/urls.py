from django.urls import path
from .views import ProgressView, DeductHeartView, RefillHeartsView

urlpatterns = [
    path('', ProgressView.as_view(), name='progress'),
    path('deduct-heart/', DeductHeartView.as_view(), name='deduct-heart'),
    path('refill-hearts/', RefillHeartsView.as_view(), name='refill-hearts'),
]
