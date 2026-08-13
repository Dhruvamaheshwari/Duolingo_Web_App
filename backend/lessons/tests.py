import datetime
from django.test import TestCase, Client
from django.utils import timezone
from django.contrib.auth.models import User
from courses.models import Course, Unit, Skill
from lessons.models import Lesson
from progress.models import UserStats, UserLessonProgress, UserSkillProgress

class LearnerProgressRulesTest(TestCase):
    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(username='testuser', password='password')
        
        # Create hierarchy
        self.course = Course.objects.create(name='Test Course')
        self.unit = Unit.objects.create(course=self.course, title='Unit 1', position=1)
        
        self.skill1 = Skill.objects.create(unit=self.unit, title='Skill 1', position=1, xp_reward=10)
        self.skill2 = Skill.objects.create(unit=self.unit, title='Skill 2', position=2, xp_reward=15)
        
        self.lesson1 = Lesson.objects.create(skill=self.skill1, title='Lesson 1', position=1)
        self.lesson2 = Lesson.objects.create(skill=self.skill1, title='Lesson 2', position=2)
        self.lesson3 = Lesson.objects.create(skill=self.skill2, title='Lesson 3', position=1)
        
        self.stats = UserStats.objects.create(user=self.user, hearts=5)

    def test_lesson_completion_and_xp(self):
        # lesson completion & XP awarded once
        res = self.client.post(f'/api/lessons/{self.lesson1.id}/complete/')
        self.assertEqual(res.status_code, 200)
        
        self.stats.refresh_from_db()
        self.assertEqual(self.stats.total_xp, 10)
        
        # duplicate lesson completion
        res2 = self.client.post(f'/api/lessons/{self.lesson1.id}/complete/')
        self.assertEqual(res2.status_code, 200)
        
        self.stats.refresh_from_db()
        self.assertEqual(self.stats.total_xp, 20) # XP awarded again for practice

    def test_hearts_logic(self):
        # heart deduction
        res = self.client.post('/api/progress/deduct-heart/')
        self.assertEqual(res.status_code, 200)
        self.stats.refresh_from_db()
        self.assertEqual(self.stats.hearts, 4)
        
        # deduct to 0
        self.stats.hearts = 1
        self.stats.save()
        self.client.post('/api/progress/deduct-heart/')
        self.stats.refresh_from_db()
        self.assertEqual(self.stats.hearts, 0)
        
        # zero hearts blocks lesson
        res_fail = self.client.post(f'/api/lessons/{self.lesson1.id}/complete/')
        self.assertEqual(res_fail.status_code, 403)
        
        # refill
        res_refill = self.client.post('/api/progress/refill-hearts/')
        self.assertEqual(res_refill.status_code, 200)
        self.stats.refresh_from_db()
        self.assertEqual(self.stats.hearts, 5)

    def test_streak_logic(self):
        today = timezone.now().date()
        
        # first-day streak
        self.client.post(f'/api/lessons/{self.lesson1.id}/complete/')
        self.stats.refresh_from_db()
        self.assertEqual(self.stats.current_streak, 1)
        
        # same-day streak
        self.client.post(f'/api/lessons/{self.lesson2.id}/complete/')
        self.stats.refresh_from_db()
        self.assertEqual(self.stats.current_streak, 1) # Still 1
        
        # next-day streak
        lesson4 = Lesson.objects.create(skill=self.skill1, title='Lesson 4', position=3)
        self.stats.last_activity_date = today - datetime.timedelta(days=1)
        self.stats.save()
        self.client.post(f'/api/lessons/{lesson4.id}/complete/')
        self.stats.refresh_from_db()
        self.assertEqual(self.stats.current_streak, 2)
        
        # missed-day streak
        lesson5 = Lesson.objects.create(skill=self.skill1, title='Lesson 5', position=4)
        self.stats.last_activity_date = today - datetime.timedelta(days=2)
        self.stats.save()
        self.client.post(f'/api/lessons/{lesson5.id}/complete/')
        self.stats.refresh_from_db()
        self.assertEqual(self.stats.current_streak, 1)

    def test_skill_unlocking(self):
        # lesson 3 is in skill 2, which is locked
        res = self.client.post(f'/api/lessons/{self.lesson3.id}/complete/')
        self.assertEqual(res.status_code, 403)
        
        # complete skill 1
        self.client.post(f'/api/lessons/{self.lesson1.id}/complete/')
        self.client.post(f'/api/lessons/{self.lesson2.id}/complete/')
        
        # check skill 2 state via learning-path api
        path_res = self.client.get('/api/learning-path/')
        data = path_res.json()
        skill2_state = data['units'][0]['skills'][1]['state']
        self.assertEqual(skill2_state, 'available')
        
        # now lesson 3 can be completed
        res_unlocked = self.client.post(f'/api/lessons/{self.lesson3.id}/complete/')
        self.assertEqual(res_unlocked.status_code, 200)
