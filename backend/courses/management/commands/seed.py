import logging
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from courses.models import Course, Unit, Skill
from lessons.models import Lesson, Exercise
from progress.models import UserStats

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Seeds the database with initial Spanish course data.'

    def handle(self, *args, **options):
        self.stdout.write("Seeding data...")

        # 1 Default Learner
        user, created = User.objects.get_or_create(username='dhruva', defaults={'email': 'dhruva@example.com'})
        if created:
            user.set_password('password123')
            user.save()
        
        # Initial Learner Stats
        UserStats.objects.get_or_create(user=user, defaults={
            'total_xp': 0,
            'current_streak': 0,
            'hearts': 5,
            'daily_xp': 0,
            'daily_goal': 50
        })

        # 1 Course
        course, _ = Course.objects.get_or_create(
            name='Spanish',
            defaults={
                'language': 'es',
                'description': 'Learn Spanish from scratch.'
            }
        )

        # 3 Units
        unit1, _ = Unit.objects.get_or_create(course=course, position=1, defaults={'title': 'Basics', 'description': 'Basic Spanish phrases.'})
        unit2, _ = Unit.objects.get_or_create(course=course, position=2, defaults={'title': 'Food', 'description': 'Order food in Spanish.'})
        unit3, _ = Unit.objects.get_or_create(course=course, position=3, defaults={'title': 'Travel', 'description': 'Navigate your way.'})

        units = [unit1, unit2, unit3]
        skill_titles = [
            ['Greetings', 'Introductions'],
            ['Restaurant', 'Drinks'],
            ['Directions', 'Transport']
        ]

        # 6 Skills (2 per unit)
        for i, unit in enumerate(units):
            for j, title in enumerate(skill_titles[i]):
                skill, _ = Skill.objects.get_or_create(
                    unit=unit, 
                    position=j+1, 
                    defaults={'title': title, 'description': f'Learn {title}'}
                )

                # 2 Lessons per skill
                for k in range(1, 3):
                    lesson, _ = Lesson.objects.get_or_create(
                        skill=skill,
                        position=k,
                        defaults={'title': f'Lesson {k}'}
                    )

                    # Add exercises covering all 5 types
                    # multiple_choice
                    Exercise.objects.get_or_create(
                        lesson=lesson,
                        type='multiple_choice',
                        position=1,
                        defaults={
                            'question': 'Translate: "Hola"',
                            'answer': 'Hello',
                            'options': ['Goodbye', 'Hello', 'Please', 'Thanks']
                        }
                    )
                    # word_bank
                    Exercise.objects.get_or_create(
                        lesson=lesson,
                        type='word_bank',
                        position=2,
                        defaults={
                            'question': 'Build the sentence: "I love Spanish"',
                            'answer': ['Amo', 'el', 'español'],
                            'options': ['Amo', 'el', 'español', 'Yo', 'gato']
                        }
                    )
                    # match_pairs
                    Exercise.objects.get_or_create(
                        lesson=lesson,
                        type='match_pairs',
                        position=3,
                        defaults={
                            'question': 'Match the pairs',
                            'answer': {'Hola': 'Hello', 'Adiós': 'Goodbye', 'Gracias': 'Thank you'},
                            'options': []
                        }
                    )
                    # fill_blank
                    Exercise.objects.get_or_create(
                        lesson=lesson,
                        type='fill_blank',
                        position=4,
                        defaults={
                            'question': 'Yo ___ estudiante.',
                            'answer': 'soy',
                            'options': ['soy', 'eres', 'es']
                        }
                    )
                    # type_answer
                    Exercise.objects.get_or_create(
                        lesson=lesson,
                        type='type_answer',
                        position=5,
                        defaults={
                            'question': 'Translate to Spanish: "Good morning"',
                            'answer': 'Buenos días',
                            'options': []
                        }
                    )
        
        self.stdout.write(self.style.SUCCESS("Database seeded successfully!"))
