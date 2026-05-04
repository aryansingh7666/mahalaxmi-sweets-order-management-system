import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

export function generateInvoice(order, settings) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Robust field mapping for backend (snake_case) and local (camelCase)
  const orderId = order.order_id || order.orderId;
  const serial = order.serial_number || order.serial;
  const createdAt = order.created_at || order.createdAt || new Date();
  const customerName = order.customer_name || (order.customer && order.customer.name) || 'Customer';
  const customerPhone = order.customer_phone || (order.customer && order.customer.phone) || '';
  const customerAddress = order.delivery_address || (order.customer && order.customer.address) || '';
  
  const subtotal = parseFloat(order.subtotal || 0);
  const discount = parseFloat(order.discount_amount || order.discount || 0);
  const deliveryCharge = parseFloat(order.delivery_charge || order.deliveryCharge || 0);
  const total = parseFloat(order.total_amount || order.total || 0);
  const amountPaid = parseFloat(order.amount_paid || order.paid || 0);
  const remainingAmount = parseFloat(order.remaining_amount || order.balance || 0);
  const paymentStatus = order.payment_status || order.paymentStatus || 'PENDING';

  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(settings.shopName || 'Mahalaxmi Sweets & Farsan', pageWidth / 2, 20, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(settings.tagline || 'Taste the Tradition', pageWidth / 2, 28, { align: 'center' });
  doc.text(`Ph: ${settings.phone || '9876543210'}`, pageWidth / 2, 34, { align: 'center' });

  doc.setDrawColor(200);
  doc.line(14, 38, pageWidth - 14, 38);

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE', 14, 48);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Order ID: ${orderId}`, 14, 56);
  doc.text(`Date: ${new Date(createdAt).toLocaleDateString('en-IN')}`, 14, 62);
  doc.text(`Serial: #${String(serial).padStart(3, '0')}`, 14, 68);

  doc.text(`Customer: ${customerName}`, 14, 78);
  doc.text(`Phone: ${customerPhone}`, 14, 84);
  if (customerAddress) {
    doc.text(`Address: ${customerAddress}`, 14, 90);
  }

  const tableStartY = customerAddress ? 98 : 92;

  const tableData = (order.items || []).map(item => {
    const itemName = item.item_name || item.name;
    const qtyLabel = (item.pricing_type || item.pricingType) === 'kg'
      ? `${item.quantity_grams || item.grams || 0}g`
      : `${item.quantity_pieces || item.quantity || 0}pc`;
    const itemTotal = parseFloat(item.item_total || item.subtotal || 0);
    return [itemName, qtyLabel, `₹${itemTotal.toFixed(2)}`];
  });

  doc.autoTable({
    startY: tableStartY,
    head: [['Item', 'Qty', 'Amount']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [249, 115, 22] },
    margin: { left: 14, right: 14 },
  });

  let finalY = doc.lastAutoTable.finalY + 8;

  doc.setFontSize(10);
  doc.text(`Subtotal: ₹${subtotal.toFixed(2)}`, pageWidth - 14, finalY, { align: 'right' });
  finalY += 6;
  if (discount > 0) {
    doc.setTextColor(16, 185, 129);
    doc.text(`Discount: -₹${discount.toFixed(2)}`, pageWidth - 14, finalY, { align: 'right' });
    doc.setTextColor(0);
    finalY += 6;
  }
  doc.text(`Delivery: ₹${deliveryCharge.toFixed(2)}`, pageWidth - 14, finalY, { align: 'right' });
  finalY += 6;

  doc.setDrawColor(200);
  doc.line(pageWidth - 60, finalY, pageWidth - 14, finalY);
  finalY += 6;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`TOTAL: ₹${total.toFixed(2)}`, pageWidth - 14, finalY, { align: 'right' });
  finalY += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Paid: ₹${amountPaid.toFixed(2)}`, pageWidth - 14, finalY, { align: 'right' });
  finalY += 6;
  if (remainingAmount > 0) {
    doc.setTextColor(234, 88, 12);
    doc.text(`Balance Due: ₹${remainingAmount.toFixed(2)}`, pageWidth - 14, finalY, { align: 'right' });
    doc.setTextColor(0);
    finalY += 6;
  }

  const statusColor = paymentStatus === 'PAID' ? [16, 185, 129] :
    paymentStatus === 'PARTIAL' ? [245, 158, 11] : [239, 68, 68];
  doc.setTextColor(...statusColor);
  doc.text(`Status: ${paymentStatus}`, pageWidth - 14, finalY, { align: 'right' });
  doc.setTextColor(0);

  if (order.is_gift || order.giftOrder) {
    const recipientName = order.gift_recipient_name || (order.recipient && order.recipient.name);
    const recipientPhone = order.gift_recipient_phone || (order.recipient && order.recipient.phone);
    const giftMessage = order.gift_message || (order.recipient && order.recipient.message);

    if (recipientName) {
      finalY += 12;
      doc.setFont('helvetica', 'bold');
      doc.text('Gift Order', 14, finalY);
      doc.setFont('helvetica', 'normal');
      finalY += 6;
      doc.text(`Recipient: ${recipientName}`, 14, finalY);
      finalY += 6;
      doc.text(`Phone: ${recipientPhone || ''}`, 14, finalY);
      if (giftMessage) {
        finalY += 6;
        doc.text(`Message: ${giftMessage}`, 14, finalY);
      }
    }
  }

  finalY += 16;
  doc.setDrawColor(200);
  doc.line(14, finalY, pageWidth - 14, finalY);
  finalY += 8;
  doc.setFontSize(11);
  doc.text('Thank you! Visit again!', pageWidth / 2, finalY, { align: 'center' });

  return doc;
}

export function downloadInvoice(order, settings) {
  const doc = generateInvoice(order, settings);
  const fileName = order.order_id || order.orderId || 'invoice';
  doc.save(`${fileName}.pdf`);
}

export function printInvoice(order, settings) {
  const doc = generateInvoice(order, settings);
  doc.autoPrint();
  const blob = doc.output('blob');
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
}

export function exportOrdersToExcel(orders) {
  const wb = XLSX.utils.book_new();

  const ordersData = orders.map((o, i) => ({
    '#': i + 1,
    'Order ID': o.orderId,
    'Customer': o.customer.name,
    'Phone': o.customer.phone,
    'Items': o.items.map(it => `${it.name}(${it.pricingType === 'kg' ? it.grams + 'g' : it.quantity + 'pc'})`).join(', '),
    'Subtotal': o.subtotal,
    'Discount': o.discount,
    'Delivery': o.deliveryCharge,
    'Total': o.total,
    'Paid': o.paid,
    'Balance': o.balance,
    'Status': o.paymentStatus,
    'Date': new Date(o.createdAt).toLocaleDateString('en-IN'),
  }));

  const ws = XLSX.utils.json_to_sheet(ordersData);
  XLSX.utils.book_append_sheet(wb, ws, 'Orders');

  const summaryData = [
    { 'Status': 'PAID', 'Count': orders.filter(o => o.paymentStatus === 'PAID').length, 'Total': orders.filter(o => o.paymentStatus === 'PAID').reduce((s, o) => s + o.total, 0) },
    { 'Status': 'PARTIAL', 'Count': orders.filter(o => o.paymentStatus === 'PARTIAL').length, 'Total': orders.filter(o => o.paymentStatus === 'PARTIAL').reduce((s, o) => s + o.total, 0) },
    { 'Status': 'PENDING', 'Count': orders.filter(o => o.paymentStatus === 'PENDING').length, 'Total': orders.filter(o => o.paymentStatus === 'PENDING').reduce((s, o) => s + o.total, 0) },
  ];
  const ws2 = XLSX.utils.json_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, ws2, 'Summary');

  XLSX.writeFile(wb, 'orders_export.xlsx');
}

export function exportCustomersToExcel(customers) {
  const wb = XLSX.utils.book_new();

  const data = customers.map((c, i) => ({
    '#': i + 1,
    'Name': c.name,
    'Phone': c.phone,
    'Address': c.address || '',
    'Orders': c.orderCount,
    'Total Spent': c.totalSpent,
    'Balance': c.balance,
    'Last Order': c.lastOrderDate ? new Date(c.lastOrderDate).toLocaleDateString('en-IN') : '',
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, 'Customers');
  XLSX.writeFile(wb, 'customers_export.xlsx');
}
