"""URL configuration for mahalaxmi_backend project."""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import RedirectView
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView

from apps.orders.views import invoice_view

urlpatterns = [
    path('', RedirectView.as_view(url='/api/docs/', permanent=False)),
    path('invoice/<str:order_id>/', invoice_view, name='invoice_view'),
    path('admin/', admin.site.urls),

    # API endpoints
    path('api/auth/', include('apps.authentication.urls')),
    path('api/menu/', include('apps.menu.urls')),
    path('api/orders/', include('apps.orders.urls')),
    path('api/customers/', include('apps.customers.urls')),
    path('api/coupons/', include('apps.coupons.urls')),
    path('api/reports/', include('apps.reports.urls')),
    path('api/settings/', include('apps.settings_app.urls')),

    # API Docs
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
