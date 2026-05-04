import logging
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.shortcuts import get_object_or_404, render
from django.http import HttpResponse

from .models import Order
from .serializers import OrderSerializer, OrderListSerializer
from .utils import generate_invoice_pdf

logger = logging.getLogger(__name__)

def success_response(data=None, message="Success"):
    return Response({
        "success": True,
        "message": message,
        "data": data
    }, status=status.HTTP_200_OK)

def error_response(message="Error", status_code=status.HTTP_400_BAD_REQUEST):
    return Response({
        "success": False,
        "message": message
    }, status=status_code)

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all().order_by('-created_at')
    
    def get_serializer_class(self):
        if self.action == 'list':
            return OrderListSerializer
        return OrderSerializer

    def get_permissions(self):
        if self.action in ['generate_invoice', 'list', 'retrieve', 'create']:
            return [AllowAny()]
        return [IsAuthenticated()]

    @action(
        detail=True,
        methods=['patch'],
        permission_classes=[AllowAny],
        url_path='kitchen',
    )
    def kitchen(self, request, pk=None):
        order = self.get_object()
        status_val = request.data.get('kitchen_status')
        if not status_val:
            return error_response("kitchen_status is required")
        
        order.kitchen_status = status_val
        order.save()
        return success_response(
            data={"order_id": order.order_id, "kitchen_status": order.kitchen_status},
            message=f"Status updated to {status_val}"
        )

    @action(
        detail=True,
        methods=['get'],
        permission_classes=[AllowAny],
        url_path='generate_invoice',
    )
    def generate_invoice(self, request, pk=None):
        try:
            print("STEP 1: starting invoice generation")
            order = self.get_object()
            print(f"STEP 2: order fetched: {order.order_id}")

            # The generate_invoice_pdf now handles both generation and upload
            print("STEP 3: calling generation pipeline...")
            pdf_bytes, pdf_url = generate_invoice_pdf(order)

            if not pdf_url:
                raise Exception("Failed to upload PDF to Cloudinary. No secure URL returned.")

            print(f"STEP 4: pipeline complete. URL: {pdf_url}")

            # Save the URL to the order model
            order.invoice_url = pdf_url
            order.save()

            return success_response(
                data={
                    "success": True,
                    "pdf_url": pdf_url,
                    "order_id": order.order_id,
                    "customer_phone": order.customer.phone if order.customer else None,
                },
                message="Invoice generated successfully"
            )

        except Exception as e:
            print("ERROR IN GENERATE_INVOICE:", str(e))
            import traceback
            traceback.print_exc()
            return Response(
                {"success": False, "error": str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

def invoice_view(request, order_id):
    """
    Public web view for the invoice.
    """
    order = get_object_or_404(Order, order_id=order_id)
    context = {
        'order': order,
        'shop': None,
        'items': order.items.all(),
        'date': order.created_at.strftime('%d %b %Y'),
    }
    try:
        from ..settings_app.models import ShopSettings
        context['shop'] = ShopSettings.objects.get(pk=1)
    except:
        pass

    return render(request, 'invoice.html', context)
