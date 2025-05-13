from django.contrib.auth.models import User
from rest_framework.views import APIView, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import UserProfile
from .serializers import UserProfileSerializer

class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        serializer = UserProfileSerializer(profile)
        return Response(serializer.data)

    def patch(self, request):
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        
        # Debug: log what's being sent
        print("💡 PATCH received:", request.data)

        serializer = UserProfileSerializer(profile, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            print("✅ Profile updated:", serializer.data)
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        print("❌ Validation errors:", serializer.errors)
        return Response({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

class RegisterView(APIView):
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        if not username or not password:
            return Response({'error': 'Username and password required'}, status=400)

        if User.objects.filter(username=username).exists():
            return Response({'error': 'Username already exists'}, status=400)

        user = User.objects.create_user(username=username, password=password)
        # Optional: Create empty profile
        from .models import UserProfile
        UserProfile.objects.create(user=user)

        return Response({'message': 'User created successfully'}, status=status.HTTP_201_CREATED)
