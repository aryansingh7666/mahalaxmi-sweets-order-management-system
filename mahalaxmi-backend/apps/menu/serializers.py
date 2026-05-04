from rest_framework import serializers
from .models import Category, Item


class ItemSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_icon = serializers.CharField(source='category.icon', read_only=True)
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Item
        fields = [
            'id', 'category', 'category_name', 'category_icon',
            'name', 'description', 'price', 'pricing_type',
            'image', 'image_url', 'is_active', 'is_bestseller',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return None


class CategorySerializer(serializers.ModelSerializer):
    item_count = serializers.IntegerField(read_only=True)
    items = ItemSerializer(many=True, read_only=True)

    class Meta:
        model = Category
        fields = [
            'id', 'name', 'icon', 'color', 'is_active',
            'sort_order', 'item_count', 'items',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class CategoryListSerializer(serializers.ModelSerializer):
    """Lightweight serializer without nested items."""
    item_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Category
        fields = ['id', 'name', 'icon', 'color', 'is_active', 'sort_order', 'item_count']
