import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { useApp } from './AppContext';
import { calculateDiscount } from '../utils/orderUtils';

const CartContext = createContext();

export function CartProvider({ children }) {
  const { coupons, settings, incrementCouponUse } = useApp();
  const [cartItems, setCartItems] = useState([]);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [cartShake, setCartShake] = useState(false);
  const shakeTimeout = useRef(null);

  const triggerCartShake = useCallback(() => {
    setCartShake(true);
    if (shakeTimeout.current) clearTimeout(shakeTimeout.current);
    shakeTimeout.current = setTimeout(() => setCartShake(false), 500);
  }, []);

  const addToCart = useCallback((item, quantity, grams) => {
    triggerCartShake();
    setCartItems(prev => {
      const existing = prev.findIndex(ci => ci.itemId === item.id);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = {
          ...updated[existing],
          quantity: item.pricingType === 'piece' ? updated[existing].quantity + quantity : quantity,
          grams: item.pricingType === 'kg' ? grams : 0,
          subtotal: item.pricingType === 'kg'
            ? (grams / 1000) * item.price
            : quantity * item.price,
        };
        return updated;
      }
      return [...prev, {
        id: 'ci' + Date.now(),
        itemId: item.id,
        name: item.name,
        categoryId: item.categoryId,
        pricingType: item.pricingType,
        price: item.price,
        quantity: item.pricingType === 'piece' ? quantity : 1,
        grams: item.pricingType === 'kg' ? grams : 0,
        subtotal: item.pricingType === 'kg'
          ? (grams / 1000) * item.price
          : quantity * item.price,
      }];
    });
  }, []);

  const updateCartItem = useCallback((cartItemId, quantity, grams, item) => {
    setCartItems(prev => prev.map(ci => {
      if (ci.id !== cartItemId) return ci;
      return {
        ...ci,
        quantity: item.pricingType === 'piece' ? quantity : 1,
        grams: item.pricingType === 'kg' ? grams : 0,
        subtotal: item.pricingType === 'kg'
          ? (grams / 1000) * item.price
          : quantity * item.price,
      };
    }));
  }, []);

  const removeFromCart = useCallback((cartItemId) => {
    setCartItems(prev => prev.filter(ci => ci.id !== cartItemId));
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
    setAppliedCoupon(null);
    setCouponError('');
  }, []);

  const applyCoupon = useCallback((code) => {
    setCouponError('');
    const coupon = coupons.find(c => c.code.toUpperCase() === code.toUpperCase() && c.active);
    if (!coupon) {
      setCouponError('Invalid coupon code');
      return false;
    }
    if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
      setCouponError('Coupon has expired');
      return false;
    }
    if (coupon.maxUses && coupon.uses >= coupon.maxUses) {
      setCouponError('Coupon usage limit reached');
      return false;
    }
    const subtotal = cartItems.reduce((sum, ci) => sum + ci.subtotal, 0);
    if (subtotal < coupon.minOrderValue) {
      setCouponError(`Minimum order ₹${coupon.minOrderValue} required`);
      return false;
    }
    setAppliedCoupon(coupon);
    if (!appliedCoupon || appliedCoupon.code !== coupon.code) {
      incrementCouponUse(coupon.code);
    }
    return true;
  }, [coupons, cartItems, incrementCouponUse]);

  const removeCoupon = useCallback(() => {
    setAppliedCoupon(null);
    setCouponError('');
  }, []);

  const getSubtotal = useCallback(() => {
    return cartItems.reduce((sum, ci) => sum + ci.subtotal, 0);
  }, [cartItems]);

  const getDiscount = useCallback(() => {
    if (!appliedCoupon) return 0;
    return calculateDiscount(getSubtotal(), appliedCoupon);
  }, [appliedCoupon, getSubtotal]);

  const getDeliveryCharge = useCallback(() => {
    const subtotal = getSubtotal();
    if (settings.freeDeliveryAbove && subtotal >= settings.freeDeliveryAbove) return 0;
    return settings.deliveryCharge || 0;
  }, [settings, getSubtotal]);

  const getTotal = useCallback(() => {
    return getSubtotal() - getDiscount() + getDeliveryCharge();
  }, [getSubtotal, getDiscount, getDeliveryCharge]);

  const getItemCount = useCallback(() => {
    return cartItems.length;
  }, [cartItems]);

  const value = {
    cartItems, addToCart, updateCartItem, removeFromCart, clearCart,
    appliedCoupon, applyCoupon, removeCoupon, couponError,
    getSubtotal, getDiscount, getDeliveryCharge, getTotal, getItemCount,
    cartShake, triggerCartShake,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
