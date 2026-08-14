import os
import django
import sys

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend_project.settings")
sys.path.append("backend")
django.setup()

from django.test import Client
from django.contrib.auth.models import User
from lessons.models import Lesson

client = Client()
user = User.objects.first()
if not user:
    print("No user")
    sys.exit(0)

client.force_login(user)

lesson1 = Lesson.objects.get(id=1)
lesson2 = Lesson.objects.get(id=2)

print("Completing lesson 1")
res1 = client.post(f'/api/lessons/{lesson1.id}/complete/')
print(res1.status_code, res1.content)

print("Completing lesson 2")
res2 = client.post(f'/api/lessons/{lesson2.id}/complete/')
print(res2.status_code, res2.content)

print("Completing lesson 2 again")
res3 = client.post(f'/api/lessons/{lesson2.id}/complete/')
print(res3.status_code, res3.content)
