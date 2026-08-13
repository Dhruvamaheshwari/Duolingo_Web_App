from rest_framework import generics
from .models import Course
from .serializers import CourseSerializer

class LearningPathView(generics.RetrieveAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    
    def get_object(self):
        return Course.objects.first()
