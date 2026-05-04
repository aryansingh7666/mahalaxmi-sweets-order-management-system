from reportlab.lib.pagesizes import A4
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Table, TableStyle, 
    Paragraph, Spacer
)
from reportlab.lib.styles import (
    getSampleStyleSheet, ParagraphStyle
)
from reportlab.lib.enums import TA_CENTER, TA_RIGHT
from io import BytesIO
from django.conf import settings
import cloudinary.uploader
import os

def generate_invoice_pdf(order):
    """Generate professional invoice PDF"""
    buffer = BytesIO()
    
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=0.5*inch,
        leftMargin=0.5*inch,
        topMargin=0.5*inch,
        bottomMargin=0.5*inch
    )
    
    elements = []
    styles = getSampleStyleSheet()
    
    # Title
    title_style = ParagraphStyle(
        'Title',
        parent=styles['Heading1'],
        fontSize=20,
        textColor=colors.HexColor('#F97316'),
        alignment=TA_CENTER,
        spaceAfter=20
    )
    elements.append(
        Paragraph(
            "Mahalaxmi Sweets & Farsan", 
            title_style
        )
    )
    elements.append(
        Paragraph("INVOICE", styles['Heading2'])
    )
    elements.append(Spacer(1, 0.2*inch))
    
    # Order info
    order_data = [
        ['Order ID:', order.order_id, 
         'Date:', order.created_at.strftime('%d %b %Y')],
        ['Serial:', f"#{order.serial_number}", 
         'Status:', order.payment_status.upper()],
    ]
    order_table = Table(order_data)
    order_table.setStyle(TableStyle([
        ('FONTNAME', (0,0), (-1,-1), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,-1), 10),
    ]))
    elements.append(order_table)
    elements.append(Spacer(1, 0.2*inch))
    
    # Customer
    elements.append(
        Paragraph("Customer Details", styles['Heading3'])
    )
    cust_data = [
        ['Name:', order.customer.name],
        ['Phone:', order.customer.phone],
    ]
    if order.delivery_address:
        cust_data.append(['Address:', order.delivery_address])
    
    cust_table = Table(cust_data, colWidths=[1*inch, 5*inch])
    elements.append(cust_table)
    elements.append(Spacer(1, 0.2*inch))
    
    # Items
    elements.append(
        Paragraph("Items", styles['Heading3'])
    )
    items_data = [['Item', 'Qty', 'Price', 'Total']]
    
    for item in order.items.all():
        if item.pricing_type == 'kg':
            qty = f"{item.quantity_grams/1000:.2f}kg" \
                  if item.quantity_grams >= 1000 \
                  else f"{item.quantity_grams}g"
        else:
            qty = f"{item.quantity_pieces} pc"
        
        items_data.append([
            item.item_name,
            qty,
            f"Rs.{item.item_price:.2f}",
            f"Rs.{item.item_total:.2f}"
        ])
    
    items_table = Table(items_data)
    items_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), 
         colors.HexColor('#F97316')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('GRID', (0,0), (-1,-1), 0.5, colors.grey),
    ]))
    elements.append(items_table)
    elements.append(Spacer(1, 0.2*inch))
    
    # Totals
    totals_data = [
        ['Subtotal:', f"Rs.{order.subtotal:.2f}"],
    ]
    if order.discount_amount > 0:
        totals_data.append([
            'Discount:', 
            f"-Rs.{order.discount_amount:.2f}"
        ])
    if order.delivery_charge > 0:
        totals_data.append([
            'Delivery:', 
            f"Rs.{order.delivery_charge:.2f}"
        ])
    totals_data.append([
        'TOTAL:', 
        f"Rs.{order.total_amount:.2f}"
    ])
    totals_data.append([
        'Paid:', 
        f"Rs.{order.amount_paid:.2f}"
    ])
    if order.remaining_amount > 0:
        totals_data.append([
            'Balance:', 
            f"Rs.{order.remaining_amount:.2f}"
        ])
    
    totals_table = Table(
        totals_data, 
        colWidths=[4.5*inch, 1.5*inch]
    )
    totals_table.setStyle(TableStyle([
        ('ALIGN', (0,0), (-1,-1), 'RIGHT'),
        ('FONTNAME', (0,-3), (-1,-3), 'Helvetica-Bold'),
        ('FONTSIZE', (0,-3), (-1,-3), 12),
    ]))
    elements.append(totals_table)
    
    # Build PDF
    doc.build(elements)
    pdf_bytes = buffer.getvalue()
    
    # Upload to Cloudinary DIRECTLY from memory
    pdf_url = None
    try:
        # Seek to beginning of buffer
        buffer.seek(0)
        
        upload_result = cloudinary.uploader.upload(
            buffer,
            resource_type = "raw",
            public_id     = f"mahalaxmi/invoices/order_{order.order_id}.pdf",
            overwrite     = True,
            invalidate    = True
        )
        pdf_url = upload_result["secure_url"]
        print(f"Cloudinary success: {pdf_url}")

    except Exception as e:
        print(f"Cloudinary error: {e}")
        pdf_url = None
    finally:
        buffer.close()

    return pdf_bytes, pdf_url
