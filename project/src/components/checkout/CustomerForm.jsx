import { Check } from 'lucide-react';

export default function CustomerForm({ data, onChange, errors, deliveryType }) {
  const handleChange = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-base font-semibold text-gray-900">Customer Information</h3>
      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">Name *</label>
        <input
          type="text"
          value={data.name}
          onChange={(e) => handleChange('name', e.target.value)}
          className={`w-full px-4 py-3 rounded-xl border ${errors.name ? 'border-red-300 bg-red-50' : 'border-gray-200'} text-sm`}
          placeholder="Enter your name"
        />
        {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">Phone *</label>
        <div className="relative">
          <input
            type="tel"
            value={data.phone}
            onChange={(e) => handleChange('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
            className={`w-full px-4 py-3 rounded-xl border ${errors.phone ? 'border-red-300 bg-red-50' : 'border-gray-200'} text-sm pr-10`}
            placeholder="10-digit phone number"
          />
          {data.phone.length === 10 && (
            <Check size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500" />
          )}
        </div>
        {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
      </div>
      {deliveryType === 'delivery' && (
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Address *</label>
          <textarea
            value={data.address}
            onChange={(e) => handleChange('address', e.target.value)}
            className={`w-full px-4 py-3 rounded-xl border ${errors.address ? 'border-red-300 bg-red-50' : 'border-gray-200'} text-sm resize-none`}
            rows={2}
            placeholder="Delivery address"
          />
          {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
        </div>
      )}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">Delivery Date *</label>
        <input
          type="date"
          value={data.deliveryDate}
          onChange={(e) => handleChange('deliveryDate', e.target.value)}
          min={new Date().toISOString().split('T')[0]}
          className={`w-full px-4 py-3 rounded-xl border ${errors.deliveryDate ? 'border-red-300 bg-red-50' : 'border-gray-200'} text-sm`}
        />
        {errors.deliveryDate && <p className="text-xs text-red-500 mt-1">{errors.deliveryDate}</p>}
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">Order Notes</label>
        <textarea
          value={data.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm resize-none"
          rows={2}
          placeholder="Any special instructions?"
        />
      </div>
    </div>
  );
}
