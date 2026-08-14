from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.conf import settings
from backend_project.auth import CsrfExemptSessionAuthentication
from progress.models import UserStats

class SignupView(APIView):
    authentication_classes = (CsrfExemptSessionAuthentication, )

    def post(self, request):
        name = request.data.get('name')
        email = request.data.get('email')
        password = request.data.get('password')

        if not email or not password or not name:
            return Response({'error': 'Please provide name, email and password'}, status=status.HTTP_400_BAD_REQUEST)
        
        if User.objects.filter(username=email).exists():
            return Response({'error': 'User with this email already exists'}, status=status.HTTP_400_BAD_REQUEST)

        # Using email as username
        user = User.objects.create_user(username=email, email=email, password=password, first_name=name)
        UserStats.objects.get_or_create(user=user)
        login(request, user)
        
        return Response({
            'message': 'Signup successful',
            'user': {
                'id': user.id,
                'email': user.email,
                'name': user.first_name
            }
        }, status=status.HTTP_201_CREATED)

class LoginView(APIView):
    authentication_classes = (CsrfExemptSessionAuthentication, )

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        if not email or not password:
            return Response({'error': 'Please provide email and password'}, status=status.HTTP_400_BAD_REQUEST)

        # email is used as username
        user = authenticate(request, username=email, password=password)
        
        if user is not None:
            UserStats.objects.get_or_create(user=user)
            login(request, user)
            return Response({
                'message': 'Login successful',
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'name': user.first_name
                }
            })
        else:
            return Response({'error': 'Invalid email or password'}, status=status.HTTP_401_UNAUTHORIZED)

class LogoutView(APIView):
    authentication_classes = (CsrfExemptSessionAuthentication, )

    def post(self, request):
        logout(request)
        response = Response({'message': 'Logout successful'})
        response.delete_cookie(settings.SESSION_COOKIE_NAME)
        return response

class MeView(APIView):
    authentication_classes = (CsrfExemptSessionAuthentication, )

    def get(self, request):
        if request.user.is_authenticated:
            UserStats.objects.get_or_create(user=request.user)
            return Response({
                'user': {
                    'id': request.user.id,
                    'email': request.user.email,
                    'name': request.user.first_name
                }
            })
        else:
            return Response({'error': 'Not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)
