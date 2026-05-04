import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { formatPrice } from '../../utils/pricing';
import { formatDateTime, openWhatsApp } from '../../utils/orderUtils';
import { exportCustomersToExcel } from '../../utils/exportUtils';
import CustomerTable from '../../components/admin/CustomerTable';
import Modal from '../../components/shared/Modal';
import { Search, Download, MessageCircle } from 'lucide-react';

export default function CustomersPage() {
  const { customers, orders, settings } = useApp();
  const { addToast } = useToast();
  const [search, setSearch] = useState('');
  const [viewCustomer, setViewCustomer] = useState(null);

  const filteredCustomers = useMemo(() => {
    if (!search) return customers || [];
    const q = search.toLowerCase();
    return (customers || []).filter(c =>
      c.name.toLowerCase().includes(q) || c.phone.includes(q)
    );
  }, [customers, search]);

  const customerOrders = useMemo(() => {
    if (!viewCustomer) return [];
    return (orders || []).filter(o => o.customer.phone === viewCustomer.phone);
  }, [viewCustomer, orders]);

  const handleExport = () => {
    exportCustomersToExcel(customers || []);
    addToast('Customers exported', 'success');
  };

  const handleWhatsApp = (customer) => {
    const message = `Dear ${customer.name},\nThank you for being a valued customer!\nTotal Orders: ${customer.orderCount}\nTotal Spent: ${formatPrice(customer.totalSpent)}\nOutstanding Balance: ${formatPrice(customer.balance)}\n— ${settings.shopName}`;
    openWhatsApp(customer.phone, message);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
        <button
          onClick={handleExport}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm font-medium hover:bg-emerald-600 btn-press"
        >
          <Download size={16} /> Export Excel
        </button>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm"
          placeholder="Search by name or phone..."
        />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <CustomerTable customers={filteredCustomers} onView={setViewCustomer} />
        {filteredCustomers.length === 0 && (
          <p className="text-center text-gray-500 py-8">No customers found</p>
        )}
      </div>

      {viewCustomer && (
        <Modal isOpen={!!viewCustomer} onClose={() => setViewCustomer(null)} title="Customer Details" size="lg">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-gray-500">Name:</span> <span className="font-medium">{viewCustomer.name}</span></div>
              <div><span className="text-gray-500">Phone:</span> <span className="font-medium">{viewCustomer.phone}</span></div>
              <div className="col-span-2"><span className="text-gray-500">Address:</span> <span className="font-medium">{viewCustomer.address || '-'}</span></div>
              <div><span className="text-gray-500">Orders:</span> <span className="font-medium">{viewCustomer.orderCount}</span></div>
              <div><span className="text-gray-500">Total Spent:</span> <span className="font-medium">{formatPrice(viewCustomer.totalSpent)}</span></div>
              <div><span className="text-gray-500">Balance:</span> <span className="font-bold text-orange-600">{formatPrice(viewCustomer.balance)}</span></div>
              <div><span className="text-gray-500">Last Order:</span> <span className="font-medium">{viewCustomer.lastOrderDate ? formatDateTime(viewCustomer.lastOrderDate) : '-'}</span></div>
            </div>

            <div className="border-t border-gray-100 pt-3">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Order History</h4>
              {customerOrders.length === 0 ? (
                <p className="text-sm text-gray-500">No orders found</p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {customerOrders.map(o => (
                    <div key={o.id} className="flex items-center justify-between bg-gray-50 rounded-xl p-3 text-sm">
                      <div>
                        <p className="font-medium text-gray-900">{o.orderId}</p>
                        <p className="text-xs text-gray-500">{formatDateTime(o.createdAt)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatPrice(o.total)}</p>
                        <span className={`text-xs font-medium ${o.paymentStatus === 'PAID' ? 'text-emerald-600' : o.paymentStatus === 'PARTIAL' ? 'text-amber-600' : 'text-red-600'}`}>
                          {o.paymentStatus}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => handleWhatsApp(viewCustomer)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-500 text-white rounded-xl text-sm font-semibold btn-press"
              >
                <MessageCircle size={16} /> WhatsApp
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
