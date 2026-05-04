import { ShoppingBag } from 'lucide-react';

export default function EmptyState({ icon: Icon = ShoppingBag, title, description, action, actionLabel }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-20 h-20 rounded-full bg-orange-50 flex items-center justify-center mb-4">
        <Icon size={36} className="text-orange-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
      {description && <p className="text-sm text-gray-500 mb-4 text-center">{description}</p>}
      {action && (
        <button
          onClick={action}
          className="px-6 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-all duration-200 btn-press"
        >
          {actionLabel || 'Get Started'}
        </button>
      )}
    </div>
  );
}
