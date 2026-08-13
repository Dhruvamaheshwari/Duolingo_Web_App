from rest_framework import generics
from .models import UserStats
from .serializers import UserStatsSerializer
from django.contrib.auth.models import User

class ProgressView(generics.RetrieveAPIView):
    serializer_class = UserStatsSerializer

    def get_object(self):
        user = getattr(self.request, 'user', None)
        if user and not user.is_authenticated:
            user = User.objects.first()
        if user:
            stats, _ = UserStats.objects.get_or_create(user=user)
            return stats
        return None
