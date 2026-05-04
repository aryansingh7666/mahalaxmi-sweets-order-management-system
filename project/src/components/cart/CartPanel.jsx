import { X, ShoppingBag } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useNavigate } from 'react-router-dom';
import CartItem from './CartItem';
import CouponInput from './CouponInput';
import CartSummary from './CartSummary';
import EmptyState from '../shared/EmptyState';
import { formatPrice } from '../../utils/pricing';

export default function CartPanel({ isOpen, onClose, onEditItem }) {
  const { cartItems, removeFromCart, clearCart, getItemCount, getDiscount } = useCart();
  const navigate = useNavigate();
  const count = getItemCount();
  const discount = getDiscount();

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50 animate-fadeIn" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 z-50 w-full md:w-[400px] bg-white shadow-lg flex flex-col animate-slideRight">
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Your Cart ({count})</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 transition-all">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {discount > 0 && (
          <div className="mx-4 mt-3 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 flex items-center gap-2">
            <span className="text-sm font-medium text-emerald-700">You saved {formatPrice(discount)}!</span>
          </div>
        )}

        {cartItems.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <EmptyState
              icon={ShoppingBag}
              title="Your cart is empty"
              description="Start adding items from the menu"
              action={() => { onClose(); navigate('/kiosk'); }}
              actionLabel="Start Ordering"
            />
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-4 py-3">
              {cartItems.map(item => (
                <CartItem
                  key={item.id}
                  item={item}
                  onRemove={removeFromCart}
                  onEdit={(item) => { onClose(); onEditItem(item); }}
                />
              ))}
            </div>

            <div className="border-t border-gray-100 p-4 space-y-3">
              <CouponInput />
              <CartSummary />
              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all btn-press"
                >
                  Continue Shopping
                </button>
                <button
                  onClick={() => { onClose(); navigate('/checkout'); }}
                  className="flex-1 py-3 bg-orange-500 text-white rounded-xl text-sm font-semibold hover:bg-orange-600 transition-all btn-press"
                >
                  Checkout
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
