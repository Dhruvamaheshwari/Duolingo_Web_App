from django.db import models

class Course(models.Model):
    name = models.CharField(max_length=255)
    language = models.CharField(max_length=255)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name

class Unit(models.Model):
    course = models.ForeignKey(Course, related_name='units', on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    position = models.IntegerField(default=0)

    class Meta:
        ordering = ['position']

    def __str__(self):
        return f"{self.course.name} - Unit {self.position}: {self.title}"

class Skill(models.Model):
    unit = models.ForeignKey(Unit, related_name='skills', on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    position = models.IntegerField(default=0)
    xp_reward = models.IntegerField(default=10)

    class Meta:
        ordering = ['position']

    def __str__(self):
        return self.title
