from rest_framework import serializers
from .models import Customer


class CustomerSerializer(serializers.ModelSerializer):
    total_orders = serializers.SerializerMethodField()
    total_spent = serializers.SerializerMethodField()
    outstanding_balance = serializers.SerializerMethodField()
    last_order_date = serializers.SerializerMethodField()

    class Meta:
        model = Customer
        fields = [
            'id', 'name', 'phone', 'address',
            'total_orders', 'total_spent', 'outstanding_balance', 'last_order_date',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_total_orders(self, obj):
        return obj.total_orders

    def get_total_spent(self, obj):
        return float(obj.total_spent)

    def get_outstanding_balance(self, obj):
        return float(obj.outstanding_balance)

    def get_last_order_date(self, obj):
        return obj.last_order_date


class FindOrCreateSerializer(serializers.Serializer):
    phone = serializers.RegexField(r'^\d{10}$', error_messages={'invalid': 'Phone must be exactly 10 digits'})
    name = serializers.CharField(max_length=200, required=False, default='')
    address = serializers.CharField(required=False, default='')
