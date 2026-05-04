import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { generateOrderId, getSerialNumber, getPaymentStatus, calculateDiscount } from '../utils/orderUtils';
import { formatPrice } from '../utils/pricing';
import { validatePhone, validateRequired } from '../utils/validation';
import CustomerForm from '../components/checkout/CustomerForm';
import PaymentSelector from '../components/checkout/PaymentSelector';
import PartialPayment from '../components/checkout/PartialPayment';
import GiftMode from '../components/checkout/GiftMode';
import OrderSummary from '../components/checkout/OrderSummary';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { ordersApi } from '../api/orders';
import { customersApi } from '../api/customers';
import apiRequest from '../api/config';


const STEPS = ['Delivery', 'Details', 'Payment', 'Confirm'];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cartItems, getSubtotal, getDiscount, getDeliveryCharge, getTotal, appliedCoupon, clearCart } = useCart();
  const { addOrder, settings } = useApp();
  const { addToast } = useToast();

  const [step, setStep] = useState(0);
  const [deliveryType, setDeliveryType] = useState('delivery');
  const [customer, setCustomer] = useState({ name: '', phone: '', address: '', deliveryDate: '', notes: '' });
  const [errors, setErrors] = useState({});
  const [isGift, setIsGift] = useState(false);
  const [recipient, setRecipient] = useState({ name: '', phone: '', address: '', message: '' });
  const [recipientErrors, setRecipientErrors] = useState({});
  const [paymentMode, setPaymentMode] = useState('full');
  const [partialInputMode, setPartialInputMode] = useState('percent');
  const [paidPercent, setPaidPercent] = useState(100);
  const [paidAmount, setPaidAmount] = useState(getTotal());
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const total = getTotal();

  useEffect(() => {
    if (paymentMode === 'full') {
      setPaidAmount(total);
      setPaidPercent(100);
    } else {
      setPaidAmount(parseFloat(((paidPercent / 100) * total).toFixed(2)));
    }
  }, [total]);

  const handlePaidPercentChange = (pct) => {
    setPaidPercent(pct);
    setPaidAmount(parseFloat(((pct / 100) * total).toFixed(2)));
  };

  const handlePaidAmountChange = (amt) => {
    setPaidAmount(amt);
    setPaidPercent(total > 0 ? parseFloat(((amt / total) * 100).toFixed(1)) : 0);
  };

  const validateStep = () => {
    const newErrors = {};
    if (step === 0) {
      if (cartItems.length === 0) {
        addToast('Cart is empty', 'error');
        return false;
      }
      if (getSubtotal() < (settings.minOrderValue || 0)) {
        addToast(`Minimum order ₹${settings.minOrderValue} required`, 'warning');
        return false;
      }
    }
    if (step === 1) {
      if (!validateRequired(customer.name)) newErrors.name = 'Name is required';
      if (!validatePhone(customer.phone)) newErrors.phone = 'Enter valid 10-digit phone';
      if (deliveryType === 'delivery' && !validateRequired(customer.address)) newErrors.address = 'Address is required';
      if (!customer.deliveryDate) newErrors.deliveryDate = 'Delivery date is required';
      if (isGift) {
        const re = {};
        if (!validateRequired(recipient.name)) re.recipientName = 'Recipient name is required';
        if (!validatePhone(recipient.phone)) re.recipientPhone = 'Enter valid 10-digit phone';
        if (!validateRequired(recipient.address)) re.recipientAddress = 'Recipient address is required';
        setRecipientErrors(re);
        if (Object.keys(re).length > 0) {
          setErrors(newErrors);
          return false;
        }
      }
      setErrors(newErrors);
      if (Object.keys(newErrors).length > 0) return false;
    }
    return true;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    if (step < STEPS.length - 1) setStep(step + 1);
  };

  const handlePlaceOrder = async () => {
    if (isPlacingOrder) return;
    setIsPlacingOrder(true);

    try {
      // STEP 1: Get customer UUID first
      const customerResponse = await apiRequest(
        '/customers/find-or-create/',
        {
          method: 'POST',
          body: JSON.stringify({
            name: customer.name,
            phone: customer.phone,
            address: customer.address || ''
          })
        }
      );

      const customerId = customerResponse.data?.id || customerResponse.id;

      if (!customerId) {
        addToast('Failed to create customer', 'error');
        return;
      }

      console.log('Customer ID:', customerId);

      // STEP 2: Get proper item UUIDs
      // Cart items have local IDs like "ci123"
      // We need to find matching backend UUID
      // Map cart items to backend items
      const itemsPayload = cartItems.map(cartItem => {
        const isUUID = (id) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
        
        return {
          // Do NOT send "item" field if ID is not UUID
          item: isUUID(cartItem.id) ? cartItem.id : undefined,
          item_name: cartItem.name,
          item_price: parseFloat(cartItem.price),
          pricing_type: cartItem.pricingType || 'kg',
          quantity_grams: cartItem.pricingType === 'kg' 
            ? parseInt(cartItem.grams || 0)
            : null,
          quantity_pieces: cartItem.pricingType === 'piece'
            ? parseInt(cartItem.quantity || 0)
            : null,
          item_total: parseFloat(cartItem.subtotal || cartItem.total)
        };
      });

      // STEP 3: Build complete order payload
      const orderPayload = {
        customer: customerId,
        delivery_type: deliveryType || 'delivery',
        delivery_date: customer.deliveryDate,
        delivery_address: customer.address || '',
        order_notes: customer.notes || '',
        is_gift: isGift || false,
        gift_recipient_name: recipient.name || '',
        gift_recipient_phone: recipient.phone || '',
        gift_recipient_address: recipient.address || '',
        gift_message: recipient.message || '',
        subtotal: parseFloat(getSubtotal()),
        discount_amount: parseFloat(getDiscount() || 0),
        delivery_charge: parseFloat(getDeliveryCharge() || 0),
        total_amount: parseFloat(getTotal()),
        amount_paid: parseFloat(paymentMode === 'full' ? getTotal() : paidAmount),
        coupon: appliedCoupon?.id || null,
        items: itemsPayload
      };

      console.log('Final order payload:', orderPayload);

      // STEP 4: Place order
      const orderResponse = await apiRequest(
        '/orders/',
        {
          method: 'POST',
          body: JSON.stringify(orderPayload)
        }
      );

      console.log('Order success:', orderResponse);

      // STEP 5: Go to success page
      const orderData = orderResponse.data || orderResponse;
      
      // Update app state and clear cart
      addOrder(orderData);
      clearCart();
      
      navigate('/success', {
        state: { order: orderData }
      });

    } catch (error) {
      console.error('Order failed:', error);
      addToast(error.message || 'Failed to place order', 'error');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => step > 0 ? setStep(step - 1) : navigate('/kiosk')} className="p-2 rounded-xl hover:bg-gray-100 transition-all">
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Checkout</h1>
        </div>

        <div className="flex items-center gap-1 mb-6">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                i <= step ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {i < step ? <Check size={16} /> : i + 1}
              </div>
              <span className={`ml-2 text-xs font-medium hidden sm:block ${i <= step ? 'text-orange-600' : 'text-gray-400'}`}>{s}</span>
              {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-2 ${i < step ? 'bg-orange-500' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        <div className="space-y-6">
          {step >= 0 && (
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <h3 className="text-base font-semibold text-gray-900 mb-3">Delivery Type</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setDeliveryType('delivery')}
                  className={`p-4 rounded-2xl border-2 transition-all btn-press ${deliveryType === 'delivery' ? 'border-orange-500 bg-orange-50' : 'border-gray-200'}`}
                >
                  <span className="text-2xl block mb-1">🏠</span>
                  <p className={`font-semibold text-sm ${deliveryType === 'delivery' ? 'text-orange-600' : 'text-gray-700'}`}>Delivery</p>
                </button>
                <button
                  onClick={() => setDeliveryType('pickup')}
                  className={`p-4 rounded-2xl border-2 transition-all btn-press ${deliveryType === 'pickup' ? 'border-orange-500 bg-orange-50' : 'border-gray-200'}`}
                >
                  <span className="text-2xl block mb-1">🏪</span>
                  <p className={`font-semibold text-sm ${deliveryType === 'pickup' ? 'text-orange-600' : 'text-gray-700'}`}>Pickup</p>
                </button>
              </div>
              {deliveryType === 'pickup' && (
                <p className="mt-3 text-sm text-emerald-600 bg-emerald-50 rounded-xl p-3">Ready in 15-20 mins</p>
              )}
            </div>
          )}

          {step >= 1 && (
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <CustomerForm data={customer} onChange={setCustomer} errors={errors} deliveryType={deliveryType} />
            </div>
          )}

          {step >= 1 && (
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <GiftMode
                isGift={isGift}
                onToggle={() => setIsGift(!isGift)}
                recipient={recipient}
                onRecipientChange={setRecipient}
                errors={recipientErrors}
              />
            </div>
          )}

          {step >= 2 && (
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <PaymentSelector paymentMode={paymentMode} onChange={setPaymentMode} />
              {paymentMode === 'partial' && (
                <div className="mt-4">
                  <PartialPayment
                    total={total}
                    paidAmount={paidAmount}
                    paidPercent={paidPercent}
                    inputMode={partialInputMode}
                    onAmountChange={handlePaidAmountChange}
                    onPercentChange={handlePaidPercentChange}
                    onModeChange={setPartialInputMode}
                  />
                </div>
              )}
            </div>
          )}

          {step >= 2 && (
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <OrderSummary />
            </div>
          )}
        </div>

        <div className="mt-6 flex gap-3 pb-4 md:pb-0">
          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex-1 py-3.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all btn-press"
            >
              Back
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button
              onClick={handleNext}
              className="flex-1 py-3.5 bg-orange-500 text-white rounded-xl text-sm font-semibold hover:bg-orange-600 transition-all btn-press flex items-center justify-center gap-2"
            >
              Continue <ArrowRight size={16} />
            </button>
          ) : (
            <button
              onClick={handlePlaceOrder}
              disabled={isPlacingOrder}
              className={`flex-1 py-3.5 bg-orange-500 text-white rounded-xl text-sm font-semibold hover:bg-orange-600 transition-all btn-press flex items-center justify-center gap-2 ${isPlacingOrder ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isPlacingOrder ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Placing Order...
                </>
              ) : (
                'Place Order'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
