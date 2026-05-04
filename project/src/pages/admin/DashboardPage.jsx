import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { formatPrice } from '../../utils/pricing';
import { formatDateTime, buildReminderMessage, openWhatsApp } from '../../utils/orderUtils';
import StatsCard from '../../components/admin/StatsCard';
import OrderTable from '../../components/admin/OrderTable';
import Modal from '../../components/shared/Modal';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import Badge from '../../components/shared/Badge';
import { Package, IndianRupee, CheckCircle, Zap, Clock, Users, AlertTriangle } from 'lucide-react';

export default function DashboardPage() {
  const { orders, deleteOrder, updateOrder, customers, settings } = useApp();
  const [filter, setFilter] = useState('all');
  const [viewOrder, setViewOrder] = useState(null);
  const [editOrder, setEditOrder] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [editPaid, setEditPaid] = useState('');

  const filteredOrders = useMemo(() => {
    let result = [...(orders || [])];
    const now = new Date();
    if (filter === 'today') {
      result = result.filter(o => new Date(o.created_at).toDateString() === now.toDateString());
    } else if (filter === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      result = result.filter(o => new Date(o.created_at) >= weekAgo);
    } else if (filter === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      result = result.filter(o => new Date(o.created_at) >= monthAgo);
    } else if (filter === 'paid') {
      result = result.filter(o => o.payment_status === 'PAID');
    } else if (filter === 'partial') {
      result = result.filter(o => o.payment_status === 'PARTIAL');
    } else if (filter === 'pending') {
      result = result.filter(o => o.payment_status === 'PENDING');
    }
    return result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [orders, filter]);

  const stats = useMemo(() => {
    // Ensure we are using the most up-to-date orders from context
    const all = orders || [];
    return {
      totalOrders: all.length,
      totalSales: all.reduce((s, o) => s + parseFloat(o.total_amount || 0), 0),
      fullyPaid: all.filter(o => o.payment_status === 'PAID').length,
      fullyPaidAmount: all.filter(o => o.payment_status === 'PAID').reduce((s, o) => s + parseFloat(o.total_amount || 0), 0),
      partial: all.filter(o => o.payment_status === 'PARTIAL').length,
      partialAmount: all.filter(o => o.payment_status === 'PARTIAL').reduce((s, o) => s + parseFloat(o.total_amount || 0), 0),
      pending: all.filter(o => o.payment_status === 'PENDING').length,
      pendingAmount: all.filter(o => o.payment_status === 'PENDING').reduce((s, o) => s + parseFloat(o.total_amount || 0), 0),
      customers: (customers || []).length,
      outstandingBalance: all.reduce((s, o) => s + parseFloat(o.remaining_amount || 0), 0),
    };
  }, [orders, customers]);

  const outstandingCustomers = useMemo(() => {
    return (customers || []).filter(c => parseFloat(c.balance || 0) > 0);
  }, [customers]);

  const handleDelete = (order) => {
    deleteOrder(order.id);
  };

  const handleEditSave = () => {
    const newPaid = parseFloat(editPaid);
    if (isNaN(newPaid) || newPaid < 0) return;
    const balance = parseFloat(editOrder.total_amount) - newPaid;
    const status = newPaid >= parseFloat(editOrder.total_amount) ? 'PAID' : newPaid > 0 ? 'PARTIAL' : 'PENDING';
    updateOrder(editOrder.id, { amount_paid: newPaid, remaining_amount: balance, payment_status: status });
    setEditOrder(null);
  };

  const sendReminder = (customer) => {
    openWhatsApp(customer.phone, buildReminderMessage(customer, settings));
  };

  const filterButtons = [
    { key: 'all', label: 'All Time' },
    { key: 'today', label: 'Today' },
    { key: 'week', label: 'This Week' },
    { key: 'month', label: 'This Month' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      <div className="flex gap-2 overflow-x-auto">
        {filterButtons.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              filter === f.key ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 items-stretch">
        <StatsCard icon={Package} label="Total Orders" value={stats.totalOrders} color="orange" onClick={() => setFilter('all')} />
        <StatsCard icon={IndianRupee} label="Total Sales" value={stats.totalSales} color="green" onClick={() => setFilter('all')} prefix="₹" />
        <StatsCard icon={CheckCircle} label="Fully Paid" value={stats.fullyPaid} color="green" onClick={() => setFilter('paid')} />
        <StatsCard icon={Zap} label="Partial" value={stats.partial} color="yellow" onClick={() => setFilter('partial')} />
        <StatsCard icon={Clock} label="Pending" value={stats.pending} color="red" onClick={() => setFilter('pending')} />
        <StatsCard icon={Users} label="Customers" value={stats.customers} color="blue" />
      </div>

      {stats.outstandingBalance > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <AlertTriangle size={20} className="text-red-500" />
            <div>
              <p className="font-semibold text-red-800">Outstanding Balance: {formatPrice(stats.outstandingBalance)}</p>
            </div>
          </div>
          {outstandingCustomers.length > 0 && (
            <div className="mt-4 divide-y divide-gray-100 bg-white rounded-xl overflow-hidden border border-gray-100">
              {outstandingCustomers.slice(0, 5).map(c => (
                <div key={c.id} className="flex items-center justify-between py-2.5 px-4 hover:bg-gray-50 transition-all">
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900 text-sm truncate">{c.name}</p>
                    <p className="text-xs text-gray-500">{c.phone}</p>
                  </div>
                  <div className="flex items-center gap-4 ml-4">
                    <span className="font-bold text-red-600 text-sm whitespace-nowrap">{formatPrice(c.balance)}</span>
                    <button
                      onClick={() => sendReminder(c)}
                      className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-xs font-semibold hover:bg-green-600 transition-all btn-press shadow-sm"
                    >
                      Send Reminder
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h2>
        <OrderTable
          orders={filteredOrders}
          onView={setViewOrder}
          onEdit={(o) => { setEditOrder(o); setEditPaid(String(o.amount_paid)); }}
          onDelete={(o) => setDeleteConfirm(o)}
        />
      </div>

      {viewOrder && (
        <Modal isOpen={!!viewOrder} onClose={() => setViewOrder(null)} title="Order Details" size="lg">
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-gray-500">Order ID:</span> <span className="font-medium">{viewOrder.order_id}</span></div>
              <div className="bg-orange-50 px-2 py-1 rounded border border-orange-100">
                <span className="text-gray-500 text-xs block">Placed On:</span>
                <span className="font-bold text-orange-600">{formatDateTime(viewOrder.created_at)}</span>
              </div>
              <div><span className="text-gray-500">Customer:</span> <span className="font-medium">{viewOrder.customer_name}</span></div>
              <div><span className="text-gray-500">Phone:</span> <span className="font-medium">{viewOrder.customer_phone}</span></div>
              <div><span className="text-gray-500">Delivery:</span> <span className="font-medium">{viewOrder.delivery_type} - {viewOrder.delivery_date}</span></div>
              <div><span className="text-gray-500">Status:</span> <Badge variant={viewOrder.payment_status === 'PAID' ? 'success' : viewOrder.payment_status === 'PARTIAL' ? 'warning' : 'error'}>{viewOrder.payment_status}</Badge></div>
            </div>
            <div className="border-t border-gray-100 pt-3">
              <p className="text-sm font-medium text-gray-700 mb-2">Items</p>
              {viewOrder.items.map(item => (
                <div key={item.id} className="flex justify-between text-sm py-1">
                  <span>{item.item_name} ({item.pricing_type === 'kg' ? `${item.quantity_grams}g` : `${item.quantity_pieces}pc`})</span>
                  <span className="font-medium">{formatPrice(item.item_total)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 pt-3 space-y-1 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(viewOrder.subtotal)}</span></div>
              {parseFloat(viewOrder.discount_amount) > 0 && <div className="flex justify-between text-emerald-600"><span>Discount</span><span>-{formatPrice(viewOrder.discount_amount)}</span></div>}
              <div className="flex justify-between"><span>Delivery</span><span>{formatPrice(viewOrder.delivery_charge)}</span></div>
              <div className="flex justify-between font-bold text-base border-t border-gray-100 pt-2"><span>Total</span><span className="text-orange-600">{formatPrice(viewOrder.total_amount)}</span></div>
              <div className="flex justify-between"><span className="text-emerald-600">Paid</span><span className="text-emerald-600">{formatPrice(viewOrder.amount_paid)}</span></div>
              <div className="flex justify-between"><span className="text-orange-600">Balance</span><span className="text-orange-600">{formatPrice(viewOrder.remaining_amount)}</span></div>
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
              <input
                type="number"
                value={editPaid}
                onChange={(e) => setEditPaid(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm"
                min="0"
                max={editOrder.total}
              />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setEditOrder(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700">Cancel</button>
              <button onClick={handleEditSave} className="flex-1 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-semibold hover:bg-orange-600 btn-press">Save</button>
            </div>
          </div>
        </Modal>
      )}

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => handleDelete(deleteConfirm)}
        title="Delete Order"
        message={`Are you sure you want to delete order ${deleteConfirm?.orderId}? This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}
