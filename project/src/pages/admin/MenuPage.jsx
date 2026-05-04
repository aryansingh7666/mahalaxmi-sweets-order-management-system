import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { formatPrice } from '../../utils/pricing';
import Modal from '../../components/shared/Modal';
import ItemForm from '../../components/admin/ItemForm';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import Badge from '../../components/shared/Badge';
import { Plus, Search, CreditCard as Edit3, Trash2, ToggleLeft, ToggleRight, Star } from 'lucide-react';

export default function MenuPage() {
  const { categories, addCategory, updateCategory, deleteCategory, items, addItem, updateItem, deleteItem, toggleItemActive } = useApp();
  const { addToast } = useToast();
  const [search, setSearch] = useState('');
  const [showItemForm, setShowItemForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteItemConfirm, setDeleteItemConfirm] = useState(null);
  const [showCatForm, setShowCatForm] = useState(false);
  const [editCat, setEditCat] = useState(null);
  const [deleteCatConfirm, setDeleteCatConfirm] = useState(null);
  const [catForm, setCatForm] = useState({ name: '', icon: '', color: '#FDE68A' });

  const filteredItems = useMemo(() => {
    if (!search) return items || [];
    const q = search.toLowerCase();
    return (items || []).filter(i => i.name.toLowerCase().includes(q));
  }, [items, search]);

  const handleSaveItem = (data) => {
    if (editItem) {
      updateItem(editItem.id, data);
      addToast('Item updated', 'success');
    } else {
      addItem(data);
      addToast('Item added', 'success');
    }
    setShowItemForm(false);
    setEditItem(null);
  };

  const handleSaveCat = () => {
    if (!catForm.name) return;
    if (editCat) {
      updateCategory(editCat.id, catForm);
      addToast('Category updated', 'success');
    } else {
      addCategory(catForm);
      addToast('Category added', 'success');
    }
    setShowCatForm(false);
    setEditCat(null);
    setCatForm({ name: '', icon: '', color: '#FDE68A' });
  };

  const openEditCat = (cat) => {
    setEditCat(cat);
    setCatForm({ name: cat.name, icon: cat.icon, color: cat.color });
    setShowCatForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Menu Management</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Categories</h2>
          <button
            onClick={() => { setEditCat(null); setCatForm({ name: '', icon: '', color: '#FDE68A' }); setShowCatForm(true); }}
            className="flex items-center gap-1.5 px-3 py-2 bg-orange-500 text-white rounded-xl text-sm font-medium hover:bg-orange-600 btn-press"
          >
            <Plus size={16} /> Add Category
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <div key={cat.id} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 border border-gray-100">
              <span>{cat.icon}</span>
              <span className="text-sm font-medium text-gray-700">{cat.name}</span>
              <button onClick={() => openEditCat(cat)} className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-orange-500 transition-all">
                <Edit3 size={14} />
              </button>
              <button onClick={() => setDeleteCatConfirm(cat)} className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-red-500 transition-all">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Items</h2>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-sm w-48"
                placeholder="Search items..."
              />
            </div>
            <button
              onClick={() => { setEditItem(null); setShowItemForm(true); }}
              className="flex items-center gap-1.5 px-3 py-2 bg-orange-500 text-white rounded-xl text-sm font-medium hover:bg-orange-600 btn-press"
            >
              <Plus size={16} /> Add Item
            </button>
          </div>
        </div>

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-3 font-medium text-gray-500">Image</th>
                <th className="text-left py-3 px-3 font-medium text-gray-500">Name</th>
                <th className="text-left py-3 px-3 font-medium text-gray-500">Category</th>
                <th className="text-right py-3 px-3 font-medium text-gray-500">Price</th>
                <th className="text-center py-3 px-3 font-medium text-gray-500">Type</th>
                <th className="text-center py-3 px-3 font-medium text-gray-500">Bestseller</th>
                <th className="text-center py-3 px-3 font-medium text-gray-500">Status</th>
                <th className="text-center py-3 px-3 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map(item => {
                const cat = categories.find(c => c.id === item.categoryId);
                return (
                  <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-3">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-lg">{cat?.icon || '?'}</div>
                      )}
                    </td>
                    <td className="py-3 px-3 font-medium text-gray-900">{item.name}</td>
                    <td className="py-3 px-3">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100">{cat?.icon} {cat?.name}</span>
                    </td>
                    <td className="py-3 px-3 text-right font-medium">{formatPrice(item.price)}</td>
                    <td className="py-3 px-3 text-center">
                      <Badge variant={item.pricingType === 'kg' ? 'orange' : 'info'}>{item.pricingType === 'kg' ? '/kg' : '/pc'}</Badge>
                    </td>
                    <td className="py-3 px-3 text-center">
                      {item.isBestseller && <Star size={16} className="text-amber-500 mx-auto" fill="currentColor" />}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button onClick={() => toggleItemActive(item.id)} className="text-lg">
                        {item.active ? <ToggleRight size={24} className="text-emerald-500 mx-auto" /> : <ToggleLeft size={24} className="text-gray-400 mx-auto" />}
                      </button>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => { setEditItem(item); setShowItemForm(true); }} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-orange-500 transition-all">
                          <Edit3 size={15} />
                        </button>
                        <button onClick={() => setDeleteItemConfirm(item)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-red-500 transition-all">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="md:hidden space-y-3">
          {filteredItems.map(item => {
            const cat = categories.find(c => c.id === item.categoryId);
            return (
              <div key={item.id} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center text-xl flex-shrink-0">{cat?.icon || '?'}</div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="font-medium text-gray-900 text-sm truncate">{item.name}</p>
                    {item.isBestseller && <Star size={12} className="text-amber-500 flex-shrink-0" fill="currentColor" />}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                    <span>{cat?.icon} {cat?.name}</span>
                    <span>{formatPrice(item.price)}/{item.pricingType === 'kg' ? 'kg' : 'pc'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => toggleItemActive(item.id)}>
                    {item.active ? <ToggleRight size={24} className="text-emerald-500" /> : <ToggleLeft size={24} className="text-gray-400" />}
                  </button>
                  <button onClick={() => { setEditItem(item); setShowItemForm(true); }} className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-400">
                    <Edit3 size={15} />
                  </button>
                  <button onClick={() => setDeleteItemConfirm(item)} className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-400">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Modal isOpen={showItemForm} onClose={() => { setShowItemForm(false); setEditItem(null); }} title={editItem ? 'Edit Item' : 'Add Item'} size="md">
        <ItemForm item={editItem} onSave={handleSaveItem} onCancel={() => { setShowItemForm(false); setEditItem(null); }} />
      </Modal>

      <Modal isOpen={showCatForm} onClose={() => { setShowCatForm(false); setEditCat(null); }} title={editCat ? 'Edit Category' : 'Add Category'} size="sm">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Name *</label>
            <input type="text" value={catForm.name} onChange={(e) => setCatForm({ ...catForm, name: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm" placeholder="Category name" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Icon (emoji)</label>
              <input type="text" value={catForm.icon} onChange={(e) => setCatForm({ ...catForm, icon: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm" placeholder="🍬" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Color</label>
              <input type="color" value={catForm.color} onChange={(e) => setCatForm({ ...catForm, color: e.target.value })} className="w-full h-11 rounded-xl border border-gray-200 cursor-pointer" />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => { setShowCatForm(false); setEditCat(null); }} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700">Cancel</button>
            <button onClick={handleSaveCat} disabled={!catForm.name} className="flex-1 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-semibold hover:bg-orange-600 disabled:opacity-50 btn-press">Save</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteItemConfirm}
        onClose={() => setDeleteItemConfirm(null)}
        onConfirm={() => { deleteItem(deleteItemConfirm.id); addToast('Item deleted', 'success'); setDeleteItemConfirm(null); }}
        title="Delete Item"
        message={`Delete "${deleteItemConfirm?.name}"? This cannot be undone.`}
        variant="danger"
      />

      <ConfirmDialog
        isOpen={!!deleteCatConfirm}
        onClose={() => setDeleteCatConfirm(null)}
        onConfirm={() => { deleteCategory(deleteCatConfirm.id); addToast('Category deleted', 'success'); setDeleteCatConfirm(null); }}
        title="Delete Category"
        message={`Delete "${deleteCatConfirm?.name}"? Items in this category will remain.`}
        variant="danger"
      />
    </div>
  );
}
