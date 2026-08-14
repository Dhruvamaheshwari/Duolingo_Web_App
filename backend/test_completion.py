import os
import django
import sys

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend_project.settings")
sys.path.append("backend")
django.setup()

from django.test import Client
from django.contrib.auth.models import User
from lessons.models import Lesson
from progress.models import UserLessonProgress

client = Client()
user = User.objects.first()
if not user:
    print("No user")
    sys.exit(0)

client.force_login(user)
lesson = Lesson.objects.first()

print(f"Submitting lesson {lesson.id} for user {user.username}")
res = client.post(f'/api/lessons/{lesson.id}/complete/')
print(f"Status 1: {res.status_code}")
if res.status_code != 200:
    print(f"Response 1: {res.content}")

res2 = client.post(f'/api/lessons/{lesson.id}/complete/')
print(f"Status 2: {res2.status_code}")
if res2.status_code != 200:
    print(f"Response 2: {res2.content}")
