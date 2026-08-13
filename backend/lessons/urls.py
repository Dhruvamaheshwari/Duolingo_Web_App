from django.urls import path
from .views import CompleteLessonView, LessonView

urlpatterns = [
    path('<int:pk>/', LessonView.as_view(), name='lesson_detail'),
    path('<int:pk>/complete/', CompleteLessonView.as_view(), name='complete_lesson'),
]
