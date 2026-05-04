import { useState, useEffect } from 'react';
import { Minus, Plus, X } from 'lucide-react';
import { formatPrice, formatWeight, calculateKgPrice, priceToGrams, gramsToKg, kgToGrams } from '../../utils/pricing';
import { useApp } from '../../context/AppContext';
import BottomSheet from '../shared/BottomSheet';
import Modal from '../shared/Modal';

export default function QuantityModal({ item, isOpen, onClose, onAdd, isMobile }) {
  const { categories } = useApp();
  const category = categories.find(c => c.id === item?.categoryId);

  const [unitMode, setUnitMode] = useState('grams');
  const [grams, setGrams] = useState(100);
  const [kg, setKg] = useState(0.1);
  const [price, setPrice] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!item) return;
    if (item.pricingType === 'kg') {
      const g = 100;
      const k = gramsToKg(g);
      const p = calculateKgPrice(g, item.price);
      setGrams(g);
      setKg(parseFloat(k.toFixed(3)));
      setPrice(parseFloat(p.toFixed(2)));
    } else {
      setQuantity(1);
    }
  }, [item]);

  const updateFromGrams = (g) => {
    if (!item) return;
    g = Math.max(0, g);
    setGrams(g);
    setKg(parseFloat(gramsToKg(g).toFixed(3)));
    setPrice(parseFloat(calculateKgPrice(g, item.price).toFixed(2)));
  };

  const updateFromKg = (k) => {
    if (!item) return;
    k = Math.max(0, k);
    setKg(k);
    const g = kgToGrams(k);
    setGrams(Math.round(g));
    setPrice(parseFloat(calculateKgPrice(g, item.price).toFixed(2)));
  };

  const updateFromPrice = (p) => {
    if (!item) return;
    p = Math.max(0, p);
    setPrice(p);
    const g = priceToGrams(p, item.price);
    setGrams(Math.round(g));
    setKg(parseFloat(gramsToKg(g).toFixed(3)));
  };

  const setQuickWeight = (g) => {
    updateFromGrams(g);
  };

  const setQuickQuantity = (q) => {
    setQuantity(q);
  };

  const handleAdd = () => {
    if (item.pricingType === 'kg') {
      if (grams < 100) return;
      onAdd(item, grams);
    } else {
      if (quantity < 1) return;
      onAdd(item, quantity);
    }
    onClose();
  };

  if (!item) return null;

  const Wrapper = isMobile ? BottomSheet : Modal;
  const wrapperProps = isMobile
    ? { isOpen, onClose, title: item.name }
    : { isOpen, onClose, title: item.name, size: 'md' };

  return (
    <Wrapper {...wrapperProps}>
      <div className="space-y-5">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl"
            style={{ background: `linear-gradient(135deg, ${category?.color || '#FFF7ED'}40, ${category?.color || '#FFF7ED'}80)` }}
          >
            {category?.icon || '🍽️'}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{item.name}</h3>
            <p className="text-sm text-gray-500">{formatPrice(item.price)} / {item.pricingType === 'kg' ? 'kg' : 'piece'}</p>
          </div>
        </div>

        {item.pricingType === 'kg' ? (
          <>
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => setUnitMode('grams')}
                className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${unitMode === 'grams' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600'}`}
              >
                Grams
              </button>
              <button
                onClick={() => setUnitMode('kg')}
                className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${unitMode === 'kg' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600'}`}
              >
                Kg
              </button>
            </div>

            <div className="space-y-3">
              {(unitMode === 'grams' || unitMode === 'kg') && (
                <div>
                  <label className="text-xs text-gray-500 font-medium mb-1 block">
                    Weight in {unitMode === 'grams' ? 'Grams' : 'Kg'}
                  </label>
                  <input
                    type="number"
                    value={unitMode === 'grams' ? grams : kg}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      if (unitMode === 'grams') updateFromGrams(val);
                      else updateFromKg(val);
                    }}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-lg font-semibold"
                    min="0"
                    step={unitMode === 'grams' ? 10 : 0.01}
                  />
                </div>
              )}
              <div>
                <label className="text-xs text-gray-500 font-medium mb-1 block">Price (₹)</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => updateFromPrice(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-lg font-semibold"
                  min="0"
                  step="1"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {[100, 250, 500, 1000, 2000].map(g => (
                <button
                  key={g}
                  onClick={() => setQuickWeight(g)}
                  className="px-3 py-2 rounded-xl bg-gray-100 text-sm font-medium text-gray-700 hover:bg-orange-100 hover:text-orange-600 transition-all btn-press"
                >
                  {g >= 1000 ? `${g / 1000}kg` : `${g}g`}
                </button>
              ))}
            </div>

            <div className="bg-orange-50 rounded-xl p-3 text-center">
              <p className="text-sm text-orange-700 font-medium">
                {formatWeight(grams)} of {item.name} = <span className="font-bold">{formatPrice(price)}</span>
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-all btn-press"
              >
                <Minus size={20} className="text-gray-600" />
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-20 text-center text-2xl font-bold border border-gray-200 rounded-xl py-2"
                min="1"
              />
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-all btn-press"
              >
                <Plus size={20} className="text-gray-600" />
              </button>
            </div>

            <div className="flex flex-wrap gap-2 justify-center">
              {[1, 5, 10, 25, 50, 100].map(q => (
                <button
                  key={q}
                  onClick={() => setQuickQuantity(q)}
                  className="px-4 py-2 rounded-xl bg-gray-100 text-sm font-medium text-gray-700 hover:bg-orange-100 hover:text-orange-600 transition-all btn-press"
                >
                  {q}
                </button>
              ))}
            </div>

            <div className="bg-orange-50 rounded-xl p-3 text-center">
              <p className="text-sm text-orange-700 font-medium">
                {quantity} {item.name} = <span className="font-bold">{formatPrice(quantity * item.price)}</span>
              </p>
            </div>
          </>
        )}

        <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4">
          <span className="text-gray-600 font-medium">Total</span>
          <span className="text-2xl font-bold text-orange-600">
            {formatPrice(item.pricingType === 'kg' ? price : quantity * item.price)}
          </span>
        </div>

        <button
          onClick={handleAdd}
          disabled={item.pricingType === 'kg' ? grams < 100 : quantity < 1}
          className="w-full py-4 bg-orange-500 text-white rounded-xl font-semibold text-lg hover:bg-orange-600 transition-all duration-200 btn-press disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Add to Cart
        </button>
      </div>
    </Wrapper>
  );
}
