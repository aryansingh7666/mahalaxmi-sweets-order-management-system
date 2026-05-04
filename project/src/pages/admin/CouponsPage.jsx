import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { formatPrice } from '../../utils/pricing';
import Modal from '../../components/shared/Modal';
import CouponForm from '../../components/admin/CouponForm';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import Badge from '../../components/shared/Badge';
import { Plus, CreditCard as Edit3, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';

export default function CouponsPage() {
  const { coupons, addCoupon, updateCoupon, deleteCoupon } = useApp();
  const { addToast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editCoupon, setEditCoupon] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const handleSave = (data) => {
    if (editCoupon) {
      updateCoupon(editCoupon.id, data);
      addToast('Coupon updated', 'success');
    } else {
      addCoupon(data);
      addToast('Coupon added', 'success');
    }
    setShowForm(false);
    setEditCoupon(null);
  };

  const toggleActive = (coupon) => {
    updateCoupon(coupon.id, { active: !coupon.active });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Coupons</h1>
        <button
          onClick={() => { setEditCoupon(null); setShowForm(true); }}
          className="flex items-center gap-1.5 px-4 py-2 bg-orange-500 text-white rounded-xl text-sm font-medium hover:bg-orange-600 btn-press"
        >
          <Plus size={16} /> Add Coupon
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-3 font-medium text-gray-500">Code</th>
                <th className="text-left py-3 px-3 font-medium text-gray-500">Type</th>
                <th className="text-right py-3 px-3 font-medium text-gray-500">Value</th>
                <th className="text-right py-3 px-3 font-medium text-gray-500">Min Order</th>
                <th className="text-center py-3 px-3 font-medium text-gray-500">Uses</th>
                <th className="text-center py-3 px-3 font-medium text-gray-500">Status</th>
                <th className="text-center py-3 px-3 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(coupons || []).map(coupon => (
                <tr key={coupon.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-3 font-bold text-gray-900">{coupon.code}</td>
                  <td className="py-3 px-3">
                    <Badge variant={coupon.discountType === 'percentage' ? 'orange' : 'info'}>
                      {coupon.discountType === 'percentage' ? '%' : '₹ Fixed'}
                    </Badge>
                  </td>
                  <td className="py-3 px-3 text-right font-medium">
                    {coupon.discountType === 'percentage' ? `${coupon.value}%` : formatPrice(coupon.value)}
                  </td>
                  <td className="py-3 px-3 text-right">{formatPrice(coupon.minOrderValue)}</td>
                  <td className="py-3 px-3 text-center">{coupon.uses}/{coupon.maxUses || '∞'}</td>
                  <td className="py-3 px-3 text-center">
                    <button onClick={() => toggleActive(coupon)}>
                      {coupon.active ? <ToggleRight size={24} className="text-emerald-500 mx-auto" /> : <ToggleLeft size={24} className="text-gray-400 mx-auto" />}
                    </button>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => { setEditCoupon(coupon); setShowForm(true); }} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-orange-500 transition-all">
                        <Edit3 size={15} />
                      </button>
                      <button onClick={() => setDeleteConfirm(coupon)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-red-500 transition-all">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="md:hidden space-y-3">
          {(coupons || []).map(coupon => (
            <div key={coupon.id} className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-900 text-sm">{coupon.code}</span>
                  <Badge variant={coupon.discountType === 'percentage' ? 'orange' : 'info'}>
                    {coupon.discountType === 'percentage' ? `${coupon.value}%` : formatPrice(coupon.value)}
                  </Badge>
                </div>
                <button onClick={() => toggleActive(coupon)}>
                  {coupon.active ? <ToggleRight size={24} className="text-emerald-500" /> : <ToggleLeft size={24} className="text-gray-400" />}
                </button>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Min: {formatPrice(coupon.minOrderValue)}</span>
                <span>Uses: {coupon.uses}/{coupon.maxUses || '∞'}</span>
              </div>
              <div className="flex items-center gap-1 mt-2 pt-2 border-t border-gray-200">
                <button onClick={() => { setEditCoupon(coupon); setShowForm(true); }} className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-400">
                  <Edit3 size={15} />
                </button>
                <button onClick={() => setDeleteConfirm(coupon)} className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-400">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {(!coupons || coupons.length === 0) && (
          <p className="text-center text-gray-500 py-8">No coupons yet</p>
        )}
      </div>

      <Modal isOpen={showForm} onClose={() => { setShowForm(false); setEditCoupon(null); }} title={editCoupon ? 'Edit Coupon' : 'Add Coupon'} size="md">
        <CouponForm coupon={editCoupon} onSave={handleSave} onCancel={() => { setShowForm(false); setEditCoupon(null); }} />
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => { deleteCoupon(deleteConfirm.id); addToast('Coupon deleted', 'success'); setDeleteConfirm(null); }}
        title="Delete Coupon"
        message={`Delete coupon "${deleteConfirm?.code}"? This cannot be undone.`}
        variant="danger"
      />
    </div>
  );
}
