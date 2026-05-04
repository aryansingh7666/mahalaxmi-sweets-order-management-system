import uuid
from django.db import models
from django.utils import timezone


class Coupon(models.Model):
    DISCOUNT_TYPE_CHOICES = [
        ('percentage', 'Percentage'),
        ('fixed', 'Fixed Amount'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    code = models.CharField(max_length=50, unique=True)
    discount_type = models.CharField(max_length=15, choices=DISCOUNT_TYPE_CHOICES, default='percentage')
    discount_value = models.DecimalField(max_digits=10, decimal_places=2)
    min_order_value = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    max_uses = models.PositiveIntegerField(null=True, blank=True, help_text='Leave blank for unlimited')
    used_count = models.PositiveIntegerField(default=0)
    expiry_date = models.DateField(null=True, blank=True, help_text='Leave blank for no expiry')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['code']

    def __str__(self):
        return self.code

    def save(self, *args, **kwargs):
        self.code = self.code.upper()
        super().save(*args, **kwargs)

    def validate(self, order_total):
        """Returns (is_valid, error_message)."""
        if not self.is_active:
            return False, "Coupon is not active"
        if self.expiry_date and timezone.now().date() > self.expiry_date:
            return False, "Coupon has expired"
        if self.max_uses is not None and self.used_count >= self.max_uses:
            return False, "Coupon usage limit reached"
        if order_total < self.min_order_value:
            return False, f"Minimum order value of ₹{self.min_order_value} required"
        return True, None

    def calculate_discount(self, order_total):
        """Returns the discount amount."""
        if self.discount_type == 'percentage':
            return min((order_total * self.discount_value / 100), order_total)
        else:
            return min(self.discount_value, order_total)
