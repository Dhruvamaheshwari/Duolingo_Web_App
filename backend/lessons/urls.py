from django.urls import path
from .views import CompleteLessonView

urlpatterns = [
    path('<int:pk>/complete/', CompleteLessonView.as_view(), name='complete_lesson'),
]
