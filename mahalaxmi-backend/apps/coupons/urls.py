from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register('', views.CouponViewSet, basename='coupon')

urlpatterns = [
    path('validate/', views.validate_coupon, name='coupon-validate'),
    path('', include(router.urls)),
]
