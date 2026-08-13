from django.db import models
from django.contrib.auth.models import User
from courses.models import Skill
from lessons.models import Lesson

class UserStats(models.Model):
    user = models.OneToOneField(User, related_name='stats', on_delete=models.CASCADE)
    total_xp = models.IntegerField(default=0)
    current_streak = models.IntegerField(default=0)
    hearts = models.IntegerField(default=5)
    last_activity_date = models.DateField(null=True, blank=True)
    daily_xp = models.IntegerField(default=0)
    daily_goal = models.IntegerField(default=50)

    def __str__(self):
        return f"{self.user.username} Stats"

class UserSkillProgress(models.Model):
    user = models.ForeignKey(User, related_name='skill_progress', on_delete=models.CASCADE)
    skill = models.ForeignKey(Skill, related_name='user_progress', on_delete=models.CASCADE)
    progress_percent = models.IntegerField(default=0)
    completed = models.BooleanField(default=False)

    class Meta:
        unique_together = ('user', 'skill')

    def __str__(self):
        return f"{self.user.username} - {self.skill.title} ({self.progress_percent}%)"

class UserLessonProgress(models.Model):
    user = models.ForeignKey(User, related_name='lesson_progress', on_delete=models.CASCADE)
    lesson = models.ForeignKey(Lesson, related_name='user_progress', on_delete=models.CASCADE)
    completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    attempts = models.IntegerField(default=0)
    best_score = models.IntegerField(default=0)

    class Meta:
        unique_together = ('user', 'lesson')

    def __str__(self):
        return f"{self.user.username} - {self.lesson.title}"
