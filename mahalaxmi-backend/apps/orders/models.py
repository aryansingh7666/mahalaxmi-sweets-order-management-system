import uuid
from django.db import models
from django.utils import timezone
from ..customers.models import Customer


class Order(models.Model):
    DELIVERY_TYPE_CHOICES = [
        ('delivery', 'Delivery'),
        ('pickup', 'Pickup'),
    ]

    PAYMENT_STATUS_CHOICES = [
        ('PAID', 'Fully Paid'),
        ('PARTIAL', 'Partial Payment'),
        ('PENDING', 'Payment Pending'),
    ]

    KITCHEN_STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('PREPARING', 'Preparing'),
        ('READY', 'Ready'),
        ('DELIVERED', 'Delivered'),
        ('CANCELLED', 'Cancelled'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    serial_number = models.PositiveIntegerField(unique=True, editable=False)
    order_id = models.CharField(max_length=20, unique=True, editable=False)
    
    customer = models.ForeignKey('customers.Customer', on_delete=models.CASCADE, related_name='orders')
    coupon = models.ForeignKey('coupons.Coupon', on_delete=models.SET_NULL, null=True, blank=True)
    
    delivery_type = models.CharField(max_length=10, choices=DELIVERY_TYPE_CHOICES, default='delivery')
    delivery_date = models.DateField()
    delivery_address = models.TextField(null=True, blank=True)
    order_notes = models.TextField(null=True, blank=True)
    
    is_gift = models.BooleanField(default=False)
    gift_recipient_name = models.CharField(max_length=200, blank=True)
    gift_recipient_phone = models.CharField(max_length=20, blank=True)
    gift_message = models.TextField(blank=True)

    subtotal = models.DecimalField(max_digits=12, decimal_places=2)
    discount_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    delivery_charge = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    amount_paid = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    remaining_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    payment_status = models.CharField(max_length=10, choices=PAYMENT_STATUS_CHOICES, default='PENDING')
    kitchen_status = models.CharField(max_length=15, choices=KITCHEN_STATUS_CHOICES, default='PENDING')
    
    invoice_url = models.URLField(max_length=500, blank=True, default='')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.order_id

    def save(self, *args, **kwargs):
        # Auto-generate serial and order_id
        if not self.serial_number:
            last = Order.objects.order_by('-serial_number').first()
            self.serial_number = (last.serial_number + 1) if last and last.serial_number else 1
        if not self.order_id:
            self.order_id = f"MLX-{self.serial_number:03d}"
        
        # Calculate remaining amount and status
        self.remaining_amount = self.total_amount - self.amount_paid
        if self.amount_paid >= self.total_amount:
            self.payment_status = 'PAID'
        elif self.amount_paid > 0:
            self.payment_status = 'PARTIAL'
        else:
            self.payment_status = 'PENDING'
            
        super().save(*args, **kwargs)


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    item = models.UUIDField(null=True, blank=True)
    item_name = models.CharField(max_length=200)
    pricing_type = models.CharField(max_length=10)
    item_price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity_grams = models.PositiveIntegerField(null=True, blank=True)
    quantity_pieces = models.PositiveIntegerField(null=True, blank=True)
    item_total = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.item_name} for {self.order.order_id}"


class Payment(models.Model):
    PAYMENT_METHOD_CHOICES = [
        ('cash', 'Cash'),
        ('upi', 'UPI'),
        ('card', 'Card'),
        ('other', 'Other'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    method = models.CharField(max_length=10, choices=PAYMENT_METHOD_CHOICES, default='cash')
    notes = models.TextField(blank=True, default='')
    recorded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Payment of {self.amount} for {self.order.order_id}"
