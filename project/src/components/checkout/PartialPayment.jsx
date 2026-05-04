import { formatPrice } from '../../utils/pricing';

export default function PartialPayment({ total, paidAmount, paidPercent, inputMode, onAmountChange, onPercentChange, onModeChange }) {
  const balance = total - paidAmount;
  const calculatedPercent = total > 0 ? (paidAmount / total) * 100 : 0;

  return (
    <div className="space-y-4 bg-orange-50 rounded-2xl p-4">
      <p className="text-sm font-medium text-gray-700">Total Amount: <span className="font-bold text-gray-900">{formatPrice(total)}</span></p>

      <div className="flex gap-2">
        <button
          onClick={() => onModeChange('percent')}
          className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${inputMode === 'percent' ? 'bg-orange-500 text-white' : 'bg-white text-gray-600'}`}
        >
          Pay by %
        </button>
        <button
          onClick={() => onModeChange('amount')}
          className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${inputMode === 'amount' ? 'bg-orange-500 text-white' : 'bg-white text-gray-600'}`}
        >
          Pay by ₹
        </button>
      </div>

      {inputMode === 'percent' ? (
        <div className="space-y-2">
          <input
            type="range"
            min="0"
            max="100"
            value={paidPercent}
            onChange={(e) => onPercentChange(parseInt(e.target.value))}
            className="w-full accent-orange-500"
          />
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={paidPercent}
              onChange={(e) => onPercentChange(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
              className="w-20 px-3 py-2 rounded-xl border border-gray-200 text-sm text-center font-semibold"
              min="0"
              max="100"
            />
            <span className="text-sm text-gray-600">%</span>
            <span className="text-sm text-gray-500 ml-auto">= {formatPrice((paidPercent / 100) * total)}</span>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">₹</span>
          <input
            type="number"
            value={paidAmount || ''}
            onChange={(e) => onAmountChange(Math.min(total, Math.max(0, parseFloat(e.target.value) || 0)))}
            className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm font-semibold"
            min="0"
            max={total}
            step="1"
          />
          <span className="text-sm text-gray-500">= {calculatedPercent.toFixed(1)}%</span>
        </div>
      )}

      <div className="flex justify-between text-sm pt-2 border-t border-orange-200">
        <div>
          <span className="text-emerald-600 font-medium">Paid now: </span>
          <span className="font-bold text-emerald-700">{formatPrice(paidAmount)}</span>
        </div>
        <div>
          <span className="text-orange-600 font-medium">Balance due: </span>
          <span className="font-bold text-orange-700">{formatPrice(balance)}</span>
        </div>
      </div>
    </div>
  );
}
