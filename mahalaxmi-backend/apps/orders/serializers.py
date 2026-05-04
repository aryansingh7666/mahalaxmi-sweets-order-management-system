from rest_framework import serializers
from .models import Order, OrderItem, Payment
from ..menu.models import Item


class OrderItemSerializer(serializers.ModelSerializer):
    item = serializers.PrimaryKeyRelatedField(
        queryset=Item.objects.all(),
        required=False,
        allow_null=True
    )
    
    class Meta:
        model = OrderItem
        fields = '__all__'
        read_only_fields = ['order']


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ['id', 'amount', 'method', 'notes', 'recorded_at']
        read_only_fields = ['id', 'recorded_at']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)
    payments = PaymentSerializer(many=True, read_only=True)
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    customer_phone = serializers.CharField(source='customer.phone', read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'serial_number', 'order_id',
            'customer', 'customer_name', 'customer_phone',
            'coupon', 'kitchen_status', 'payment_status',
            'delivery_type', 'delivery_date', 'delivery_address', 'order_notes',
            'is_gift', 'gift_recipient_name', 'gift_recipient_phone', 'gift_message',
            'subtotal', 'discount_amount', 'delivery_charge', 'total_amount', 'amount_paid', 'remaining_amount',
            'items', 'payments', 'invoice_url',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'serial_number', 'order_id', 'remaining_amount', 'payment_status', 'created_at', 'updated_at']



    def create(self, validated_data):
        items_data = validated_data.pop('items')
        order = Order.objects.create(**validated_data)
        
        for item_data in items_data:
            # Try to find item by name if UUID not provided
            if not item_data.get('item'):
                try:
                    from ..menu.models import Item
                    item = Item.objects.filter(
                        name__iexact=item_data.get(
                            'item_name', ''
                        )
                    ).first()
                    if item:
                        item_data['item'] = item
                except:
                    pass
            
            # Fix: OrderItem.item is a UUIDField, but item_data['item'] might be an Item instance
            item_val = item_data.pop('item', None)
            if item_val and hasattr(item_val, 'id'):
                item_val = item_val.id
                
            OrderItem.objects.create(
                order=order, 
                item=item_val,
                **item_data
            )
        
        if order.coupon:
            order.coupon.used_count += 1
            order.coupon.save()
        
        return order


class OrderListSerializer(serializers.ModelSerializer):
    """Lightweight serializer without nested payments."""
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    customer_phone = serializers.CharField(source='customer.phone', read_only=True)
    items = OrderItemSerializer(many=True, read_only=True)


    class Meta:
        model = Order
        fields = [
            'id', 'serial_number', 'order_id',
            'customer', 'customer_name', 'customer_phone',
            'kitchen_status', 'payment_status',
            'delivery_type', 'delivery_date',
            'total_amount', 'amount_paid', 'remaining_amount',
            'items', 'invoice_url',
            'created_at',
        ]


class RecordPaymentSerializer(serializers.Serializer):
    amount = serializers.DecimalField(max_digits=12, decimal_places=2, min_value=0)
    method = serializers.ChoiceField(choices=['cash', 'upi', 'card', 'other'], default='cash')
    notes = serializers.CharField(required=False, default='')
