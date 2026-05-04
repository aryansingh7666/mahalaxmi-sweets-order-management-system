import { Trash2, CreditCard as Edit3 } from 'lucide-react';
import { formatPrice, formatWeight } from '../../utils/pricing';
import { useApp } from '../../context/AppContext';

export default function CartItem({ item, onRemove, onEdit }) {
  const { categories } = useApp();
  const category = categories.find(c => c.id === item.categoryId);

  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-lg"
        style={{ background: `${category?.color || '#FFF7ED'}60` }}
      >
        {category?.icon || '🍽️'}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="font-medium text-gray-900 text-sm">{item.name}</h4>
            <p className="text-xs text-gray-500 mt-0.5">
              {item.pricingType === 'kg'
                ? `${formatWeight(item.grams)} @ ${formatPrice(item.price)}/kg`
                : `${item.quantity} pc @ ${formatPrice(item.price)}/pc`}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => onEdit(item)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all">
              <Edit3 size={14} />
            </button>
            <button onClick={() => onRemove(item.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all">
              <Trash2 size={14} />
            </button>
          </div>
        </div>
        <p className="text-sm font-semibold text-gray-900 mt-1">{formatPrice(item.subtotal)}</p>
      </div>
    </div>
  );
}
