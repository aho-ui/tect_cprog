from django.urls import path
from .views import ProfileView, RegisterView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('profile/', ProfileView.as_view()),
    path('token/', TokenObtainPairView.as_view()),        
    path('token/refresh/', TokenRefreshView.as_view()),   
    path('register/', RegisterView.as_view()),

]
