import { formatPrice } from '../../utils/pricing';
import { formatDateTime, timeAgo } from '../../utils/orderUtils';

export default function CustomerTable({ customers, onView }) {
  return (
    <>
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-3 px-3 font-medium text-gray-500">#</th>
              <th className="text-left py-3 px-3 font-medium text-gray-500">Name</th>
              <th className="text-left py-3 px-3 font-medium text-gray-500">Phone</th>
              <th className="text-left py-3 px-3 font-medium text-gray-500">Address</th>
              <th className="text-right py-3 px-3 font-medium text-gray-500">Orders</th>
              <th className="text-right py-3 px-3 font-medium text-gray-500">Total Spent</th>
              <th className="text-right py-3 px-3 font-medium text-gray-500">Balance</th>
              <th className="text-left py-3 px-3 font-medium text-gray-500">Last Order</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c, i) => (
              <tr
                key={c.id}
                onClick={() => onView(c)}
                className="border-b border-gray-50 hover:bg-gray-50 transition-all cursor-pointer"
              >
                <td className="py-3 px-3 text-gray-500">{i + 1}</td>
                <td className="py-3 px-3 font-medium text-gray-900">{c.name}</td>
                <td className="py-3 px-3 text-gray-600">{c.phone}</td>
                <td className="py-3 px-3 text-gray-500 text-xs max-w-[150px] truncate">{c.address || '-'}</td>
                <td className="py-3 px-3 text-right font-medium">{c.orderCount}</td>
                <td className="py-3 px-3 text-right font-medium">{formatPrice(c.totalSpent)}</td>
                <td className="py-3 px-3 text-right font-medium text-orange-600">{formatPrice(c.balance)}</td>
                <td className="py-3 px-3 text-gray-500 text-xs">{c.lastOrderDate ? formatDateTime(c.lastOrderDate) : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="md:hidden space-y-3">
        {customers.map(c => (
          <div
            key={c.id}
            onClick={() => onView(c)}
            className="bg-gray-50 rounded-xl p-4 cursor-pointer hover:bg-gray-100 transition-all"
          >
            <div className="flex items-center justify-between mb-1">
              <p className="font-semibold text-gray-900 text-sm">{c.name}</p>
              {c.balance > 0 && (
                <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                  Due: {formatPrice(c.balance)}
                </span>
              )}
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{c.phone}</span>
              <span>{c.orderCount} order{c.orderCount !== 1 ? 's' : ''} | {formatPrice(c.totalSpent)}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
