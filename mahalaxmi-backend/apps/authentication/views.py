from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError

from .serializers import LoginSerializer, UserSerializer, ChangePasswordSerializer


def success_response(data=None, message="Success"):
    return Response({"success": True, "message": message, "data": data})


def error_response(message="Error", details=None, status_code=status.HTTP_400_BAD_REQUEST):
    return Response({"error": True, "message": message, "details": details or {}}, status=status_code)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """Login and get JWT tokens."""
    serializer = LoginSerializer(data=request.data)
    if not serializer.is_valid():
        return error_response("Invalid data", serializer.errors)

    user = authenticate(
        username=serializer.validated_data['username'],
        password=serializer.validated_data['password']
    )
    if not user:
        return error_response("Invalid username or password", status_code=status.HTTP_401_UNAUTHORIZED)

    if not user.is_active:
        return error_response("Account is disabled", status_code=status.HTTP_401_UNAUTHORIZED)

    refresh = RefreshToken.for_user(user)
    return success_response({
        "access": str(refresh.access_token),
        "refresh": str(refresh),
        "user": UserSerializer(user).data,
    }, "Login successful")


@api_view(['POST'])
@permission_classes([AllowAny])
def refresh_view(request):
    """Refresh access token."""
    refresh_token = request.data.get('refresh')
    if not refresh_token:
        return error_response("Refresh token required")
    try:
        refresh = RefreshToken(refresh_token)
        return success_response({"access": str(refresh.access_token)}, "Token refreshed")
    except TokenError as e:
        return error_response(str(e), status_code=status.HTTP_401_UNAUTHORIZED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """Logout and blacklist refresh token."""
    refresh_token = request.data.get('refresh')
    if refresh_token:
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
        except TokenError:
            pass
    return success_response(message="Logged out successfully")


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me_view(request):
    """Get current authenticated user."""
    return success_response(UserSerializer(request.user).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password_view(request):
    """Change user password."""
    serializer = ChangePasswordSerializer(data=request.data)
    if not serializer.is_valid():
        return error_response("Invalid data", serializer.errors)

    user = request.user
    if not user.check_password(serializer.validated_data['old_password']):
        return error_response("Old password is incorrect")

    user.set_password(serializer.validated_data['new_password'])
    user.save()
    return success_response(message="Password changed successfully")
