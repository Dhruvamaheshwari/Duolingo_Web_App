from rest_framework import serializers
from .models import Course, Unit, Skill
from progress.models import UserSkillProgress
from django.contrib.auth.models import User

class SkillSerializer(serializers.ModelSerializer):
    progress = serializers.SerializerMethodField()
    state = serializers.SerializerMethodField()
    first_lesson_id = serializers.SerializerMethodField()

    class Meta:
        model = Skill
        fields = ['id', 'title', 'description', 'position', 'xp_reward', 'progress', 'state', 'first_lesson_id']

    def get_progress(self, obj):
        request = self.context.get('request')
        user = getattr(request, 'user', None)
        if user and not user.is_authenticated:
            user = User.objects.first()
            
        if user:
            progress_obj = UserSkillProgress.objects.filter(user=user, skill=obj).first()
            if progress_obj:
                return progress_obj.progress_percent
        return 0

    def get_state(self, obj):
        request = self.context.get('request')
        user = getattr(request, 'user', None)
        if user and not user.is_authenticated:
            user = User.objects.first()

        if user:
            progress_obj = UserSkillProgress.objects.filter(user=user, skill=obj).first()
            if progress_obj and progress_obj.completed:
                return 'completed'
            
            if obj.position == 1:
                return 'available'
                
            prev_skill = Skill.objects.filter(unit=obj.unit, position=obj.position - 1).first()
            if prev_skill:
                prev_prog = UserSkillProgress.objects.filter(user=user, skill=prev_skill).first()
                if prev_prog and prev_prog.completed:
                    return 'available'
            
            return 'locked'
        return 'locked'

    def get_first_lesson_id(self, obj):
        first_lesson = obj.lessons.order_by('position').first()
        return first_lesson.id if first_lesson else None

class UnitSerializer(serializers.ModelSerializer):
    skills = SkillSerializer(many=True, read_only=True)

    class Meta:
        model = Unit
        fields = ['id', 'title', 'description', 'position', 'skills']

class CourseSerializer(serializers.ModelSerializer):
    units = UnitSerializer(many=True, read_only=True)

    class Meta:
        model = Course
        fields = ['id', 'name', 'language', 'description', 'units']
