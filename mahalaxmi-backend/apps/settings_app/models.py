from django.db import models

class ShopSettings(models.Model):
    shop_name = models.CharField(max_length=200, default='Mahalaxmi Sweets & Farsan')
    tagline = models.CharField(max_length=255, default='Taste the Tradition')
    phone = models.CharField(max_length=20, default='9876543210')
    logo = models.ImageField(upload_to='settings/', null=True, blank=True)
    delivery_charge = models.DecimalField(max_digits=10, decimal_places=2, default=30.00)
    min_order_value = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    free_delivery_above = models.DecimalField(max_digits=10, decimal_places=2, default=500.00)
    
    class Meta:
        verbose_name = 'Shop Setting'
        verbose_name_plural = 'Shop Settings'

    def __str__(self):
        return self.shop_name

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)
