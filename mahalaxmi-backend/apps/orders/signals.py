"""
Order signals.

PDF generation is now done on-demand via the
`generate_invoice` API action (GET /orders/{id}/generate_invoice/).
This keeps order creation fast and lets the frontend control timing.
"""
import logging
import threading

from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import Order
from .utils import generate_invoice_pdf

logger = logging.getLogger(__name__)


@receiver(post_save, sender=Order)
def order_post_save(sender, instance, created, **kwargs):
    """
    After a new order is saved, pre-generate the invoice PDF in
    the background so it's ready when the user hits "Send to WhatsApp".
    Failures are logged but never raise — order creation must not block.
    """
    if not created:
        return

    def _bg(order):
        try:
            _, pdf_url = generate_invoice_pdf(order)
            order.invoice_url = pdf_url
            order.save(update_fields=['invoice_url'])
            logger.info("Background PDF ready for %s: %s", order.order_id, pdf_url)
        except Exception as exc:
            # Non-fatal — PDF can still be generated on demand
            logger.warning(
                "Background PDF pre-generation failed for %s: %s",
                order.order_id,
                exc,
            )

    thread = threading.Thread(target=_bg, args=(instance,), daemon=True)
    thread.start()
