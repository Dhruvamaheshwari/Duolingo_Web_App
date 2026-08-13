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

class Exercise(models.Model):
    EXERCISE_TYPES = [
        ('multiple_choice', 'Multiple Choice'),
        ('word_bank', 'Word Bank'),
        ('match_pairs', 'Match Pairs'),
        ('fill_blank', 'Fill in the Blank'),
        ('type_answer', 'Type Answer'),
    ]

    lesson = models.ForeignKey(Lesson, related_name='exercises', on_delete=models.CASCADE)
    type = models.CharField(max_length=50, choices=EXERCISE_TYPES)
    question = models.TextField()
    answer = models.JSONField(help_text="The correct answer.")
    options = models.JSONField(blank=True, null=True, help_text="List of choices/options.")
    position = models.IntegerField(default=0)

    class Meta:
        ordering = ['position']

    def __str__(self):
        return f"{self.lesson.title} - {self.get_type_display()} - {self.position}"

