from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register('', views.CustomerViewSet, basename='customer')

urlpatterns = [
    path('find-or-create/', views.find_or_create_customer, name='customer-find-or-create'),
    path('', include(router.urls)),
]
