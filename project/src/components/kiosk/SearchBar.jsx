import { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';

export default function SearchBar({ isOpen, onClose, value, onChange }) {
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="sticky top-[68px] z-30 bg-white border-b border-gray-100 px-4 py-3 animate-fadeIn">
      <div className="flex items-center gap-2 max-w-7xl mx-auto">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Search sweets, farsan... (min 2 chars)"
            className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-orange-400 bg-gray-50"
          />
          {value && (
            <button
              onClick={() => onChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          )}
        </div>
        <button onClick={onClose} className="text-sm text-orange-600 font-medium px-2">
          Close
        </button>
      </div>
    </div>
  );
}
