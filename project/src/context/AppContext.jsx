import { createContext, useContext, useCallback, useEffect, useRef } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { ordersApi } from '../api/orders';
import { customersApi } from '../api/customers';
import { menuApi } from '../api/menu';

const SEED_CATEGORIES = [
  { id: 'cat1', name: 'Sweets', icon: '🍬', color: '#FDE68A' },
  { id: 'cat2', name: 'Farsan', icon: '🥨', color: '#FCA5A5' },
  { id: 'cat3', name: 'Snacks', icon: '🥟', color: '#86EFAC' },
  { id: 'cat4', name: 'Beverages', icon: '🥤', color: '#93C5FD' },
];

const SEED_ITEMS = [
  { id: 'item1', name: 'Kaju Katli', description: 'Premium cashew sweet', categoryId: 'cat1', price: 1200, pricingType: 'kg', active: true, image: '', isBestseller: true },
  { id: 'item2', name: 'Motichoor Ladoo', description: 'Traditional boondi ladoo', categoryId: 'cat1', price: 600, pricingType: 'kg', active: true, image: '', isBestseller: true },
  { id: 'item3', name: 'Besan Barfi', description: 'Gram flour sweet', categoryId: 'cat1', price: 500, pricingType: 'kg', active: true, image: '', isBestseller: false },
  { id: 'item4', name: 'Gulab Jamun', description: 'Fried milk solid in syrup', categoryId: 'cat1', price: 400, pricingType: 'kg', active: true },
  { id: 'item5', name: 'Rasgulla', description: 'Soft cottage cheese balls', categoryId: 'cat1', price: 350, pricingType: 'kg', active: true },
  { id: 'item6', name: 'Halwa', description: 'Semolina sweet', categoryId: 'cat1', price: 300, pricingType: 'kg', active: true },
  { id: 'item7', name: 'Peda', description: 'Milk based sweet', categoryId: 'cat1', price: 450, pricingType: 'kg', active: true },
  { id: 'item8', name: 'Anjeer Barfi', description: 'Fig based premium sweet', categoryId: 'cat1', price: 900, pricingType: 'kg', active: true },
  { id: 'item9', name: 'Sev', description: 'Crispy gram flour noodles', categoryId: 'cat2', price: 280, pricingType: 'kg', active: true },
  { id: 'item10', name: 'Chakli', description: 'Spiral rice flour snack', categoryId: 'cat2', price: 320, pricingType: 'kg', active: true },
  { id: 'item11', name: 'Gathiya', description: 'Spiced gram flour sticks', categoryId: 'cat2', price: 260, pricingType: 'kg', active: true },
  { id: 'item12', name: 'Bhujia', description: 'Thin crispy sev', categoryId: 'cat2', price: 300, pricingType: 'kg', active: true },
  { id: 'item13', name: 'Chivda', description: 'Flattened rice mix', categoryId: 'cat2', price: 340, pricingType: 'kg', active: true },
  { id: 'item14', name: 'Namkeen Mix', description: 'Assorted savory mix', categoryId: 'cat2', price: 290, pricingType: 'kg', active: true },
  { id: 'item15', name: 'Samosa', description: 'Crispy potato filled pastry', categoryId: 'cat3', price: 15, pricingType: 'piece', active: true },
  { id: 'item16', name: 'Kachori', description: 'Spiced lentil filled pastry', categoryId: 'cat3', price: 20, pricingType: 'piece', active: true },
  { id: 'item17', name: 'Dabeli', description: 'Sweet spicy snack', categoryId: 'cat3', price: 30, pricingType: 'piece', active: true },
  { id: 'item18', name: 'Bhajiya Plate', description: 'Assorted fried fritters', categoryId: 'cat3', price: 40, pricingType: 'piece', active: true },
  { id: 'item19', name: 'Pani Puri', description: 'Spiced water filled puris', categoryId: 'cat3', price: 50, pricingType: 'piece', active: true },
  { id: 'item20', name: 'Sev Puri', description: 'Flat puris with toppings', categoryId: 'cat3', price: 45, pricingType: 'piece', active: true },
  { id: 'item21', name: 'Masala Chai', description: 'Spiced Indian tea', categoryId: 'cat4', price: 20, pricingType: 'piece', active: true },
  { id: 'item22', name: 'Lassi', description: 'Yogurt based drink', categoryId: 'cat4', price: 60, pricingType: 'piece', active: true },
  { id: 'item23', name: 'Nimbu Pani', description: 'Fresh lemonade', categoryId: 'cat4', price: 30, pricingType: 'piece', active: true },
  { id: 'item24', name: 'Rose Sharbat', description: 'Sweet rose flavored drink', categoryId: 'cat4', price: 40, pricingType: 'piece', active: true },
];

const SEED_COUPONS = [
  { id: 'coup1', code: 'SWEET10', discountType: 'percentage', value: 10, minOrderValue: 200, maxUses: 100, uses: 0, active: true, expiryDate: '' },
  { id: 'coup2', code: 'FLAT50', discountType: 'fixed', value: 50, minOrderValue: 300, maxUses: 50, uses: 0, active: true, expiryDate: '' },
  { id: 'coup3', code: 'WELCOME20', discountType: 'percentage', value: 20, minOrderValue: 100, maxUses: 200, uses: 0, active: true, expiryDate: '' },
];

const SEED_SETTINGS = {
  shopName: 'Mahalaxmi Sweets & Farsan',
  tagline: 'Taste the Tradition',
  phone: '9876543210',
  deliveryCharge: 50,
  minOrderValue: 100,
  freeDeliveryAbove: 500,
  logo: null,
};

const AppContext = createContext();

const normalizeOrder = (o) => {
  if (!o) return null;
  const totalVal = parseFloat(o.total_amount || o.total || 0);
  const paidVal = parseFloat(o.amount_paid || o.paid || 0);
  const balanceVal = parseFloat(o.remaining_amount || o.balance || 0);
  
  return {
    ...o,
    // Backend Keys
    order_id: o.order_id || 'Unknown',
    serial_number: o.serial_number || o.serial || 0,
    total_amount: totalVal,
    amount_paid: paidVal,
    remaining_amount: balanceVal,
    payment_status: o.payment_status || o.paymentStatus || 'PENDING',
    kitchen_status: (o.kitchen_status === 'PENDING' ? 'NEW' : o.kitchen_status) || o.kitchenStatus || 'NEW',
    created_at: o.created_at || o.createdAt || new Date().toISOString(),
    
    // Frontend Keys (Fallbacks)
    id: o.id,
    orderId: o.order_id || o.orderId || 'Unknown',
    serial: o.serial_number || o.serial || 0,
    createdAt: o.created_at || o.createdAt || new Date().toISOString(),
    total: totalVal,
    paid: paidVal,
    balance: balanceVal,
    paymentStatus: o.payment_status || o.paymentStatus || 'PENDING',
    kitchenStatus: (o.kitchen_status === 'PENDING' ? 'NEW' : o.kitchen_status) || o.kitchenStatus || 'NEW',
    customer: {
      name: o.customer_name || o.customer?.name || 'Walk-in',
      phone: o.customer_phone || o.customer?.phone || '-',
    },
    items: (o.items || []).map(item => {
      if (!item) return null;
      const itemTotal = parseFloat(item.item_total || item.total || 0);
      return {
        ...item,
        // Both variants
        item_name: item.item_name || item.name || 'Unknown',
        name: item.item_name || item.name || 'Unknown',
        pricing_type: item.pricing_type || item.pricingType || 'kg',
        pricingType: item.pricing_type || item.pricingType || 'kg',
        quantity_grams: item.quantity_grams || item.grams || 0,
        grams: item.quantity_grams || item.grams || 0,
        quantity_pieces: item.quantity_pieces || item.quantity || 0,
        quantity: item.quantity_pieces || item.quantity || 0,
        item_total: itemTotal,
        total: itemTotal
      };
    }).filter(Boolean)
  };
};

export function AppProvider({ children }) {
  const [categories, setCategories] = useLocalStorage('mhl_categories', null);
  const [items, setItems] = useLocalStorage('mhl_items', null);
  const [coupons, setCoupons] = useLocalStorage('mhl_coupons', null);
  const [settings, setSettings] = useLocalStorage('mhl_settings', null);
  const [orders, setOrders] = useLocalStorage('mhl_orders', []);
  const [customers, setCustomers] = useLocalStorage('mhl_customers', []);
  const initialized = useRef(false);

  useEffect(() => {
    // Sync with Backend
    const syncWithBackend = async () => {
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('access_token');
        
        // Fetch all data from cloud in one go
        const [itemsData, categoriesData, ordersDataRaw, customersDataRaw] = await Promise.all([
          menuApi.getItems().catch(() => []),
          menuApi.getCategories().catch(() => []),
          ordersApi.getOrders().catch(() => []),
          customersApi.getCustomers().catch(() => [])
        ]);

        const ordersData = ordersDataRaw;
        const customersData = customersDataRaw;
        
        const rawOrders = ordersData?.results || ordersData?.data || ordersData;
        if (Array.isArray(rawOrders)) {
          const normalizedOrders = rawOrders.map(normalizeOrder).filter(Boolean);
          setOrders(normalizedOrders);
        }
        
        const rawCustomers = customersData?.results || customersData?.data || customersData;
        if (Array.isArray(rawCustomers)) {
          const normalizedCustomers = rawCustomers.map(c => {
            if (!c) return null;
            return { 
              ...c, 
              orderCount: c.total_orders || 0, 
              totalSpent: parseFloat(c.total_spent || 0), 
              balance: parseFloat(c.outstanding_balance || 0),
              name: c.name || 'Unknown',
              phone: c.phone || '-'
            };
          }).filter(Boolean);
          setCustomers(normalizedCustomers);
        }

        const backendItems = itemsData?.results || itemsData?.data || itemsData;
        if (Array.isArray(backendItems)) {
          setItems(backendItems.map(item => ({
            ...item,
            id: item.id,
            name: item.name,
            categoryId: item.category,
            price: parseFloat(item.price),
            pricingType: item.pricing_type,
            active: item.is_active,
            image: item.image_url || ''
          })));
        }

        const backendCategories = categoriesData?.results || categoriesData?.data || categoriesData;
        if (Array.isArray(backendCategories)) {
          setCategories(backendCategories.map(cat => ({
            ...cat,
            id: cat.id,
            name: cat.name,
            icon: cat.icon,
            active: cat.is_active
          })));
        }
      } catch (error) {
        console.error('Sync error:', error);
      }
    };

    if (!initialized.current) {
        initialized.current = true;
        if (categories === null) setCategories(SEED_CATEGORIES);
        if (items === null) setItems(SEED_ITEMS);
        if (coupons === null) setCoupons(SEED_COUPONS);
        if (settings === null) setSettings(SEED_SETTINGS);
    }

    syncWithBackend();
    
    // Heartbeat every 20 seconds
    const interval = setInterval(syncWithBackend, 20000);
    return () => clearInterval(interval);

  }, [setOrders, setCustomers, setItems, setCategories, setCoupons, setSettings]);

  const addCategory = useCallback((cat) => {
    setCategories(prev => [...prev, { ...cat, id: 'cat' + Date.now() }]);
  }, []);

  const updateCategory = useCallback((id, data) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
  }, []);

  const deleteCategory = useCallback((id) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  }, []);

  const addItem = useCallback((item) => {
    setItems(prev => [...prev, { ...item, id: 'item' + Date.now(), active: true }]);
  }, []);

  const updateItem = useCallback((id, data) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, ...data } : i));
  }, []);

  const deleteItem = useCallback((id) => {
    setItems(prev => prev.filter(i => i.id !== id));
  }, []);

  const toggleItemActive = useCallback((id) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, active: !i.active } : i));
  }, []);

  const addOrder = useCallback((order) => {
    const normalized = normalizeOrder(order);
    const orderWithKitchen = { ...normalized, kitchenStatus: normalized.kitchenStatus || 'NEW' };
    setOrders(prev => [...prev, orderWithKitchen]);

    setCustomers(prev => {
      const customerObj = order.customer_data || order.customer;
      const customerPhone = typeof customerObj === 'object' ? customerObj.phone : order.customer_phone;
      const customerName = typeof customerObj === 'object' ? customerObj.name : order.customer_name;
      
      const existing = prev.findIndex(c => c.phone === customerPhone);
      const orderTotal = parseFloat(order.total_amount || order.total || 0);
      const orderBalance = parseFloat(order.remaining_amount || order.balance || 0);

      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = {
          ...updated[existing],
          name: customerName,
          orderCount: (updated[existing].orderCount || 0) + 1,
          totalSpent: (updated[existing].totalSpent || 0) + orderTotal,
          balance: (updated[existing].balance || 0) + orderBalance,
          lastOrderDate: order.created_at || order.createdAt,
        };
        return updated;
      }
      return [...prev, {
        id: order.customer?.id || 'cust' + Date.now(),
        name: customerName,
        phone: customerPhone,
        orderCount: 1,
        totalSpent: orderTotal,
        balance: orderBalance,
        lastOrderDate: order.created_at || order.createdAt,
      }];
    });
  }, []);

  const updateOrder = useCallback((id, data) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, ...data } : o));
    
    // Push to Backend
    const token = localStorage.getItem('token') || localStorage.getItem('access_token');
    if (token) {
      if (data.kitchenStatus || data.kitchen_status) {
        const status = data.kitchenStatus || data.kitchen_status;
        const backendStatus = status === 'NEW' ? 'PENDING' : status;
        ordersApi.updateKitchenStatus(id, backendStatus).catch(console.error);
      } else {
        const apiData = {};
        if (data.amount_paid !== undefined) apiData.amount_paid = data.amount_paid;
        if (data.remaining_amount !== undefined) apiData.remaining_amount = data.remaining_amount;
        if (data.payment_status) apiData.payment_status = data.payment_status;
        if (Object.keys(apiData).length > 0) {
          ordersApi.updateOrder(id, apiData).catch(console.error);
        }
      }
    }
  }, []);

  const deleteOrder = useCallback((id) => {
    setOrders(prev => prev.filter(o => o.id !== id));
  }, []);

  const addCoupon = useCallback((coupon) => {
    setCoupons(prev => [...prev, { ...coupon, id: 'coup' + Date.now(), uses: 0 }]);
  }, []);

  const updateCoupon = useCallback((id, data) => {
    setCoupons(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
  }, []);

  const deleteCoupon = useCallback((id) => {
    setCoupons(prev => prev.filter(c => c.id !== id));
  }, []);

  const incrementCouponUse = useCallback((code) => {
    setCoupons(prev => prev.map(c => c.code === code ? { ...c, uses: c.uses + 1 } : c));
  }, []);

  const updateSettings = useCallback((data) => {
    setSettings(prev => ({ ...prev, ...data }));
  }, []);

  const value = {
    categories, setCategories, addCategory, updateCategory, deleteCategory,
    items, setItems, addItem, updateItem, deleteItem, toggleItemActive,
    orders, setOrders, addOrder, updateOrder, deleteOrder,
    customers, setCustomers,
    coupons, setCoupons, addCoupon, updateCoupon, deleteCoupon, incrementCouponUse,
    settings, updateSettings,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
