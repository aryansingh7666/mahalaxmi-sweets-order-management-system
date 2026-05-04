from django.contrib import admin
from .models import Customer


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ['name', 'phone', 'address', 'total_orders', 'outstanding_balance', 'created_at']
    search_fields = ['name', 'phone']
    ordering = ['name']
    readonly_fields = ['id', 'created_at', 'updated_at', 'total_orders', 'total_spent', 'outstanding_balance']
