from rest_framework import serializers
from .models import Coupon


class CouponSerializer(serializers.ModelSerializer):
    class Meta:
        model = Coupon
        fields = [
            'id', 'code', 'discount_type', 'discount_value',
            'min_order_value', 'max_uses', 'used_count',
            'expiry_date', 'is_active', 'created_at',
        ]
        read_only_fields = ['id', 'used_count', 'created_at']


class ValidateCouponSerializer(serializers.Serializer):
    code = serializers.CharField()
    order_total = serializers.DecimalField(max_digits=12, decimal_places=2, min_value=0)
