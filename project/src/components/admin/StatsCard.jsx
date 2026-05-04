import { useEffect, useState, useRef } from 'react';

export default function StatsCard({ icon: Icon, label, value, color = 'orange', onClick, prefix = '' }) {
  const [displayValue, setDisplayValue] = useState(typeof value === 'number' ? 0 : value);
  const prevValue = useRef(value);

  const colors = {
    orange: 'from-orange-500 to-orange-600',
    green: 'from-emerald-500 to-emerald-600',
    yellow: 'from-amber-500 to-amber-600',
    red: 'from-red-500 to-red-600',
    blue: 'from-blue-500 to-blue-600',
    gray: 'from-gray-500 to-gray-600',
  };

  useEffect(() => {
    if (typeof value !== 'number') {
      setDisplayValue(value);
      return;
    }
    if (prevValue.current === value) return;
    prevValue.current = value;
    const duration = 600;
    const steps = 30;
    const stepTime = duration / steps;
    const increment = value / steps;
    let current = 0;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      current = Math.min(Math.round(increment * step), value);
      setDisplayValue(current);
      if (step >= steps) {
        clearInterval(timer);
        setDisplayValue(value);
      }
    }, stepTime);
    return () => clearInterval(timer);
  }, [value]);

  const getFontSize = (val) => {
    if (typeof val !== 'number') return 'text-xl md:text-2xl';
    if (val > 99999) return 'text-lg';
    if (val > 9999) return 'text-xl';
    if (val > 999) return 'text-2xl';
    return 'text-3xl';
  };

  const formatValue = (val) => {
    if (typeof val !== 'number') return val;
    return val.toLocaleString('en-IN', {
      minimumFractionDigits: prefix ? 2 : 0,
      maximumFractionDigits: 2
    });
  };

  return (
    <button
      onClick={onClick}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 md:p-4 hover:shadow-md transition-all duration-200 text-left flex flex-col flex-1 min-w-0 overflow-hidden btn-press h-full"
    >
      <div className={`w-9 h-9 md:w-10 md:h-10 rounded-xl bg-gradient-to-br ${colors[color]} flex-shrink-0 flex items-center justify-center mb-2 md:mb-3`}>
        <Icon size={18} className="text-white" />
      </div>
      <div className="w-full min-w-0 flex-1 flex flex-col justify-end">
        <p 
          className={`${getFontSize(value)} font-bold text-gray-900 truncate w-full`}
          title={typeof value === 'number' ? (prefix + formatValue(value)) : value}
        >
          {typeof displayValue === 'number' ? (prefix + formatValue(displayValue)) : displayValue}
        </p>
        <p className="text-xs md:text-sm text-gray-500 mt-0.5 truncate w-full">{label}</p>
      </div>
    </button>
  );
}
