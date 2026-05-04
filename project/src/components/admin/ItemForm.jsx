import { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { ImagePlus, Link, Star } from 'lucide-react';

export default function ItemForm({ item, onSave, onCancel }) {
  const { categories } = useApp();
  const [form, setForm] = useState({
    name: '',
    description: '',
    categoryId: (categories && categories.length > 0) ? categories[0].id : '',
    price: '',
    pricingType: 'kg',
    active: true,
    image: '',
    isBestseller: false,
  });
  const [imageMode, setImageMode] = useState('url');
  const fileRef = useRef(null);

  useEffect(() => {
    if (item) {
      setForm({
        name: item.name,
        description: item.description || '',
        categoryId: item.categoryId,
        price: String(item.price),
        pricingType: item.pricingType,
        active: item.active,
        image: item.image || '',
        isBestseller: item.isBestseller || false,
      });
    }
  }, [item]);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxW = 400;
        const scale = maxW / img.width;
        canvas.width = maxW;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const compressed = canvas.toDataURL('image/jpeg', 0.6);
        setForm(f => ({ ...f, image: compressed }));
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    if (!form.name || !form.price || !form.categoryId) return;
    onSave({
      ...form,
      price: parseFloat(form.price),
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">Name *</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
          placeholder="Item name"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">Description</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm resize-none"
          rows={2}
          placeholder="Optional description"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Category *</label>
          <select
            value={form.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
          >
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Pricing Type *</label>
          <select
            value={form.pricingType}
            onChange={(e) => setForm({ ...form, pricingType: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
          >
            <option value="kg">Per Kg</option>
            <option value="piece">Per Piece</option>
          </select>
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">Price (₹) *</label>
        <input
          type="number"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
          placeholder="Price"
          min="0"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">Item Image</label>
        <div className="flex gap-2 mb-2">
          <button
            onClick={() => setImageMode('url')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${imageMode === 'url' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500'}`}
          >
            <Link size={12} /> URL
          </button>
          <button
            onClick={() => setImageMode('file')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${imageMode === 'file' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500'}`}
          >
            <ImagePlus size={12} /> Upload
          </button>
        </div>
        {imageMode === 'url' ? (
          <input
            type="text"
            value={form.image}
            onChange={(e) => setForm({ ...form, image: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
            placeholder="Image URL (https://...)"
          />
        ) : (
          <div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full py-2.5 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-500 hover:border-orange-300 hover:text-orange-500 transition-all"
            >
              Choose Image (max 2MB)
            </button>
          </div>
        )}
        {form.image && (
          <div className="mt-2 relative">
            <img
              src={form.image}
              alt="Preview"
              className="w-20 h-20 rounded-xl object-cover border border-gray-200"
            />
            <button
              onClick={() => setForm({ ...form, image: '' })}
              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center"
            >
              x
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">Bestseller</label>
        <button
          onClick={() => setForm({ ...form, isBestseller: !form.isBestseller })}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
            form.isBestseller ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-400'
          }`}
        >
          <Star size={14} fill={form.isBestseller ? 'currentColor' : 'none'} />
          {form.isBestseller ? 'Bestseller' : 'Mark as Bestseller'}
        </button>
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
        <button
          onClick={onCancel}
          className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={!form.name || !form.price || !form.categoryId}
          className="flex-1 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-semibold hover:bg-orange-600 transition-all disabled:opacity-50 btn-press"
        >
          {item ? 'Update Item' : 'Add Item'}
        </button>
      </div>
    </div>
  );
}
