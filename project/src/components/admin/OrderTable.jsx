import { Eye, CreditCard as Edit3, Trash2 } from 'lucide-react';
import Badge from '../shared/Badge';
import { formatPrice } from '../../utils/pricing';
import { formatDateTime, timeAgo } from '../../utils/orderUtils';

export default function OrderTable({ orders, onView, onEdit, onDelete }) {
  const statusVariant = {
    PAID: 'success',
    PARTIAL: 'warning',
    PENDING: 'error',
  };

  return (
    <>
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-3 px-3 font-medium text-gray-500">#</th>
              <th className="text-left py-3 px-3 font-medium text-gray-500">Order ID</th>
              <th className="text-left py-3 px-3 font-medium text-gray-500">Customer</th>
              <th className="text-left py-3 px-3 font-medium text-gray-500">Items</th>
              <th className="text-right py-3 px-3 font-medium text-gray-500">Total</th>
              <th className="text-right py-3 px-3 font-medium text-gray-500">Paid</th>
              <th className="text-right py-3 px-3 font-medium text-gray-500">Balance</th>
              <th className="text-center py-3 px-3 font-medium text-gray-500">Status</th>
              <th className="text-left py-3 px-3 font-medium text-gray-500">Date</th>
              <th className="text-center py-3 px-3 font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order, i) => (
              <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50 transition-all">
                <td className="py-3 px-3 text-gray-500">{i + 1}</td>
                <td className="py-3 px-3 font-medium text-gray-900">{order.order_id}</td>
                <td className="py-3 px-3">
                  <p className="font-medium text-gray-900">{order.customer_name || order.customer?.name}</p>
                  <p className="text-xs text-gray-500">{order.customer_phone || order.customer?.phone}</p>
                </td>
                <td className="py-3 px-3 text-gray-600 text-xs">
                  {order.items?.slice(0, 2).map(it => it.item_name || it.name).join(', ')}
                  {order.items?.length > 2 && ` +${order.items.length - 2}`}
                </td>
                <td className="py-3 px-3 text-right font-medium">{formatPrice(order.total_amount)}</td>
                <td className="py-3 px-3 text-right text-emerald-600">{formatPrice(order.amount_paid)}</td>
                <td className="py-3 px-3 text-right text-orange-600">{formatPrice(order.remaining_amount)}</td>
                <td className="py-3 px-3 text-center">
                  <Badge variant={statusVariant[order.payment_status]}>{order.payment_status}</Badge>
                </td>
                <td className="py-3 px-3 text-gray-500 text-xs">{formatDateTime(order.created_at)}</td>
                <td className="py-3 px-3">
                  <div className="flex items-center justify-center gap-1">
                    <button onClick={() => onView(order)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-blue-500 transition-all">
                      <Eye size={15} />
                    </button>
                    <button onClick={() => onEdit(order)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-orange-500 transition-all">
                      <Edit3 size={15} />
                    </button>
                    <button onClick={() => onDelete(order)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-red-500 transition-all">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="md:hidden space-y-3">
        {orders.map(order => (
          <div
            key={order.id}
            onClick={() => onView(order)}
            className="bg-gray-50 rounded-xl p-4 cursor-pointer hover:bg-gray-100 transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="font-semibold text-gray-900 text-sm">#{String(order.serial_number).padStart(3, '0')}</p>
                <p className="text-xs text-gray-500">{order.order_id}</p>
              </div>
              <Badge variant={statusVariant[order.payment_status]}>{order.payment_status}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">{order.customer_name || order.customer?.name}</p>
                <p className="text-xs text-gray-500">{order.items?.slice(0, 2).map(it => it.item_name || it.name).join(', ')}{order.items?.length > 2 ? ` +${order.items.length - 2}` : ''}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900 text-sm">{formatPrice(order.total_amount)}</p>
                <p className="text-xs text-gray-400">{timeAgo(order.created_at)}</p>
              </div>
            </div>
            {parseFloat(order.remaining_amount) > 0 && (
              <div className="mt-2 text-xs text-orange-600 font-medium">
                Balance: {formatPrice(order.remaining_amount)}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
