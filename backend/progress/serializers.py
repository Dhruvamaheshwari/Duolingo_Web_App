from rest_framework import serializers
from .models import UserStats, UserSkillProgress, UserLessonProgress

class UserSkillProgressSerializer(serializers.ModelSerializer):
    skill_id = serializers.IntegerField(source='skill.id', read_only=True)
    
    class Meta:
        model = UserSkillProgress
        fields = ['skill_id', 'progress_percent', 'completed']

class UserLessonProgressSerializer(serializers.ModelSerializer):
    lesson_id = serializers.IntegerField(source='lesson.id', read_only=True)
    
    class Meta:
        model = UserLessonProgress
        fields = ['lesson_id', 'completed', 'completed_at', 'attempts', 'best_score']

class UserStatsSerializer(serializers.ModelSerializer):
    skill_progress = serializers.SerializerMethodField()
    lesson_progress = serializers.SerializerMethodField()

    class Meta:
        model = UserStats
        fields = [
            'total_xp', 'current_streak', 'hearts', 
            'last_activity_date', 'daily_xp', 'daily_goal',
            'skill_progress', 'lesson_progress'
        ]

    def get_skill_progress(self, obj):
        qs = UserSkillProgress.objects.filter(user=obj.user)
        return UserSkillProgressSerializer(qs, many=True).data

    def get_lesson_progress(self, obj):
        qs = UserLessonProgress.objects.filter(user=obj.user, completed=True)
        return UserLessonProgressSerializer(qs, many=True).data
