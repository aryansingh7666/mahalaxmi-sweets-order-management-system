import { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { exportBackup, restoreBackup, clearAllOrders, formatBackupTime } from '../../utils/backupUtils';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import { Save, Download, Upload, Trash2, Store } from 'lucide-react';

export default function SettingsPage() {
  const { settings, updateSettings } = useApp();
  const { addToast } = useToast();
  const [form, setForm] = useState({ ...settings } || {});
  const [clearConfirm, setClearConfirm] = useState(false);
  const [clearDoubleConfirm, setClearDoubleConfirm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const handleSave = () => {
    updateSettings(form);
    addToast('Settings saved', 'success');
  };

  const handleExport = () => {
    exportBackup();
    addToast('Backup exported', 'success');
  };

  const handleRestore = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await restoreBackup(file);
      addToast('Backup restored. Please refresh the page.', 'success');
      setTimeout(() => window.location.reload(), 1500);
    } catch {
      addToast('Invalid backup file', 'error');
    }
  };

  const handleClearOrders = () => {
    if (!clearDoubleConfirm) {
      setClearDoubleConfirm(true);
      return;
    }
    clearAllOrders();
    addToast('All orders cleared', 'success');
    setClearConfirm(false);
    setClearDoubleConfirm(false);
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 2 * 1024 * 1024) {
      addToast('File too large (max 2MB)', 'error');
      return;
    }
    
    const formData = new FormData();
    formData.append('logo', file);
    
    try {
      setUploading(true);
      const token = localStorage.getItem('token') || localStorage.getItem('access_token');
      
      const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
      const response = await fetch(`${API_BASE}/settings/upload-logo/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      const data = await response.json();
      
      if (data.logo_url) {
        setForm(prev => ({ ...prev, logo: data.logo_url }));
        updateSettings({ ...form, logo: data.logo_url });
        addToast('Logo uploaded successfully', 'success');
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Logo upload error:', error);
      addToast('Failed to upload logo', 'error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Branding</h2>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Shop Name *</label>
          <input
            type="text"
            value={form.shopName}
            onChange={(e) => setForm({ ...form, shopName: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Tagline</label>
          <input
            type="text"
            value={form.tagline}
            onChange={(e) => setForm({ ...form, tagline: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Shop Logo</label>
          
          {form.logo && (
            <div className="mb-3">
              <img 
                src={form.logo} 
                alt="Current logo" 
                className="h-20 w-20 object-contain border border-gray-200 rounded-lg p-2 bg-gray-50"
              />
            </div>
          )}
          
          <input
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
            disabled={uploading}
            className="block w-full text-sm border border-gray-300 rounded-lg p-2
                       file:mr-4 file:py-2 file:px-4
                       file:rounded-md file:border-0
                       file:text-sm file:font-semibold
                       file:bg-orange-50 file:text-orange-700
                       hover:file:bg-orange-100 disabled:opacity-50"
          />
          <p className="text-xs text-gray-500 mt-1">
            Upload PNG, JPG, or SVG (max 2MB)
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Business</h2>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Shop Phone</label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Delivery Charge (₹)</label>
            <input
              type="number"
              value={form.deliveryCharge}
              onChange={(e) => setForm({ ...form, deliveryCharge: parseFloat(e.target.value) || 0 })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
              min="0"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Min Order Value (₹)</label>
            <input
              type="number"
              value={form.minOrderValue}
              onChange={(e) => setForm({ ...form, minOrderValue: parseFloat(e.target.value) || 0 })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
              min="0"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Free Delivery Above (₹)</label>
            <input
              type="number"
              value={form.freeDeliveryAbove}
              onChange={(e) => setForm({ ...form, freeDeliveryAbove: parseFloat(e.target.value) || 0 })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
              min="0"
            />
          </div>
        </div>
        <button
          onClick={handleSave}
          className="w-full py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-all btn-press flex items-center justify-center gap-2"
        >
          <Save size={18} /> Save Settings
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Data Management</h2>
        <p className="text-sm text-gray-500">Last backup: {formatBackupTime()}</p>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleExport}
            className="flex items-center justify-center gap-2 py-3 bg-blue-500 text-white rounded-xl text-sm font-semibold hover:bg-blue-600 btn-press"
          >
            <Download size={16} /> Export Backup
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            className="flex items-center justify-center gap-2 py-3 bg-gray-700 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 btn-press"
          >
            <Upload size={16} /> Restore Backup
          </button>
          <input ref={fileRef} type="file" accept=".json" onChange={handleRestore} className="hidden" />
        </div>
        <button
          onClick={() => { setClearConfirm(true); setClearDoubleConfirm(false); }}
          className="w-full py-3 border border-red-200 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-50 transition-all btn-press flex items-center justify-center gap-2"
        >
          <Trash2 size={16} /> Clear All Orders
        </button>
      </div>

      <ConfirmDialog
        isOpen={clearConfirm}
        onClose={() => { setClearConfirm(false); setClearDoubleConfirm(false); }}
        onConfirm={handleClearOrders}
        title={clearDoubleConfirm ? "CONFIRM AGAIN" : "Clear All Orders"}
        message={clearDoubleConfirm ? "This is your second confirmation. All orders will be permanently deleted!" : "Are you sure you want to delete all orders? This cannot be undone."}
        confirmLabel={clearDoubleConfirm ? "YES, DELETE ALL" : "Delete All Orders"}
        variant="danger"
      />
    </div>
  );
}
