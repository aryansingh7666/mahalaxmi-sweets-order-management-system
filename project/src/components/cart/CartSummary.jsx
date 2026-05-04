import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../utils/pricing';

export default function CartSummary() {
  const { getSubtotal, getDiscount, getDeliveryCharge, getTotal, appliedCoupon } = useCart();

  return (
    <div className="bg-gray-50 rounded-xl p-4 space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">Subtotal</span>
        <span className="font-medium text-gray-900">{formatPrice(getSubtotal())}</span>
      </div>
      {appliedCoupon && (
        <div className="flex justify-between text-sm">
          <span className="text-emerald-600">Discount</span>
          <span className="font-medium text-emerald-600">-{formatPrice(getDiscount())}</span>
        </div>
      )}
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">Delivery</span>
        <span className={`font-medium ${getDeliveryCharge() === 0 ? 'text-emerald-600' : 'text-gray-900'}`}>
          {getDeliveryCharge() === 0 ? 'FREE' : formatPrice(getDeliveryCharge())}
        </span>
      </div>
      <div className="border-t border-gray-200 pt-2 mt-2">
        <div className="flex justify-between">
          <span className="font-semibold text-gray-900">Total</span>
          <span className="text-xl font-bold text-orange-600">{formatPrice(getTotal())}</span>
        </div>
      </div>
    </div>
  );
}
