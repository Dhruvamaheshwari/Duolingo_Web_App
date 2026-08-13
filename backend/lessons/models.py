from django.db import models
from courses.models import Skill

class Lesson(models.Model):
    skill = models.ForeignKey(Skill, related_name='lessons', on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    position = models.IntegerField(default=0)

    class Meta:
        ordering = ['position']

    def __str__(self):
        return f"{self.skill.title} - {self.title}"
