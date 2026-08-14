from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from backend_project.auth import CsrfExemptSessionAuthentication
from .models import Course
from .serializers import CourseSerializer

class LearningPathView(APIView):
    authentication_classes = (CsrfExemptSessionAuthentication, )

    def get(self, request):
        course = Course.objects.first()
        if not course:
            return Response({
                'id': 0,
                'name': '',
                'language': '',
                'description': '',
                'units': []
            }, status=status.HTTP_200_OK)
        
        serializer = CourseSerializer(course, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)
