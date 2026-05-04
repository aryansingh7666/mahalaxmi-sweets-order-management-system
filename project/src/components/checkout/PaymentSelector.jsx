import { CreditCard, Zap } from 'lucide-react';

export default function PaymentSelector({ paymentMode, onChange }) {
  return (
    <div className="space-y-3">
      <h3 className="text-base font-semibold text-gray-900">Payment Mode</h3>
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => onChange('full')}
          className={`p-4 rounded-2xl border-2 transition-all duration-200 btn-press ${
            paymentMode === 'full'
              ? 'border-orange-500 bg-orange-50'
              : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
        >
          <CreditCard size={24} className={paymentMode === 'full' ? 'text-orange-500' : 'text-gray-400'} />
          <p className={`font-semibold mt-2 ${paymentMode === 'full' ? 'text-orange-600' : 'text-gray-700'}`}>
            Full Payment
          </p>
          <p className="text-xs text-gray-500 mt-0.5">Pay complete amount</p>
        </button>
        <button
          onClick={() => onChange('partial')}
          className={`p-4 rounded-2xl border-2 transition-all duration-200 btn-press ${
            paymentMode === 'partial'
              ? 'border-orange-500 bg-orange-50'
              : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
        >
          <Zap size={24} className={paymentMode === 'partial' ? 'text-orange-500' : 'text-gray-400'} />
          <p className={`font-semibold mt-2 ${paymentMode === 'partial' ? 'text-orange-600' : 'text-gray-700'}`}>
            Partial Payment
          </p>
          <p className="text-xs text-gray-500 mt-0.5">Pay part now, rest later</p>
        </button>
      </div>
    </div>
  );
}
