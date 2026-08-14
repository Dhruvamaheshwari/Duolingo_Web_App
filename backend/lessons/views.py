from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.utils import timezone
from .models import Lesson
from courses.models import Skill
from progress.models import UserLessonProgress, UserSkillProgress, UserStats
from django.contrib.auth.models import User
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from backend_project.auth import CsrfExemptSessionAuthentication

class LessonView(APIView):
    def get(self, request, pk):
        lesson = get_object_or_404(Lesson, pk=pk)
        user = request.user
        if not user.is_authenticated:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)
            
        if user:
            skill = lesson.skill
            if skill.unit.position > 1:
                from courses.models import Unit
                prev_unit = Unit.objects.filter(course=skill.unit.course, position=skill.unit.position - 1).first()
                if prev_unit:
                    last_skill = prev_unit.skills.order_by('-position').first()
                    if last_skill:
                        prev_prog = UserSkillProgress.objects.filter(user=user, skill=last_skill).first()
                        if not prev_prog or not prev_prog.completed:
                            return Response({'error': 'Unit locked.'}, status=status.HTTP_403_FORBIDDEN)
            
            if skill.position > 1:
                prev_skill = Skill.objects.filter(unit=skill.unit, position=skill.position - 1).first()
                if prev_skill:
                    prev_prog = UserSkillProgress.objects.filter(user=user, skill=prev_skill).first()
                    if not prev_prog or not prev_prog.completed:
                        return Response({'error': 'Skill locked.'}, status=status.HTTP_403_FORBIDDEN)

        exercises = [{
            'id': e.id,
            'type': e.type,
            'question': e.question,
            'answer': e.answer,
            'options': e.options,
            'position': e.position
        } for e in lesson.exercises.all()]
        return Response({
            'id': lesson.id,
            'title': lesson.title,
            'position': lesson.position,
            'skill': lesson.skill.id,
            'exercises': exercises
        })

class CompleteLessonView(APIView):
    authentication_classes = (CsrfExemptSessionAuthentication, )
    
    def post(self, request, pk):
        lesson = get_object_or_404(Lesson, pk=pk)
        user = request.user
        if not user.is_authenticated:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)
            
        is_already_completed = False
        if user.is_authenticated:
            existing_prog = UserLessonProgress.objects.filter(user=user, lesson=lesson).first()
            if existing_prog and existing_prog.completed:
                is_already_completed = True

        if not is_already_completed:
            # Check unit access
            skill = lesson.skill
            if skill.unit.position > 1:
                from courses.models import Unit
                prev_unit = Unit.objects.filter(course=skill.unit.course, position=skill.unit.position - 1).first()
                if prev_unit:
                    last_skill = prev_unit.skills.order_by('-position').first()
                    if last_skill:
                        prev_prog = UserSkillProgress.objects.filter(user=user, skill=last_skill).first()
                        if not prev_prog or not prev_prog.completed:
                            return Response({'error': 'Unit locked.'}, status=status.HTTP_403_FORBIDDEN)
    
            # Check skill access
            if skill.position > 1:
                prev_skill = Skill.objects.filter(unit=skill.unit, position=skill.position - 1).first()
                if prev_skill:
                    prev_prog = UserSkillProgress.objects.filter(user=user, skill=prev_skill).first()
                    if not prev_prog or not prev_prog.completed:
                        return Response({'error': 'Skill locked.'}, status=status.HTTP_403_FORBIDDEN)
    
            # Verify lesson access
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
            
            is_new_completion = False
            if not prog.completed:
                prog.completed = True
                prog.completed_at = timezone.now()
                is_new_completion = True
                
            prog.attempts += 1
            prog.save()
            # Update skill progress
            skill = lesson.skill
            
            # Award XP and update streak ONLY IF NOT ALREADY COMPLETED
            stats, _ = UserStats.objects.select_for_update().get_or_create(user=user)
            today = timezone.now().date()
            
            if is_new_completion:
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
            
        return Response({
            'success': True, 
            'skill_progress_percent': skill_prog.progress_percent,
            'xp_earned': skill.xp_reward,
            'new_total_xp': stats.total_xp,
            'new_streak': stats.current_streak
        }, status=status.HTTP_200_OK)
