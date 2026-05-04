export function generateOrderId() {
  const now = new Date();
  const dateStr = now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0');
  const serial = String(getNextSerial()).padStart(3, '0');
  return `MLX-${dateStr}-${serial}`;
}

export function getNextSerial() {
  const current = parseInt(localStorage.getItem('mhl_serial') || '0', 10);
  const next = current + 1;
  localStorage.setItem('mhl_serial', next.toString());
  return next;
}

export function getSerialNumber() {
  return parseInt(localStorage.getItem('mhl_serial') || '0', 10);
}

export function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(date) {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getPaymentStatus(paid, total) {
  if (paid >= total) return 'PAID';
  if (paid > 0) return 'PARTIAL';
  return 'PENDING';
}

export function calculateDiscount(subtotal, coupon) {
  if (!coupon) return 0;
  if (coupon.discountType === 'percentage') {
    return subtotal * (coupon.value / 100);
  }
  return Math.min(coupon.value, subtotal);
}

export function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export function minutesSince(date) {
  return Math.floor((Date.now() - new Date(date).getTime()) / 60000);
}

export function buildWhatsAppMessage(order, settings) {
  return `✅ Order Confirmed!\nOrder ID: ${order.orderId}\nItems: ${order.items.map(it => `${it.name}(${it.pricingType === 'kg' ? it.grams + 'g' : it.quantity + 'pc'})`).join(', ')}\nTotal: ₹${order.total}\nPaid: ₹${order.paid} | Due: ₹${order.balance}\nDelivery: ${formatDate(order.deliveryDate)}\nThank you! — ${settings.shopName}`;
}

export function buildReminderMessage(customer, settings) {
  return `⏰ Payment Reminder\nDear ${customer.name}, your outstanding balance of ₹${customer.balance} is pending.\nPlease contact us at ${settings.phone || '9876543210'}.\n— ${settings.shopName}`;
}

export function openWhatsApp(phone, message) {
  let cleanPhone = String(phone).replace(/\D/g, '');
  if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;
  else if (cleanPhone.length === 12 && cleanPhone.startsWith('91')) { /* already has code */ }
  const encoded = encodeURIComponent(message);
  window.open(`https://wa.me/${cleanPhone}?text=${encoded}`, '_blank');
}
