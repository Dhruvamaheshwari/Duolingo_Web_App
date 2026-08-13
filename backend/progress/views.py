from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction
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

class DeductHeartView(APIView):
    def post(self, request):
        user = getattr(request, 'user', None)
        if user and not user.is_authenticated:
            user = User.objects.first()
        if not user:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)
            
        with transaction.atomic():
            stats, _ = UserStats.objects.select_for_update().get_or_create(user=user)
            if stats.hearts <= 0:
                return Response({'error': 'Not enough hearts to continue.'}, status=status.HTTP_403_FORBIDDEN)
            
            stats.hearts -= 1
            stats.save()
            return Response({'success': True, 'hearts': stats.hearts})

class RefillHeartsView(APIView):
    def post(self, request):
        user = getattr(request, 'user', None)
        if user and not user.is_authenticated:
            user = User.objects.first()
        if not user:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)
            
        with transaction.atomic():
            stats, _ = UserStats.objects.select_for_update().get_or_create(user=user)
            stats.hearts = 5
            stats.save()
            return Response({'success': True, 'hearts': stats.hearts})
