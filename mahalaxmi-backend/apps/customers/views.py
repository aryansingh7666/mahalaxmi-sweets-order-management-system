from rest_framework import viewsets, filters, status
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from .models import Customer
from .serializers import CustomerSerializer, FindOrCreateSerializer


def success_response(data=None, message="Success"):
    return Response({"success": True, "message": message, "data": data})


def error_response(message="Error", details=None, status_code=status.HTTP_400_BAD_REQUEST):
    return Response({"error": True, "message": message, "details": details or {}}, status=status_code)


@api_view(['POST'])
@permission_classes([AllowAny])
def find_or_create_customer(request):
    """Find existing customer by phone or create new one. PUBLIC endpoint for kiosk."""
    serializer = FindOrCreateSerializer(data=request.data)
    if not serializer.is_valid():
        return error_response("Invalid data", serializer.errors)

    phone = serializer.validated_data['phone']
    name = serializer.validated_data.get('name', '').strip()
    address = serializer.validated_data.get('address', '')

    customer, created = Customer.objects.get_or_create(
        phone=phone,
        defaults={'name': name or phone, 'address': address}
    )

    # Update name/address if provided and customer exists
    if not created and (name or address):
        if name:
            customer.name = name
        if address:
            customer.address = address
        customer.save()

    return success_response(
        CustomerSerializer(customer).data,
        "Customer created" if created else "Customer found"
    )


class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    permission_classes = [IsAdminUser]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'phone', 'address']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']

    def list(self, request, *args, **kwargs):
        qs = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(qs, many=True)
        return success_response(serializer.data)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return success_response(serializer.data)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response({"success": True, "message": "Customer created", "data": serializer.data},
                        status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return success_response(serializer.data, "Customer updated")

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return success_response(message="Customer deleted")

    @action(detail=True, methods=['get'])
    def orders(self, request, pk=None):
        """Get all orders for a customer."""
        customer = self.get_object()
        from apps.orders.serializers import OrderListSerializer
        orders = customer.orders.order_by('-created_at')
        serializer = OrderListSerializer(orders, many=True)
        return success_response(serializer.data)

    @action(detail=True, methods=['get'])
    def balance(self, request, pk=None):
        """Get outstanding balance for a customer."""
        customer = self.get_object()
        return success_response({
            "customer_id": str(customer.id),
            "name": customer.name,
            "phone": customer.phone,
            "outstanding_balance": float(customer.outstanding_balance),
            "total_orders": customer.total_orders,
            "total_spent": float(customer.total_spent),
        })
