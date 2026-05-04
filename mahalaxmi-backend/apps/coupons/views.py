from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser, AllowAny
from rest_framework.response import Response

from .models import Coupon
from .serializers import CouponSerializer, ValidateCouponSerializer


def success_response(data=None, message="Success"):
    return Response({"success": True, "message": message, "data": data})


def error_response(message="Error", details=None, status_code=status.HTTP_400_BAD_REQUEST):
    return Response({"error": True, "message": message, "details": details or {}}, status=status_code)


@api_view(['POST'])
@permission_classes([AllowAny])
def validate_coupon(request):
    """Validate a coupon code and calculate discount. PUBLIC endpoint for kiosk."""
    serializer = ValidateCouponSerializer(data=request.data)
    if not serializer.is_valid():
        return error_response("Invalid data", serializer.errors)

    code = serializer.validated_data['code'].upper()
    order_total = serializer.validated_data['order_total']

    try:
        coupon = Coupon.objects.get(code=code)
    except Coupon.DoesNotExist:
        return error_response("Coupon not found", status_code=status.HTTP_404_NOT_FOUND)

    is_valid, error_msg = coupon.validate(order_total)
    if not is_valid:
        return error_response(error_msg)

    discount = coupon.calculate_discount(order_total)
    return success_response({
        "coupon": CouponSerializer(coupon).data,
        "discount_amount": float(discount),
        "final_total": float(order_total - discount),
    }, "Coupon applied successfully")


class CouponViewSet(viewsets.ModelViewSet):
    queryset = Coupon.objects.all()
    serializer_class = CouponSerializer
    permission_classes = [IsAdminUser]

    def list(self, request, *args, **kwargs):
        qs = self.get_queryset()
        serializer = self.get_serializer(qs, many=True)
        return success_response(serializer.data)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        return success_response(self.get_serializer(instance).data)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response({"success": True, "message": "Coupon created", "data": serializer.data},
                        status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return success_response(serializer.data, "Coupon updated")

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return success_response(message="Coupon deleted")
