import { Plus, Minus, Star } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useApp } from '../../context/AppContext';
import { formatPrice, formatWeight } from '../../utils/pricing';

export default function ItemCard({ item, onAdd }) {
  const { cartItems } = useCart();
  const { categories } = useApp();
  const category = categories.find(c => c.id === item.categoryId);
  const cartItem = cartItems.find(ci => ci.itemId === item.id);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md hover:scale-[1.02] transition-all duration-200 flex flex-col">
      <div
        className="h-32 flex items-center justify-center relative overflow-hidden"
        style={item.image ? {} : { background: `linear-gradient(135deg, ${category?.color || '#FFF7ED'}40, ${category?.color || '#FFF7ED'}80)` }}
      >
        {item.image ? (
          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-5xl">{category?.icon || '🍽️'}</span>
        )}
        {category && (
          <span className="absolute top-2 left-2 text-xs px-2 py-0.5 rounded-full bg-white/80 text-gray-600 font-medium backdrop-blur-sm">
            {category.name}
          </span>
        )}
        {item.isBestseller && (
          <span className="absolute top-2 right-2 flex items-center gap-0.5 text-xs px-2 py-0.5 rounded-full bg-amber-500 text-white font-bold backdrop-blur-sm">
            <Star size={10} fill="currentColor" /> Best
          </span>
        )}
        {!item.active && (
          <div className="absolute inset-0 bg-gray-900/60 flex items-center justify-center">
            <span className="text-white font-bold text-sm">Out of Stock</span>
          </div>
        )}
      </div>
      <div className="p-3 flex flex-col flex-1">
        <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 mb-1">{item.name}</h3>
        {item.description && (
          <p className="text-xs text-gray-500 line-clamp-1 mb-2">{item.description}</p>
        )}
        <div className="mt-auto">
          <p className="text-orange-600 font-bold text-base mb-2">
            {formatPrice(item.price)} / {item.pricingType === 'kg' ? 'kg' : 'piece'}
          </p>
          {cartItem ? (
            <div className="flex items-center justify-between bg-orange-50 rounded-xl px-2 py-1.5">
              <button
                onClick={(e) => { e.stopPropagation(); onAdd(item, 'decrement'); }}
                className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-orange-600 hover:bg-orange-100 transition-all"
              >
                <Minus size={14} />
              </button>
              <span className="text-sm font-bold text-orange-600">
                {item.pricingType === 'kg' ? formatWeight(cartItem.grams) : cartItem.quantity}
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); onAdd(item, 'increment'); }}
                className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-orange-600 hover:bg-orange-100 transition-all"
              >
                <Plus size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => onAdd(item)}
              disabled={!item.active}
              className="w-full py-2.5 bg-orange-500 text-white rounded-xl text-sm font-semibold hover:bg-orange-600 transition-all duration-200 btn-press flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus size={16} />
              Add
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
