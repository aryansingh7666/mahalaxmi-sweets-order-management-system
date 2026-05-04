import uuid
from django.db import models


class Category(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    icon = models.CharField(max_length=10, default='🍬')
    color = models.CharField(max_length=20, default='#FDE68A')
    is_active = models.BooleanField(default=True)
    sort_order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['sort_order', 'name']
        verbose_name = 'Category'
        verbose_name_plural = 'Categories'

    def __str__(self):
        return f"{self.icon} {self.name}"

    @property
    def item_count(self):
        return self.items.filter(is_active=True).count()


class Item(models.Model):
    PRICING_CHOICES = [
        ('kg', 'Per Kilogram'),
        ('piece', 'Per Piece'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='items')
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True, default='')
    price = models.DecimalField(max_digits=10, decimal_places=2)
    pricing_type = models.CharField(max_length=10, choices=PRICING_CHOICES, default='kg')
    image = models.ImageField(upload_to='items/', null=True, blank=True)
    is_active = models.BooleanField(default=True)
    is_bestseller = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['category', 'name']

    def __str__(self):
        return f"{self.name} ({self.get_pricing_type_display()})"

    @property
    def image_url(self):
        if self.image:
            return self.image.url
        return None
