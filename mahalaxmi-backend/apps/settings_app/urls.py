from django.urls import path
from .views import ShopSettingsView, upload_logo_view

urlpatterns = [
    path('', ShopSettingsView.as_view(), name='shop-settings'),
    path('upload-logo/', upload_logo_view, name='upload-logo'),
]
