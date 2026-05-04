from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from .models import ShopSettings
from .serializers import ShopSettingsSerializer

class ShopSettingsView(APIView):
    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAdminUser()]

    def get(self, request):
        settings, created = ShopSettings.objects.get_or_create(pk=1)
        serializer = ShopSettingsSerializer(settings)
        return Response({"success": True, "data": serializer.data})

    def put(self, request):
        settings, created = ShopSettings.objects.get_or_create(pk=1)
        serializer = ShopSettingsSerializer(settings, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"success": True, "data": serializer.data, "message": "Settings updated"})
        return Response({"error": True, "message": "Invalid data", "details": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

from rest_framework.decorators import api_view, permission_classes

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_logo_view(request):
    """Upload shop logo"""
    settings_obj, created = ShopSettings.objects.get_or_create(pk=1)
    
    if 'logo' not in request.FILES:
        return Response({'error': 'No file provided'}, status=400)
    
    settings_obj.logo = request.FILES['logo']
    settings_obj.save()
    
    logo_url = request.build_absolute_uri(settings_obj.logo.url)
    
    return Response({
        'success': True,
        'logo_url': logo_url,
        'message': 'Logo uploaded successfully'
    })
