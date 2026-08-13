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
        user = self.request.user
        if not user.is_authenticated:
            return None
        stats, _ = UserStats.objects.get_or_create(user=user)
        return stats

class DeductHeartView(APIView):
    def post(self, request):
        user = request.user
        if not user.is_authenticated:
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
        user = request.user
        if not user.is_authenticated:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)
            
        with transaction.atomic():
            stats, _ = UserStats.objects.select_for_update().get_or_create(user=user)
            stats.hearts = 5
            stats.save()
            return Response({'success': True, 'hearts': stats.hearts})

class LeaderboardView(APIView):
    def get(self, request):
        # Return top 20 users by total_xp
        top_stats = UserStats.objects.order_by('-total_xp')[:20]
        data = []
        for rank, stat in enumerate(top_stats, start=1):
            data.append({
                'rank': rank,
                'username': stat.user.username,
                'total_xp': stat.total_xp,
                'is_current': request.user.is_authenticated and stat.user == request.user
            })
        return Response(data)
