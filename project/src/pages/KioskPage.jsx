import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import Header from '../components/kiosk/Header';
import CategoryTabs from '../components/kiosk/CategoryTabs';
import SearchBar from '../components/kiosk/SearchBar';
import ItemGrid from '../components/kiosk/ItemGrid';
import CartButton from '../components/kiosk/CartButton';
import CartPanel from '../components/cart/CartPanel';
import QuantityModal from '../components/kiosk/QuantityModal';

export default function KioskPage() {
  const { items, categories } = useApp();
  const { addToCart, updateCartItem, cartItems } = useCart();
  const { addToast } = useToast();

  const [activeCategory, setActiveCategory] = useState('all');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [cartOpen, setCartOpen] = useState(false);
  const [quantityModal, setQuantityModal] = useState(null);
  const [loading, setLoading] = useState(true);
  const debounceRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 200);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchQuery]);

  const filteredItems = useMemo(() => {
    let result = items?.filter(i => i.active) || [];
    if (activeCategory !== 'all') {
      result = result.filter(i => i.categoryId === activeCategory);
    }
    if (debouncedQuery.trim().length >= 2) {
      const q = debouncedQuery.toLowerCase();
      const scored = result.map(item => {
        const cat = categories.find(c => c.id === item.categoryId);
        let score = 0;
        if (item.name.toLowerCase().startsWith(q)) score += 100;
        else if (item.name.toLowerCase().includes(q)) score += 50;
        if (item.description && item.description.toLowerCase().includes(q)) score += 25;
        if (cat && cat.name.toLowerCase().includes(q)) score += 10;
        return { item, score };
      }).filter(s => s.score > 0);
      return scored.sort((a, b) => b.score - a.score).map(s => s.item);
    }
    return result;
  }, [items, activeCategory, debouncedQuery, categories]);

  const handleAddItem = useCallback((item, qtyOrAction) => {
    if (typeof qtyOrAction === 'string' && (qtyOrAction === 'increment' || qtyOrAction === 'decrement')) {
      const existing = cartItems.find(ci => ci.itemId === item.id);
      if (existing) {
        if (qtyOrAction === 'increment') {
          if (item.pricingType === 'piece') {
            updateCartItem(existing.id, existing.quantity + 1, 0, item);
          } else {
            setQuantityModal(item);
          }
        } else {
          if (item.pricingType === 'piece' && existing.quantity <= 1) {
            return;
          }
          if (item.pricingType === 'piece') {
            updateCartItem(existing.id, existing.quantity - 1, 0, item);
          } else {
            setQuantityModal(item);
          }
        }
      }
      return;
    }

    if (item.pricingType === 'kg') {
      setQuantityModal(item);
    } else {
      setQuantityModal(item);
    }
  }, [cartItems, updateCartItem]);

  const handleQuantityAdd = useCallback((item, qtyOrGrams) => {
    if (item.pricingType === 'kg') {
      addToCart(item, 1, qtyOrGrams);
    } else {
      addToCart(item, qtyOrGrams, 0);
    }
    addToast(`${item.name} added to cart`, 'success');
  }, [addToCart, addToast]);

  const handleEditCartItem = useCallback((cartItem) => {
    const item = items.find(i => i.id === cartItem.itemId);
    if (item) setQuantityModal(item);
  }, [items]);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <Header
        onCartClick={() => setCartOpen(true)}
        onSearchToggle={() => { setSearchOpen(!searchOpen); if (searchOpen) setSearchQuery(''); }}
        searchOpen={searchOpen}
      />
      <SearchBar
        isOpen={searchOpen}
        onClose={() => { setSearchOpen(false); setSearchQuery(''); }}
        value={searchQuery}
        onChange={setSearchQuery}
      />
      {debouncedQuery && (
        <div className="px-4 py-2 text-sm text-gray-500 bg-white">
          {filteredItems.length} result{filteredItems.length !== 1 ? 's' : ''} for '{debouncedQuery}'
        </div>
      )}
      <CategoryTabs
        categories={categories || []}
        activeCategory={activeCategory}
        onSelect={setActiveCategory}
      />
      <ItemGrid
        items={filteredItems}
        onAdd={handleAddItem}
        loading={loading}
        searchQuery={debouncedQuery}
      />
      <CartButton onClick={() => setCartOpen(true)} />
      <CartPanel
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        onEditItem={handleEditCartItem}
      />
      <QuantityModal
        item={quantityModal}
        isOpen={!!quantityModal}
        onClose={() => setQuantityModal(null)}
        onAdd={handleQuantityAdd}
        isMobile={window.innerWidth < 768}
      />

      <footer className="mt-8 py-8 border-t border-gray-100 text-center">
        <p className="text-sm text-gray-500">
          © 2026 Mahalaxmi Sweets & Farsan. All Rights Reserved.
        </p>
      </footer>
    </div>
  );
}
