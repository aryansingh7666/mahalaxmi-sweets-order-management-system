from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from apps.menu.models import Category, Item
from apps.coupons.models import Coupon
from apps.settings_app.models import ShopSettings
from decimal import Decimal


class Command(BaseCommand):
    help = 'Seed database with initial data for Mahalaxmi Sweets & Farsan'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Starting database seed...'))

        # 1. Admin user
        if not User.objects.filter(username='admin').exists():
            User.objects.create_superuser('admin', 'admin@mahalaxmi.com', 'mahalaxmi123')
            self.stdout.write(self.style.SUCCESS('Admin user created (admin / mahalaxmi123)'))
        else:
            self.stdout.write('Admin user already exists')

        # 2. Shop settings
        settings, created = ShopSettings.objects.get_or_create(pk=1, defaults={
            'shop_name': 'Mahalaxmi Sweets & Farsan',
            'tagline': 'Taste the Tradition',
            'phone': '9876543210',
            'delivery_charge': Decimal('30.00'),
            'min_order_value': Decimal('0.00'),
            'free_delivery_above': Decimal('500.00'),
        })
        if created:
            self.stdout.write(self.style.SUCCESS('Shop settings created'))

        # 3. Categories
        categories_data = [
            {'name': 'Sweets', 'icon': 'S', 'color': '#FDE68A', 'sort_order': 1},
            {'name': 'Farsan', 'icon': 'F', 'color': '#FED7AA', 'sort_order': 2},
            {'name': 'Snacks', 'icon': 'K', 'color': '#D1FAE5', 'sort_order': 3},
            {'name': 'Beverages', 'icon': 'B', 'color': '#DBEAFE', 'sort_order': 4},
        ]
        categories = {}
        for cat_data in categories_data:
            cat, created = Category.objects.get_or_create(
                name=cat_data['name'],
                defaults=cat_data
            )
            categories[cat_data['name']] = cat
            if created:
                self.stdout.write(f'  Category: {cat_data["name"]}')

        # 4. Menu items
        items_data = [
            # Sweets
            {'category': 'Sweets', 'name': 'Kaju Katli', 'price': '800', 'pricing_type': 'kg', 'is_bestseller': True},
            {'category': 'Sweets', 'name': 'Motichur Ladoo', 'price': '400', 'pricing_type': 'kg', 'is_bestseller': True},
            {'category': 'Sweets', 'name': 'Besan Ladoo', 'price': '350', 'pricing_type': 'kg'},
            {'category': 'Sweets', 'name': 'Gulab Jamun', 'price': '300', 'pricing_type': 'kg'},
            {'category': 'Sweets', 'name': 'Rasgulla', 'price': '280', 'pricing_type': 'kg'},
            {'category': 'Sweets', 'name': 'Barfi', 'price': '450', 'pricing_type': 'kg'},
            {'category': 'Sweets', 'name': 'Halwa', 'price': '320', 'pricing_type': 'kg'},
            {'category': 'Sweets', 'name': 'Peda', 'price': '500', 'pricing_type': 'kg'},
            {'category': 'Sweets', 'name': 'Jalebi', 'price': '250', 'pricing_type': 'kg'},
            {'category': 'Sweets', 'name': 'Pinni', 'price': '380', 'pricing_type': 'kg'},
            # Farsan
            {'category': 'Farsan', 'name': 'Sev', 'price': '200', 'pricing_type': 'kg', 'is_bestseller': True},
            {'category': 'Farsan', 'name': 'Chakli', 'price': '220', 'pricing_type': 'kg'},
            {'category': 'Farsan', 'name': 'Namkeen Mix', 'price': '180', 'pricing_type': 'kg'},
            {'category': 'Farsan', 'name': 'Gathiya', 'price': '160', 'pricing_type': 'kg'},
            {'category': 'Farsan', 'name': 'Chivda', 'price': '200', 'pricing_type': 'kg'},
            {'category': 'Farsan', 'name': 'Bhujia', 'price': '240', 'pricing_type': 'kg'},
            {'category': 'Farsan', 'name': 'Papdi', 'price': '170', 'pricing_type': 'kg'},
            {'category': 'Farsan', 'name': 'Khakhra', 'price': '300', 'pricing_type': 'kg'},
            # Snacks
            {'category': 'Snacks', 'name': 'Samosa', 'price': '15', 'pricing_type': 'piece'},
            {'category': 'Snacks', 'name': 'Kachori', 'price': '12', 'pricing_type': 'piece'},
            {'category': 'Snacks', 'name': 'Mathri', 'price': '240', 'pricing_type': 'kg'},
            {'category': 'Snacks', 'name': 'Biscuit', 'price': '10', 'pricing_type': 'piece'},
            {'category': 'Snacks', 'name': 'Gujiya', 'price': '20', 'pricing_type': 'piece', 'is_bestseller': True},
            # Beverages
            {'category': 'Beverages', 'name': 'Thandai', 'price': '60', 'pricing_type': 'piece'},
            {'category': 'Beverages', 'name': 'Lassi', 'price': '50', 'pricing_type': 'piece'},
            {'category': 'Beverages', 'name': 'Masala Chai', 'price': '20', 'pricing_type': 'piece'},
        ]

        for item_data in items_data:
            cat_name = item_data.pop('category')
            item_data['price'] = Decimal(item_data['price'])
            item, created = Item.objects.get_or_create(
                name=item_data['name'],
                category=categories[cat_name],
                defaults=item_data
            )
            if created:
                self.stdout.write(f'  Item: {item.name}')

        # 5. Coupons
        coupons_data = [
            {
                'code': 'SWEET10',
                'discount_type': 'percentage',
                'discount_value': Decimal('10'),
                'min_order_value': Decimal('200'),
                'is_active': True,
            },
            {
                'code': 'FLAT50',
                'discount_type': 'fixed',
                'discount_value': Decimal('50'),
                'min_order_value': Decimal('300'),
                'is_active': True,
            },
            {
                'code': 'WELCOME20',
                'discount_type': 'percentage',
                'discount_value': Decimal('20'),
                'min_order_value': Decimal('500'),
                'max_uses': 1,
                'is_active': True,
            },
        ]

        for coupon_data in coupons_data:
            coupon, created = Coupon.objects.get_or_create(
                code=coupon_data['code'],
                defaults=coupon_data
            )
            if created:
                self.stdout.write(f'  Coupon: {coupon.code}')

        self.stdout.write(self.style.SUCCESS('\nDatabase seeded successfully!'))
        self.stdout.write(self.style.SUCCESS('-' * 50))
        self.stdout.write(self.style.SUCCESS('Admin: http://localhost:8000/admin/'))
        self.stdout.write(self.style.SUCCESS('API Docs: http://localhost:8000/api/docs/'))
        self.stdout.write(self.style.SUCCESS('Login: admin / mahalaxmi123'))
        self.stdout.write(self.style.SUCCESS('-' * 50))
