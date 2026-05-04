import { useRef, useEffect } from 'react';

export default function CategoryTabs({ categories, activeCategory, onSelect }) {
  const scrollRef = useRef(null);

  return (
    <div className="sticky top-[68px] z-30 bg-white border-b border-gray-100">
      <div ref={scrollRef} className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide max-w-7xl mx-auto">
        <button
          onClick={() => onSelect('all')}
          className={`flex-shrink-0 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200 btn-press min-h-[44px] flex items-center ${
            activeCategory === 'all'
              ? 'bg-orange-500 text-white shadow-sm'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            className={`flex-shrink-0 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200 btn-press min-h-[44px] flex items-center gap-1.5 ${
              activeCategory === cat.id
                ? 'bg-orange-500 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span>{cat.icon}</span>
            <span>{cat.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
