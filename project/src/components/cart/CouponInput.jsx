import { useState } from 'react';
import { Tag, X, Check } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../utils/pricing';

export default function CouponInput() {
  const { appliedCoupon, applyCoupon, removeCoupon, couponError, getDiscount } = useCart();
  const [code, setCode] = useState('');

  const handleApply = () => {
    if (code.trim()) {
      applyCoupon(code.trim());
      setCode('');
    }
  };

  if (appliedCoupon) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Tag size={16} className="text-emerald-600" />
          <div>
            <p className="text-sm font-semibold text-emerald-700">{appliedCoupon.code} applied!</p>
            <p className="text-xs text-emerald-600">You saved {formatPrice(getDiscount())}</p>
          </div>
        </div>
        <button onClick={removeCoupon} className="p-1 rounded-lg hover:bg-emerald-100 text-emerald-500 transition-all">
          <X size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Enter coupon code"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm"
          />
        </div>
        <button
          onClick={handleApply}
          disabled={!code.trim()}
          className="px-4 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-medium hover:bg-orange-600 transition-all disabled:opacity-50 btn-press"
        >
          Apply
        </button>
      </div>
      {couponError && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <X size={12} /> {couponError}
        </p>
      )}
    </div>
  );
}
