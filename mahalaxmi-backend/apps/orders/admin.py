from django.contrib import admin
from .models import Order, OrderItem, Payment


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ['id', 'item', 'item_total']


class PaymentInline(admin.TabularInline):
    model = Payment
    extra = 0
    readonly_fields = ['id', 'recorded_at']


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['order_id', 'customer', 'total_amount', 'amount_paid', 'remaining_amount', 'payment_status', 'kitchen_status', 'delivery_date', 'created_at']
    list_filter = ['payment_status', 'kitchen_status', 'delivery_type', 'created_at']
    search_fields = ['order_id', 'customer__name', 'customer__phone']
    ordering = ['-created_at']
    readonly_fields = ['id', 'serial_number', 'order_id', 'remaining_amount', 'payment_status', 'created_at', 'updated_at']
    inlines = [OrderItemInline, PaymentInline]


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['order', 'amount', 'method', 'recorded_at']
    list_filter = ['method', 'recorded_at']
    ordering = ['-recorded_at']
