import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { formatPrice, formatWeight } from '../../utils/pricing';

export default function OrderSummary() {
  const [expanded, setExpanded] = useState(true);
  const { cartItems, getSubtotal, getDiscount, getDeliveryCharge, getTotal, appliedCoupon } = useCart();

  return (
    <div className="space-y-2">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full"
      >
        <h3 className="text-base font-semibold text-gray-900">Order Summary</h3>
        {expanded ? <ChevronUp size={18} className="text-gray-500" /> : <ChevronDown size={18} className="text-gray-500" />}
      </button>

      {expanded && (
        <div className="bg-gray-50 rounded-2xl p-4 space-y-2 animate-fadeIn">
          {cartItems.map(item => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-gray-600">
                {item.name} ({item.pricingType === 'kg' ? formatWeight(item.grams) : `${item.quantity}pc`})
              </span>
              <span className="font-medium text-gray-900">{formatPrice(item.subtotal)}</span>
            </div>
          ))}
          <div className="border-t border-gray-200 pt-2 mt-2 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">{formatPrice(getSubtotal())}</span>
            </div>
            {appliedCoupon && (
              <div className="flex justify-between text-sm">
                <span className="text-emerald-600">Discount</span>
                <span className="font-medium text-emerald-600">-{formatPrice(getDiscount())}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Delivery</span>
              <span className={`font-medium ${getDeliveryCharge() === 0 ? 'text-emerald-600' : ''}`}>
                {getDeliveryCharge() === 0 ? 'FREE' : formatPrice(getDeliveryCharge())}
              </span>
            </div>
            <div className="flex justify-between font-semibold pt-1 border-t border-gray-200">
              <span>Total</span>
              <span className="text-orange-600">{formatPrice(getTotal())}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
