from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from django.db.models import Sum, Count, F, DecimalField
from django.db.models.functions import TruncDate
from django.utils import timezone
from datetime import timedelta

from apps.orders.models import Order, OrderItem
from apps.customers.models import Customer


def success_response(data=None, message="Success"):
    return Response({"success": True, "message": message, "data": data})


@api_view(['GET'])
@permission_classes([IsAdminUser])
def summary(request):
    """Get sales summary for a given period."""
    period = request.query_params.get('period', 'all')
    orders = Order.objects.all()
    now = timezone.now()

    if period == 'today':
        orders = orders.filter(created_at__date=now.date())
    elif period == 'week':
        orders = orders.filter(created_at__gte=now - timedelta(days=7))
    elif period == 'month':
        orders = orders.filter(created_at__gte=now - timedelta(days=30))

    agg = orders.aggregate(
        total_orders=Count('id'),
        total_revenue=Sum('total'),
        total_paid=Sum('amount_paid'),
        total_remaining=Sum('remaining_amount'),
        total_discount=Sum('discount'),
    )

    data = {
        "period": period,
        "total_orders": agg['total_orders'] or 0,
        "total_revenue": float(agg['total_revenue'] or 0),
        "total_paid": float(agg['total_paid'] or 0),
        "total_remaining": float(agg['total_remaining'] or 0),
        "total_discount": float(agg['total_discount'] or 0),
        "paid_orders": orders.filter(payment_status='PAID').count(),
        "partial_orders": orders.filter(payment_status='PARTIAL').count(),
        "pending_orders": orders.filter(payment_status='PENDING').count(),
        "total_customers": Customer.objects.count(),
    }
    return success_response(data)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def daily_sales(request):
    """Get daily sales for last 30 days."""
    thirty_days_ago = timezone.now() - timedelta(days=30)
    daily = (
        Order.objects
        .filter(created_at__gte=thirty_days_ago)
        .annotate(date=TruncDate('created_at'))
        .values('date')
        .annotate(
            orders=Count('id'),
            revenue=Sum('total'),
            paid=Sum('amount_paid'),
        )
        .order_by('date')
    )
    data = [
        {
            "date": str(d['date']),
            "orders": d['orders'],
            "revenue": float(d['revenue'] or 0),
            "paid": float(d['paid'] or 0),
        }
        for d in daily
    ]
    return success_response(data)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def top_items(request):
    """Get top 10 items by revenue."""
    top = (
        OrderItem.objects
        .values('name')
        .annotate(
            total_revenue=Sum('item_total'),
            total_orders=Count('order', distinct=True),
        )
        .order_by('-total_revenue')[:10]
    )
    data = [
        {
            "name": item['name'],
            "total_revenue": float(item['total_revenue'] or 0),
            "total_orders": item['total_orders'],
        }
        for item in top
    ]
    return success_response(data)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def outstanding(request):
    """Get customers with outstanding balance."""
    customers = Customer.objects.prefetch_related('orders').all()
    result = []
    for c in customers:
        balance = c.outstanding_balance
        if balance > 0:
            result.append({
                "id": str(c.id),
                "name": c.name,
                "phone": c.phone,
                "outstanding_balance": float(balance),
                "total_orders": c.total_orders,
            })
    result.sort(key=lambda x: x['outstanding_balance'], reverse=True)
    return success_response(result)
