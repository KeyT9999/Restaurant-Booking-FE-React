import { useState } from 'react';
import { Edit, Folder, GripVertical, Plus, Trash2, X, Check } from 'lucide-react';
import * as menuApi from '../../api/menuApi';
import { Button } from '../ui/button';

export default function MenuCategoryManager({ restaurantId, categories, onClose }) {
  const [localCategories, setLocalCategories] = useState(categories || []);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formOrder, setFormOrder] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const resetForm = () => {
    setFormName('');
    setFormDesc('');
    setFormOrder(0);
    setEditId(null);
    setShowForm(false);
    setError(null);
  };

  const handleAdd = async () => {
    if (!formName.trim()) { setError('Tên danh mục là bắt buộc'); return; }
    setLoading(true);
    try {
      const res = await menuApi.createMenuCategory(restaurantId, {
        name: formName.trim(),
        description: formDesc.trim() || null,
        displayOrder: formOrder,
      });
      setLocalCategories([...localCategories, res.data?.category || res.data]);
      resetForm();
    } catch (err) {
      setError(err.message || 'Không thể tạo danh mục');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!formName.trim()) { setError('Tên danh mục là bắt buộc'); return; }
    setLoading(true);
    try {
      await menuApi.updateMenuCategory(editId, {
        name: formName.trim(),
        description: formDesc.trim() || null,
        displayOrder: formOrder,
      });
      setLocalCategories(localCategories.map((c) =>
        c.id === editId ? { ...c, name: formName.trim(), description: formDesc.trim(), displayOrder: formOrder } : c
      ));
      resetForm();
    } catch (err) {
      setError(err.message || 'Không thể cập nhật danh mục');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (cat) => {
    if (cat.itemCount > 0) {
      setError(`Không thể xóa danh mục "${cat.name}" vì đang có ${cat.itemCount} món ăn`);
      return;
    }
    if (!window.confirm(`Xóa danh mục "${cat.name}"?`)) return;
    try {
      await menuApi.deleteMenuCategory(cat.id);
      setLocalCategories(localCategories.filter((c) => c.id !== cat.id));
    } catch (err) {
      setError(err.message || 'Không thể xóa danh mục');
    }
  };

  const startEdit = (cat) => {
    setEditId(cat.id);
    setFormName(cat.name);
    setFormDesc(cat.description || '');
    setFormOrder(cat.displayOrder || 0);
    setShowForm(true);
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
          <div className="flex items-center gap-2 text-white">
            <Folder size={20} className="text-primary" />
            <h3 className="font-serif text-base font-bold">Quản lý Danh mục</h3>
          </div>
          <button 
            type="button"
            className="text-muted-foreground hover:text-white transition rounded-lg p-1 hover:bg-secondary/40" 
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        {/* Error alert */}
        {error && (
          <div className="mb-4 p-3 rounded-xl border border-destructive/25 bg-destructive/10 text-destructive text-xs leading-relaxed flex items-center justify-between gap-2">
            <span>{error}</span>
            <button 
              type="button"
              className="text-muted-foreground hover:text-white shrink-0" 
              onClick={() => setError(null)}
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Body */}
        <div className="space-y-4">
          {/* Category list */}
          <div className="flex flex-col gap-2 max-h-[280px] overflow-y-auto pr-1">
            {localCategories.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground bg-[#0F1115]/30 border border-dashed border-border/40 rounded-xl p-4">
                <Folder size={32} strokeWidth={1} className="text-muted-foreground/60 mb-2" />
                <p className="text-xs font-semibold text-white">Chưa có danh mục nào</p>
                <span className="text-[11px] mt-0.5">Tạo danh mục đầu tiên để phân loại thực đơn của bạn</span>
              </div>
            ) : (
              [...localCategories]
                .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
                .map((cat) => (
                  <div
                    key={cat.id}
                    className={`flex items-center gap-3 p-2.5 rounded-xl border transition-colors ${
                      editId === cat.id 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border bg-[#0F1115]/40 hover:bg-[#0F1115]/80'
                    }`}
                  >
                    <div className="text-muted-foreground/45 cursor-grab shrink-0">
                      <GripVertical size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-white truncate">{cat.name}</div>
                      {cat.description && (
                        <div className="text-[11px] text-muted-foreground/80 truncate mt-0.5">{cat.description}</div>
                      )}
                    </div>
                    <div className="text-[11px] text-muted-foreground/90 shrink-0 bg-secondary/50 px-2 py-0.5 rounded-md border border-border/40 font-medium">
                      <span>{cat.itemCount || 0}</span> món
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        className="w-7 h-7 rounded-lg border border-border text-muted-foreground hover:text-primary hover:border-primary/50 flex items-center justify-center transition bg-transparent hover:bg-secondary/40 cursor-pointer"
                        onClick={() => startEdit(cat)}
                        title="Chỉnh sửa"
                      >
                        <Edit size={12} />
                      </button>
                      <button
                        type="button"
                        className="w-7 h-7 rounded-lg border border-border text-muted-foreground hover:text-destructive hover:border-destructive/50 flex items-center justify-center transition bg-transparent hover:bg-secondary/40 cursor-pointer"
                        onClick={() => handleDelete(cat)}
                        title="Xóa"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))
            )}
          </div>

          {/* Add/Edit Form */}
          {showForm ? (
            <div className="p-4 border border-border bg-[#0F1115]/40 rounded-xl space-y-3.5 mt-4">
              <div className="text-xs font-bold text-white uppercase tracking-wider">
                {editId ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
              </div>

              <div className="space-y-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Tên danh mục <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Món khai vị, Món chính, Đồ uống..."
                    value={formName}
                    onChange={(e) => { setFormName(e.target.value); setError(null); }}
                    maxLength={100}
                    className="bg-[#0F1115] border border-border text-white text-xs rounded-xl px-3 py-2.5 focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none transition-all"
                    autoFocus
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Mô tả</label>
                  <input
                    type="text"
                    placeholder="Mô tả ngắn về danh mục (tùy chọn)"
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    maxLength={500}
                    className="bg-[#0F1115] border border-border text-white text-xs rounded-xl px-3 py-2.5 focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Thứ tự hiển thị</label>
                  <input
                    type="number"
                    value={formOrder}
                    onChange={(e) => setFormOrder(Number(e.target.value))}
                    min="0"
                    className="bg-[#0F1115] border border-border text-white text-xs rounded-xl px-3 py-2.5 focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none transition-all w-24"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border/30">
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  className="border-border hover:bg-secondary/40 text-xs h-8 px-3.5"
                >
                  Hủy
                </Button>
                <Button
                  type="button"
                  variant="default"
                  onClick={editId ? handleEdit : handleAdd}
                  disabled={loading}
                  className="bg-primary hover:bg-primary/95 text-black font-semibold text-xs h-8 px-3.5"
                >
                  <Check size={12} className="mr-1" />
                  {loading ? 'Đang xử lý...' : editId ? 'Cập nhật' : 'Tạo danh mục'}
                </Button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              className="w-full flex items-center justify-center gap-1.5 p-2.5 rounded-xl border border-dashed border-primary/25 hover:border-primary/50 text-primary text-xs font-semibold bg-primary/5 hover:bg-primary/10 transition mt-4 cursor-pointer"
              onClick={() => setShowForm(true)}
            >
              <Plus size={14} />
              <span>Thêm danh mục mới</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
