import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { formatPrice } from '../../utils/pricing';
import { formatDateTime, buildWhatsAppMessage, openWhatsApp } from '../../utils/orderUtils';
import { exportOrdersToExcel } from '../../utils/exportUtils';
import OrderTable from '../../components/admin/OrderTable';
import Modal from '../../components/shared/Modal';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import Badge from '../../components/shared/Badge';
import { Search, Download, MessageCircle } from 'lucide-react';

export default function OrdersPage() {
  const { orders, deleteOrder, updateOrder, settings } = useApp();
  const { addToast } = useToast();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewOrder, setViewOrder] = useState(null);
  const [editOrder, setEditOrder] = useState(null);
  const [editPaid, setEditPaid] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const filteredOrders = useMemo(() => {
    let result = [...(orders || [])];
    if (statusFilter !== 'all') {
      result = result.filter(o => o.paymentStatus === statusFilter.toUpperCase());
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(o =>
        o.orderId.toLowerCase().includes(q) ||
        o.customer.name.toLowerCase().includes(q) ||
        o.customer.phone.includes(q)
      );
    }
    return result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [orders, search, statusFilter]);

  const handleEditSave = () => {
    const newPaid = parseFloat(editPaid);
    if (isNaN(newPaid) || newPaid < 0) return;
    const balance = editOrder.total - newPaid;
    const status = newPaid >= editOrder.total ? 'PAID' : newPaid > 0 ? 'PARTIAL' : 'PENDING';
    updateOrder(editOrder.id, { paid: newPaid, balance, paymentStatus: status });
    addToast('Payment updated', 'success');
    setEditOrder(null);
  };

  const handleExport = () => {
    exportOrdersToExcel(orders || []);
    addToast('Orders exported', 'success');
  };

  const handleWhatsApp = (order) => {
    openWhatsApp(order.customer.phone, buildWhatsAppMessage(order, settings));
  };

  const filterChips = ['all', 'paid', 'partial', 'pending'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <button
          onClick={handleExport}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm font-medium hover:bg-emerald-600 btn-press"
        >
          <Download size={16} /> Export Excel
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm"
            placeholder="Search by Order ID, name, phone..."
          />
        </div>
        <div className="flex gap-2">
          {filterChips.map(f => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-3 py-2 rounded-xl text-sm font-medium capitalize transition-all ${
                statusFilter === f ? 'bg-orange-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <OrderTable
          orders={filteredOrders}
          onView={setViewOrder}
          onEdit={(o) => { setEditOrder(o); setEditPaid(String(o.paid)); }}
          onDelete={(o) => setDeleteConfirm(o)}
        />
        {filteredOrders.length === 0 && (
          <p className="text-center text-gray-500 py-8">No orders found</p>
        )}
      </div>

      {viewOrder && (
        <Modal isOpen={!!viewOrder} onClose={() => setViewOrder(null)} title="Order Details" size="lg">
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-gray-500">Order ID:</span> <span className="font-medium">{viewOrder.orderId}</span></div>
              <div className="bg-orange-50 px-2 py-1 rounded border border-orange-100">
                <span className="text-gray-500 text-xs block">Placed On:</span>
                <span className="font-bold text-orange-600">{formatDateTime(viewOrder.createdAt)}</span>
              </div>
              <div><span className="text-gray-500">Customer:</span> <span className="font-medium">{viewOrder.customer.name}</span></div>
              <div><span className="text-gray-500">Phone:</span> <span className="font-medium">{viewOrder.customer.phone}</span></div>
              <div><span className="text-gray-500">Delivery:</span> <span className="font-medium capitalize">{viewOrder.deliveryType} - {viewOrder.deliveryDate}</span></div>
              <div><span className="text-gray-500">Status:</span> <Badge variant={viewOrder.paymentStatus === 'PAID' ? 'success' : viewOrder.paymentStatus === 'PARTIAL' ? 'warning' : 'error'}>{viewOrder.paymentStatus}</Badge></div>
            </div>
            {viewOrder.customer.address && (
              <div className="text-sm"><span className="text-gray-500">Address:</span> {viewOrder.customer.address}</div>
            )}
            {viewOrder.notes && (
              <div className="text-sm"><span className="text-gray-500">Notes:</span> {viewOrder.notes}</div>
            )}
            <div className="border-t border-gray-100 pt-3">
              <p className="text-sm font-medium text-gray-700 mb-2">Items</p>
              {viewOrder.items.map(item => (
                <div key={item.id} className="flex justify-between text-sm py-1">
                  <span>{item.name} ({item.pricingType === 'kg' ? `${item.grams}g` : `${item.quantity}pc`})</span>
                  <span className="font-medium">{formatPrice(item.subtotal)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 pt-3 space-y-1 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(viewOrder.subtotal)}</span></div>
              {viewOrder.discount > 0 && <div className="flex justify-between text-emerald-600"><span>Discount</span><span>-{formatPrice(viewOrder.discount)}</span></div>}
              <div className="flex justify-between"><span>Delivery</span><span>{formatPrice(viewOrder.deliveryCharge)}</span></div>
              <div className="flex justify-between font-bold text-base border-t border-gray-100 pt-2"><span>Total</span><span className="text-orange-600">{formatPrice(viewOrder.total)}</span></div>
              <div className="flex justify-between"><span className="text-emerald-600">Paid</span><span className="text-emerald-600">{formatPrice(viewOrder.paid)}</span></div>
              <div className="flex justify-between"><span className="text-orange-600">Balance</span><span className="text-orange-600">{formatPrice(viewOrder.balance)}</span></div>
            </div>
            <div className="flex gap-2 pt-3">
              <button onClick={() => { setViewOrder(null); setEditOrder(viewOrder); setEditPaid(String(viewOrder.paid)); }} className="flex-1 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-semibold btn-press">Edit Payment</button>
              <button onClick={() => handleWhatsApp(viewOrder)} className="flex-1 py-2.5 bg-green-500 text-white rounded-xl text-sm font-semibold btn-press flex items-center justify-center gap-1.5">
                <MessageCircle size={16} /> WhatsApp
              </button>
            </div>
          </div>
        </Modal>
      )}

      {editOrder && (
        <Modal isOpen={!!editOrder} onClose={() => setEditOrder(null)} title="Edit Payment" size="sm">
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Order: {editOrder.orderId} | Total: {formatPrice(editOrder.total)}</p>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Amount Paid</label>
              <input type="number" value={editPaid} onChange={(e) => setEditPaid(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm" min="0" max={editOrder.total} />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setEditOrder(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700">Cancel</button>
              <button onClick={handleEditSave} className="flex-1 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-semibold btn-press">Save</button>
            </div>
          </div>
        </Modal>
      )}

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => { deleteOrder(deleteConfirm.id); addToast('Order deleted', 'success'); setDeleteConfirm(null); }}
        title="Delete Order"
        message={`Delete order ${deleteConfirm?.orderId}? This cannot be undone.`}
        variant="danger"
      />
    </div>
  );
}
