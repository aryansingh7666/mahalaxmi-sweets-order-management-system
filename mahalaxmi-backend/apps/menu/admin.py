from django.contrib import admin
from .models import Category, Item


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['icon', 'name', 'is_active', 'sort_order', 'item_count', 'created_at']
    list_filter = ['is_active']
    search_fields = ['name']
    ordering = ['sort_order']
    list_editable = ['sort_order', 'is_active']


@admin.register(Item)
class ItemAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'price', 'pricing_type', 'is_active', 'is_bestseller']
    list_filter = ['category', 'pricing_type', 'is_active', 'is_bestseller']
    search_fields = ['name', 'description']
    ordering = ['category__sort_order', 'name']
    list_editable = ['is_active', 'is_bestseller']
