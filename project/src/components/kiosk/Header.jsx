import { ShoppingCart, Search, Store } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useApp } from '../../context/AppContext';

export default function Header({ onCartClick, onSearchToggle, searchOpen }) {
  const { getItemCount, cartShake } = useCart();
  const { settings } = useApp();
  const count = getItemCount();

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
            <Store size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 leading-tight">{settings.shopName || 'Mahalaxmi Sweets'}</h1>
            <p className="text-xs text-gray-500">{settings.tagline || 'Taste the Tradition'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onSearchToggle}
            className={`p-2.5 rounded-xl transition-all duration-200 ${searchOpen ? 'bg-orange-100 text-orange-600' : 'hover:bg-gray-100 text-gray-600'}`}
          >
            <Search size={22} />
          </button>
          <button
            onClick={onCartClick}
            className={`relative p-2.5 rounded-xl hover:bg-gray-100 text-gray-600 transition-all duration-200 ${cartShake ? 'animate-shake' : ''}`}
          >
            <ShoppingCart size={22} />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-bounceIn">
                {count}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
