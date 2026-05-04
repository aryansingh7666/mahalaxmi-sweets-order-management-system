import { useState, useEffect, useMemo, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { timeAgo, formatDateTime } from '../../utils/orderUtils';
import { formatPrice } from '../../utils/pricing';
import Badge from '../../components/shared/Badge';
import { ChefHat, Clock, CheckCircle2, Truck, Volume2, VolumeX, RefreshCw } from 'lucide-react';

const STATUS_FLOW = ['NEW', 'PREPARING', 'READY', 'DELIVERED'];
const STATUS_CONFIG = {
  NEW: { color: 'bg-red-500', text: 'text-white', label: 'New', next: 'PREPARING', icon: Clock },
  PREPARING: { color: 'bg-amber-500', text: 'text-white', label: 'Preparing', next: 'READY', icon: ChefHat },
  READY: { color: 'bg-emerald-500', text: 'text-white', label: 'Ready', next: 'DELIVERED', icon: CheckCircle2 },
  DELIVERED: { color: 'bg-gray-400', text: 'text-white', label: 'Delivered', next: null, icon: Truck },
};

export default function KitchenPage() {
  const { orders, updateOrder } = useApp();
  const [filter, setFilter] = useState('active');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const lastOrderCountRef = useRef(0);

  const kitchenOrders = useMemo(() => {
    let result = (orders || []).filter(o => o.kitchenStatus && o.kitchenStatus !== 'DELIVERED');
    if (filter === 'all') result = (orders || []).filter(o => o.kitchenStatus);
    return result.sort((a, b) => {
      const statusOrder = { NEW: 0, PREPARING: 1, READY: 2, DELIVERED: 3 };
      if (statusOrder[a.kitchenStatus] !== statusOrder[b.kitchenStatus]) {
        return statusOrder[a.kitchenStatus] - statusOrder[b.kitchenStatus];
      }
      return new Date(a.createdAt) - new Date(b.createdAt);
    });
  }, [orders, filter]);

  useEffect(() => {
    const newOrders = (orders || []).filter(o => o.kitchenStatus === 'NEW').length;
    if (newOrders > lastOrderCountRef.current && lastOrderCountRef.current > 0 && soundEnabled) {
      try {
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 800;
        gain.gain.value = 0.3;
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } catch {}
    }
    lastOrderCountRef.current = newOrders;
  }, [orders, soundEnabled]);

  const advanceStatus = (order) => {
    const config = STATUS_CONFIG[order.kitchenStatus];
    if (config?.next) {
      updateOrder(order.id, { kitchenStatus: config.next });
    }
  };

  const counts = useMemo(() => ({
    NEW: (orders || []).filter(o => o.kitchenStatus === 'NEW').length,
    PREPARING: (orders || []).filter(o => o.kitchenStatus === 'PREPARING').length,
    READY: (orders || []).filter(o => o.kitchenStatus === 'READY').length,
    DELIVERED: (orders || []).filter(o => o.kitchenStatus === 'DELIVERED').length,
  }), [orders]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Kitchen Display</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2.5 rounded-xl transition-all ${soundEnabled ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-400'}`}
          >
            {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
          <button
            key={key}
            onClick={() => setFilter(key === 'DELIVERED' ? 'all' : 'active')}
            className={`${cfg.color} rounded-2xl p-4 text-left transition-all hover:opacity-90`}
          >
            <cfg.icon size={20} className="text-white/80 mb-2" />
            <p className="text-2xl font-bold text-white">{counts[key]}</p>
            <p className="text-sm text-white/80">{cfg.label}</p>
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setFilter('active')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === 'active' ? 'bg-orange-500 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}
        >
          Active Orders
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === 'all' ? 'bg-orange-500 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}
        >
          All Orders
        </button>
      </div>

      {kitchenOrders.length === 0 ? (
        <div className="text-center py-16">
          <ChefHat size={48} className="text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No active kitchen orders</p>
          <p className="text-gray-400 text-sm mt-1">New orders will appear here automatically</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {kitchenOrders.map(order => {
            const config = STATUS_CONFIG[order.kitchenStatus];
            
            return (
              <div key={order.id} 
                   className="bg-white rounded-xl p-4 border-2 border-gray-100 shadow-lg">
                
                {/* Header */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Clock size={16} />
                    <div>
                      <p className="text-sm font-medium">
                        {timeAgo(order.createdAt).replace(' ago', '')}
                      </p>
                      <p className="text-[10px] opacity-60 font-bold">
                        {new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                      #{String(order.serial || order.serial_number || 0).padStart(3, '0')}
                    </div>
                  </div>
                </div>
                
                {/* Customer */}
                <div className="mb-3">
                  <div className="font-semibold text-base text-gray-900">
                    {order.customer?.name || 'Guest'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {order.customer?.phone || ''}
                  </div>
                </div>
                
                {/* Items */}
                <div className="mb-4 space-y-2">
                  {order.items?.map((item, idx) => (
                    <div key={idx} 
                         className="flex justify-between text-sm items-center bg-orange-50/50 p-2 rounded-lg">
                      <span className="font-medium text-gray-800">{item.item_name || item.name}</span>
                      <span className="text-orange-700 font-semibold text-xs bg-orange-100 px-2 py-1 rounded">
                        {item.pricing_type === 'kg' || item.pricingType === 'kg'
                          ? `${(item.quantity_grams || item.grams) >= 1000 
                               ? ((item.quantity_grams || item.grams)/1000).toFixed(2) + 'kg'
                               : (item.quantity_grams || item.grams) + 'g'}`
                          : `${item.quantity_pieces || item.quantity} pc`}
                      </span>
                    </div>
                  ))}
                </div>
                
                {/* Total */}
                <div className="border-t border-dashed border-gray-200 pt-3 mb-4">
                  <div className="flex justify-between font-bold">
                    <span className="text-gray-600">Total:</span>
                    <span className="text-gray-900">
                      ₹{parseFloat(order.total_amount || order.total || 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="text-xs font-medium text-gray-400 mt-1 uppercase tracking-wider">
                    {order.delivery_type === 'delivery' || order.deliveryType === 'delivery'
                      ? '🚚 Delivery' 
                      : '🏃 Pickup'}
                  </div>
                </div>
                
                {/* Action Button */}
                {config.next && (
                  <button
                    onClick={() => advanceStatus(order)}
                    className={`w-full py-2.5 rounded-xl font-semibold transition-all duration-200 text-white shadow-sm hover:shadow-md btn-press ${STATUS_CONFIG[config.next].color}`}
                  >
                    Mark as {STATUS_CONFIG[config.next].label}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
