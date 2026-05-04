import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, Download, Printer, ShoppingBag, Copy, ExternalLink } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { formatPrice, formatWeight } from '../utils/pricing';
import { formatDate } from '../utils/orderUtils';
import Badge from '../components/shared/Badge';
import { ordersApi } from '../api/orders';
import { useState, useEffect } from 'react';

// ─── WhatsApp SVG icon ────────────────────────────────────────────────────────
function WhatsAppIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.555 4.122 1.528 5.855L.057 23.882l6.168-1.619A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.007-1.374l-.36-.214-3.724.977.994-3.634-.234-.374A9.818 9.818 0 0112 2.182c5.42 0 9.818 4.398 9.818 9.818 0 5.42-4.398 9.818-9.818 9.818z" />
    </svg>
  );
}

// ─── Build WhatsApp professional short message (EXACT VERSION REQUESTED) ─────
function buildMessage(order, pdfUrl, shopPhone = '9876543210') {
  const orderId = order.order_id || '';

  return `Mahalaxmi Sweets & Farsan

Order Confirmed

Order ID: ${orderId}

Download Invoice:
${pdfUrl}

Contact: ${shopPhone}`.trim();
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function SuccessPage() {
  const location  = useLocation();
  const navigate  = useNavigate();
  const { settings }  = useApp();
  const { addToast }  = useToast();
  const order = location.state?.order;

  const [confetti, setConfetti]               = useState([]);
  const [loadingPDF, setLoadingPDF]           = useState(false);
  const [pdfUrl, setPdfUrl]                   = useState(order?.invoice_url || null);

  // ── Confetti burst on mount ───────────────────────────────────
  useEffect(() => {
    if (!order) return;
    const particles = Array.from({ length: 35 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.6,
      duration: 1.5 + Math.random(),
      color: ['#F97316', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6'][Math.floor(Math.random() * 6)],
      size: 6 + Math.random() * 9,
      shape: Math.random() > 0.5 ? '50%' : '2px',
    }));
    setConfetti(particles);
    const t = setTimeout(() => setConfetti([]), 3200);
    return () => clearTimeout(t);
  }, [order]);

  // ── Pre-generate PDF as soon as success page loads ────────────
  useEffect(() => {
    if (!order?.id || pdfUrl) return;
    (async () => {
      try {
        const res = await ordersApi.generateInvoice(order.id);
        if (res?.data?.pdf_url) {
          setPdfUrl(res.data.pdf_url);
        }
      } catch (e) {
        console.warn('Background invoice pre-generation skipped:', e);
      }
    })();
  }, [order?.id]);

  // ── Guard ─────────────────────────────────────────────────────
  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">No order found</p>
          <button
            onClick={() => navigate('/kiosk')}
            className="px-6 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-all"
          >
            New Order
          </button>
        </div>
      </div>
    );
  }

  const statusVariant = { PAID: 'success', PARTIAL: 'warning', PENDING: 'error' };

  // Function to generate and get PDF URL
  const generatePDFUrl = async () => {
    if (pdfUrl) return pdfUrl;
    
    try {
      setLoadingPDF(true);
      
      const response = await fetch(
        `http://localhost:8000/api/orders/${order.id}/generate_invoice/`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      
      const data = await response.json();
      
      if (data.success && data.data.pdf_url) {
        setPdfUrl(data.data.pdf_url);
        return data.data.pdf_url;
      } else {
        throw new Error('Failed to generate PDF');
      }
    } catch (error) {
      console.error('PDF generation error:', error);
      addToast('Failed to generate invoice', 'error');
      return null;
    } finally {
      setLoadingPDF(false);
    }
  };

  // Download PDF handler
  const handleDownloadPDF = async () => {
    // Open synchronously to prevent popup blocker
    const newWindow = window.open('', '_blank');
    const url = await generatePDFUrl();
    if (!url) {
      newWindow?.close();
      return;
    }
    
    if (newWindow) newWindow.location.href = url;
    else window.open(url, '_blank'); // fallback
    addToast('Opening invoice...', 'success');
  };

  // Print handler
  const handlePrintPDF = async () => {
    const printWindow = window.open('', '_blank');
    const url = await generatePDFUrl();
    if (!url) {
      printWindow?.close();
      return;
    }
    
    if (printWindow) {
      printWindow.location.href = url;
      printWindow.onload = () => {
        setTimeout(() => printWindow.print(), 500);
      };
    } else {
      window.open(url, '_blank');
    }
  };

  // WhatsApp handler
  const handleWhatsAppInvoice = async () => {
    const waWindow = window.open('', '_blank');
    const url = await generatePDFUrl();
    if (!url) {
      waWindow?.close();
      return;
    }
    
    const phone = order.customerPhone || 
                  order.customer?.phone || 
                  order.customer_phone || '';
    
    if (!phone || phone.length < 10) {
      addToast('Customer phone number not found', 'error');
      return;
    }
    
    const message = `*Mahalaxmi Sweets & Farsan*
Order ID: ${order.orderId || order.order_id}

DOWNLOAD INVOICE:
${url}

Thank you for your order!`;
    
    const encodedMessage = encodeURIComponent(message);
    const cleanPhone = phone.replace(/\D/g, '');
    const waUrl = `https://wa.me/91${cleanPhone}?text=${encodedMessage}`;
    
    if (waWindow) waWindow.location.href = waUrl;
    else window.open(waUrl, '_blank');
    
    addToast('Opening WhatsApp...', 'success');
  };

  // ── UI ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 relative overflow-hidden">
      {/* Confetti */}
      {confetti.length > 0 && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {confetti.map(p => (
            <div
              key={p.id}
              className="absolute animate-confetti"
              style={{
                left: `${p.left}%`,
                top: '-10px',
                width: `${p.size}px`,
                height: `${p.size}px`,
                backgroundColor: p.color,
                borderRadius: p.shape,
                animationDelay: `${p.delay}s`,
                animationDuration: `${p.duration}s`,
              }}
            />
          ))}
        </div>
      )}

      <div className="max-w-lg mx-auto">
        {/* Success header */}
        <div className="text-center mb-6">
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4 animate-bounceIn">
            <CheckCircle size={40} className="text-emerald-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Order Placed Successfully!</h1>
          {pdfUrl && (
            <p className="text-xs text-emerald-600 mt-1 flex items-center justify-center gap-1">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Invoice ready to send
            </p>
          )}
        </div>

        {/* Order card */}
        <div className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
          {/* Serial + Order ID */}
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Serial Number</p>
              <p className="text-lg font-bold text-gray-900">#{String(order.serial_number || order.serialNumber || '').padStart(3, '0')}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Order ID</p>
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-bold text-gray-900">{order.order_id}</p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(order.order_id);
                    addToast('Order ID copied', 'info');
                  }}
                  className="p-1 rounded hover:bg-gray-100 transition-all"
                  title="Copy Order ID"
                >
                  <Copy size={14} className="text-gray-400" />
                </button>
              </div>
            </div>
          </div>

          {/* Placement Time */}
          <div className="border-t border-gray-100 pt-3 bg-gray-50/50 p-2 rounded-lg">
            <p className="text-xs text-gray-500 uppercase font-semibold">Ordered On</p>
            <p className="text-sm font-bold text-gray-900">
              {new Date(order.created_at || order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} | {new Date(order.created_at || order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>

          {/* Customer */}
          <div className="border-t border-gray-100 pt-3">
            <p className="text-sm text-gray-500">Customer</p>
            <p className="font-medium text-gray-900">
              {order.customer_name} | {order.customer_phone}
            </p>
          </div>

          {/* Items */}
          <div className="border-t border-gray-100 pt-3">
            <p className="text-sm text-gray-500 mb-2">Items</p>
            {(order.items || []).map(item => (
              <div key={item.id} className="flex justify-between text-sm py-1">
                <span className="text-gray-700">
                  {item.item_name || item.name}{' '}
                  ({item.pricing_type === 'kg'
                    ? formatWeight(item.quantity_grams)
                    : `${item.quantity_pieces}pc`})
                </span>
                <span className="font-medium">{formatPrice(item.item_total)}</span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="border-t border-gray-100 pt-3 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            {parseFloat(order.discount_amount) > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-emerald-600">Discount</span>
                <span className="text-emerald-600">-{formatPrice(order.discount_amount)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Delivery</span>
              <span>{formatPrice(order.delivery_charge)}</span>
            </div>
            <div className="flex justify-between font-bold text-base pt-1 border-t border-gray-100">
              <span>Total</span>
              <span className="text-orange-600">{formatPrice(order.total_amount)}</span>
            </div>
          </div>

          {/* Paid / Remaining */}
          <div className="border-t border-gray-100 pt-3 flex justify-between">
            <div>
              <p className="text-sm text-gray-500">Paid</p>
              <p className="font-bold text-emerald-600">{formatPrice(order.amount_paid)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Remaining</p>
              <p className="font-bold text-orange-600">{formatPrice(order.remaining_amount)}</p>
            </div>
          </div>

          {/* Status + Delivery */}
          <div className="flex items-center justify-between border-t border-gray-100 pt-3">
            <Badge variant={statusVariant[order.payment_status]} size="md">
              {order.payment_status}
            </Badge>
            <div className="text-right text-sm text-gray-500">
              <p>{formatDate(order.delivery_date)} | {order.delivery_type === 'delivery' ? 'Delivery' : 'Pickup'}</p>
            </div>
          </div>

          {/* Gift section */}
          {order.is_gift && (
            <div className="border-t border-gray-100 pt-3 bg-orange-50 rounded-xl p-3">
              <p className="text-sm font-semibold text-orange-700 mb-1">🎁 Gift Order</p>
              <p className="text-sm text-gray-700">To: {order.gift_recipient_name} | {order.gift_recipient_phone}</p>
              {order.gift_message && (
                <p className="text-sm text-gray-500 italic mt-1">"{order.gift_message}"</p>
              )}
            </div>
          )}

          {/* PDF URL preview (if ready) */}
          {pdfUrl && (
            <div className="border-t border-gray-100 pt-3">
              <p className="text-xs text-gray-400 mb-1">Invoice link</p>
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-blue-500 hover:text-blue-600 break-all"
              >
                <ExternalLink size={12} className="shrink-0" />
                {pdfUrl}
              </a>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-3 mt-6">
          <button
            onClick={handleDownloadPDF}
            disabled={loadingPDF}
            className="flex items-center justify-center gap-2 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all btn-press disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingPDF ? (
              <>
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download size={16} />
                Download PDF
              </>
            )}
          </button>

          <button
            onClick={handlePrintPDF}
            disabled={loadingPDF}
            className="flex items-center justify-center gap-2 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all btn-press disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Printer size={16} />
            Print Receipt
          </button>

          {/* WhatsApp — full-width */}
          <button
            id="whatsapp-invoice-btn"
            onClick={handleWhatsAppInvoice}
            disabled={loadingPDF}
            className="col-span-2 flex items-center justify-center gap-2 py-3.5 bg-green-500 text-white rounded-xl text-sm font-semibold hover:bg-green-600 active:scale-95 transition-all btn-press disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loadingPDF ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generating Invoice…
              </>
            ) : (
              <>
                <WhatsAppIcon size={20} />
                📄 Send Invoice to WhatsApp
                {pdfUrl && <span className="ml-1 text-xs bg-white/20 px-1.5 py-0.5 rounded-full">Ready</span>}
              </>
            )}
          </button>

          <button
            onClick={() => navigate('/kiosk')}
            className="col-span-2 flex items-center justify-center gap-2 py-3 bg-orange-500 text-white rounded-xl text-sm font-semibold hover:bg-orange-600 transition-all btn-press"
          >
            <ShoppingBag size={16} />
            New Order
          </button>
        </div>
      </div>
    </div>
  );
}
