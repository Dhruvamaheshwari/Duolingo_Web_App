from rest_framework import serializers
from .models import Course, Unit, Skill
from progress.models import UserSkillProgress
from django.contrib.auth.models import User

class SkillSerializer(serializers.ModelSerializer):
    progress = serializers.SerializerMethodField()
    state = serializers.SerializerMethodField()

    class Meta:
        model = Skill
        fields = ['id', 'title', 'description', 'position', 'xp_reward', 'progress', 'state']

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
            
            all_skills = Skill.objects.filter(unit__course=obj.unit.course).order_by('unit__position', 'position')
            skill_list = list(all_skills)
            try:
                idx = skill_list.index(obj)
            except ValueError:
                return 'locked'
                
            if idx == 0:
                return 'available'
            prev_skill = skill_list[idx - 1]
            prev_prog = UserSkillProgress.objects.filter(user=user, skill=prev_skill).first()
            if prev_prog and prev_prog.completed:
                return 'available'
            return 'locked'
        return 'locked'

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
