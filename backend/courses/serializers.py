from rest_framework import serializers
from .models import Course, Unit, Skill
from progress.models import UserSkillProgress

class SkillSerializer(serializers.ModelSerializer):
    progress = serializers.SerializerMethodField()
    state = serializers.SerializerMethodField()
    first_lesson_id = serializers.SerializerMethodField()

    class Meta:
        model = Skill
        fields = ['id', 'title', 'description', 'position', 'xp_reward', 'progress', 'state', 'first_lesson_id']

    def get_progress(self, obj):
        request = self.context.get('request')
        user = request.user if request and request.user.is_authenticated else None
            
        if user:
            progress_obj = UserSkillProgress.objects.filter(user=user, skill=obj).first()
            if progress_obj:
                return progress_obj.progress_percent
        return 0

    def get_state(self, obj):
        request = self.context.get('request')
        user = request.user if request and request.user.is_authenticated else None

        if user:
            progress_obj = UserSkillProgress.objects.filter(user=user, skill=obj).first()
            if progress_obj and progress_obj.completed:
                return 'completed'
            
            if obj.position == 1:
                if obj.unit.position == 1:
                    return 'available'
                else:
                    from courses.models import Unit
                    prev_unit = Unit.objects.filter(course=obj.unit.course, position=obj.unit.position - 1).first()
                    if prev_unit:
                        last_skill = prev_unit.skills.order_by('-position').first()
                        if last_skill:
                            prev_prog = UserSkillProgress.objects.filter(user=user, skill=last_skill).first()
                            if prev_prog and prev_prog.completed:
                                return 'available'
                    return 'locked'
                
            prev_skill = Skill.objects.filter(unit=obj.unit, position=obj.position - 1).first()
            if prev_skill:
                prev_prog = UserSkillProgress.objects.filter(user=user, skill=prev_skill).first()
                if prev_prog and prev_prog.completed:
                    return 'available'
            
            return 'locked'
        
        if obj.position == 1 and obj.unit.position == 1:
            return 'available'
        return 'locked'

    def get_first_lesson_id(self, obj):
        request = self.context.get('request')
        user = request.user if request and request.user.is_authenticated else None
            
        if user:
            from progress.models import UserLessonProgress
            completed_lesson_ids = UserLessonProgress.objects.filter(
                user=user, lesson__skill=obj, completed=True
            ).values_list('lesson_id', flat=True)
            
            next_lesson = obj.lessons.exclude(id__in=completed_lesson_ids).order_by('position').first()
            if next_lesson:
                return next_lesson.id

        first_lesson = obj.lessons.order_by('position').first()
        return first_lesson.id if first_lesson else None

class UnitSerializer(serializers.ModelSerializer):
    skills = SkillSerializer(many=True, read_only=True)

    class Meta:
        model = Unit
        fields = ['id', 'title', 'description', 'position', 'skills']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['skills'] = SkillSerializer(instance.skills.all(), many=True, context=self.context).data
        return data

class CourseSerializer(serializers.ModelSerializer):
    units = UnitSerializer(many=True, read_only=True)

    class Meta:
        model = Course
        fields = ['id', 'name', 'language', 'description', 'units']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['units'] = UnitSerializer(instance.units.all(), many=True, context=self.context).data
        return data
