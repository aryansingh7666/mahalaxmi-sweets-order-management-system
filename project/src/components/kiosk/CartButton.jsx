import { ShoppingCart } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../utils/pricing';

export default function CartButton({ onClick }) {
  const { getItemCount, getTotal } = useCart();
  const count = getItemCount();
  const total = getTotal();

  if (count === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 p-4 bg-gradient-to-t from-white via-white to-transparent pt-8">
      <button
        onClick={onClick}
        className="w-full max-w-7xl mx-auto flex items-center justify-between bg-orange-500 text-white px-6 py-4 rounded-2xl shadow-lg hover:bg-orange-600 transition-all duration-200 btn-press"
      >
        <div className="flex items-center gap-3">
          <ShoppingCart size={22} />
          <span className="font-semibold">View Cart</span>
          <span className="bg-white/20 px-2 py-0.5 rounded-full text-sm font-bold">{count}</span>
        </div>
        <span className="font-bold text-lg">{formatPrice(total)}</span>
      </button>
    </div>
  );
}
