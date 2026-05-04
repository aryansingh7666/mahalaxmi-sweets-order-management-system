from django.urls import path
from . import views

urlpatterns = [
    path('summary/', views.summary, name='reports-summary'),
    path('daily/', views.daily_sales, name='reports-daily'),
    path('top-items/', views.top_items, name='reports-top-items'),
    path('outstanding/', views.outstanding, name='reports-outstanding'),
]
