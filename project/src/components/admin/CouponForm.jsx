import { useState, useEffect } from 'react';

export default function CouponForm({ coupon, onSave, onCancel }) {
  const [form, setForm] = useState({
    code: '',
    discountType: 'percentage',
    value: '',
    minOrderValue: '0',
    maxUses: '100',
    expiryDate: '',
    active: true,
  });

  useEffect(() => {
    if (coupon) {
      setForm({
        code: coupon.code,
        discountType: coupon.discountType,
        value: String(coupon.value),
        minOrderValue: String(coupon.minOrderValue || 0),
        maxUses: String(coupon.maxUses || 100),
        expiryDate: coupon.expiryDate || '',
        active: coupon.active,
      });
    }
  }, [coupon]);

  const handleSubmit = () => {
    if (!form.code || !form.value) return;
    onSave({
      ...form,
      code: form.code.toUpperCase(),
      value: parseFloat(form.value),
      minOrderValue: parseFloat(form.minOrderValue) || 0,
      maxUses: parseInt(form.maxUses) || 100,
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">Coupon Code *</label>
        <input
          type="text"
          value={form.code}
          onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
          placeholder="e.g. SWEET10"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Discount Type</label>
          <select
            value={form.discountType}
            onChange={(e) => setForm({ ...form, discountType: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
          >
            <option value="percentage">Percentage (%)</option>
            <option value="fixed">Fixed (₹)</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Value *</label>
          <input
            type="number"
            value={form.value}
            onChange={(e) => setForm({ ...form, value: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
            placeholder="Discount value"
            min="0"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Min Order (₹)</label>
          <input
            type="number"
            value={form.minOrderValue}
            onChange={(e) => setForm({ ...form, minOrderValue: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
            min="0"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Max Uses</label>
          <input
            type="number"
            value={form.maxUses}
            onChange={(e) => setForm({ ...form, maxUses: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
            min="1"
          />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">Expiry Date</label>
        <input
          type="date"
          value={form.expiryDate}
          onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
        />
      </div>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">Active</label>
        <button
          onClick={() => setForm({ ...form, active: !form.active })}
          className={`relative w-12 h-7 rounded-full transition-all duration-200 ${form.active ? 'bg-orange-500' : 'bg-gray-200'}`}
        >
          <span className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow-sm transition-all duration-200 ${form.active ? 'translate-x-5' : ''}`} />
        </button>
      </div>
      <div className="flex gap-3 pt-2">
        <button onClick={onCancel} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all">
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={!form.code || !form.value}
          className="flex-1 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-semibold hover:bg-orange-600 transition-all disabled:opacity-50 btn-press"
        >
          {coupon ? 'Update Coupon' : 'Add Coupon'}
        </button>
      </div>
    </div>
  );
}
