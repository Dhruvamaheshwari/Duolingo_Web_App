from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.utils import timezone
from .models import Lesson
from progress.models import UserLessonProgress, UserSkillProgress, UserStats
from django.contrib.auth.models import User

class CompleteLessonView(APIView):
    def post(self, request, pk):
        lesson = get_object_or_404(Lesson, pk=pk)
        user = getattr(request, 'user', None)
        if user and not user.is_authenticated:
            user = User.objects.first()
        if not user:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)
            
        # Verify access
        if lesson.position > 1:
            prev_lesson = Lesson.objects.filter(skill=lesson.skill, position=lesson.position - 1).first()
            if prev_lesson:
                prev_prog = UserLessonProgress.objects.filter(user=user, lesson=prev_lesson).first()
                if not prev_prog or not prev_prog.completed:
                    return Response({'error': 'Lesson not accessible yet.'}, status=status.HTTP_403_FORBIDDEN)

        # Check hearts
        stats, _ = UserStats.objects.get_or_create(user=user)
        if stats.hearts <= 0:
            return Response({'error': 'Not enough hearts to continue.'}, status=status.HTTP_403_FORBIDDEN)
        
        with transaction.atomic():
            prog, _ = UserLessonProgress.objects.select_for_update().get_or_create(user=user, lesson=lesson)
            
            if prog.completed:
                return Response({'error': 'Lesson already completed.'}, status=status.HTTP_400_BAD_REQUEST)
                
            prog.completed = True
            prog.completed_at = timezone.now()
            prog.attempts += 1
            prog.save()
            # Update skill progress
            skill = lesson.skill
            
            # Award XP and update streak
            stats, _ = UserStats.objects.select_for_update().get_or_create(user=user)
            today = timezone.now().date()
            
            if stats.last_activity_date == today:
                stats.daily_xp += skill.xp_reward
            elif stats.last_activity_date == today - timezone.timedelta(days=1):
                stats.current_streak += 1
                stats.daily_xp = skill.xp_reward
                stats.last_activity_date = today
            else:
                stats.current_streak = 1
                stats.daily_xp = skill.xp_reward
                stats.last_activity_date = today
                
            stats.total_xp += skill.xp_reward
            stats.save()
            
            total_lessons = skill.lessons.count()
            completed_lessons = UserLessonProgress.objects.filter(
                user=user, lesson__skill=skill, completed=True
            ).count()
            
            skill_prog, _ = UserSkillProgress.objects.get_or_create(user=user, skill=skill)
            
            if total_lessons > 0:
                percent = int((completed_lessons / total_lessons) * 100)
            else:
                percent = 100
                
            skill_prog.progress_percent = percent
            if percent >= 100:
                skill_prog.completed = True
            skill_prog.save()
            
        return Response({'success': True, 'skill_progress_percent': skill_prog.progress_percent}, status=status.HTTP_200_OK)
