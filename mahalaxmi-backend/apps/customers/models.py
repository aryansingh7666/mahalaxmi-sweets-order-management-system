import uuid
from django.db import models
from django.core.validators import RegexValidator


class Customer(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    phone = models.CharField(
        max_length=10,
        unique=True,
        validators=[RegexValidator(r'^\d{10}$', 'Phone must be exactly 10 digits')]
    )
    address = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.phone})"

    @property
    def total_orders(self):
        return self.orders.count()

    @property
    def total_spent(self):
        return sum(o.total_amount for o in self.orders.all())

    @property
    def outstanding_balance(self):
        return sum(o.remaining_amount for o in self.orders.all())

    @property
    def last_order_date(self):
        last = self.orders.order_by('-created_at').first()
        return last.created_at if last else None
