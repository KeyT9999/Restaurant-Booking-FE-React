import { useState } from 'react';
import { Edit, Folder, GripVertical, Plus, Trash2, X, Check } from 'lucide-react';
import * as menuApi from '../../api/menuApi';

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
    <div className="menu-modal-overlay" onClick={onClose}>
      <div className="menu-modal menu-modal--category" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="menu-modal-header">
          <div className="catmgr-header-title">
            <Folder size={20} />
            <h3>Quản lý Danh mục</h3>
          </div>
          <button className="menu-modal-close" onClick={onClose}><X size={20} /></button>
        </div>

        {/* Error alert */}
        {error && (
          <div className="catmgr-alert">
            <span>{error}</span>
            <button className="catmgr-alert-close" onClick={() => setError(null)}><X size={14} /></button>
          </div>
        )}

        {/* Content */}
        <div className="catmgr-body">
          {/* Category list */}
          <div className="catmgr-list">
            {localCategories.length === 0 ? (
              <div className="catmgr-empty">
                <Folder size={32} strokeWidth={1} />
                <p>Chưa có danh mục nào</p>
                <span>Tạo danh mục đầu tiên để phân loại món ăn</span>
              </div>
            ) : (
              localCategories
                .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
                .map((cat) => (
                  <div
                    key={cat.id}
                    className={`catmgr-item ${editId === cat.id ? 'catmgr-item--editing' : ''}`}
                  >
                    <div className="catmgr-item-grip">
                      <GripVertical size={14} />
                    </div>
                    <div className="catmgr-item-info">
                      <div className="catmgr-item-name">{cat.name}</div>
                      {cat.description && (
                        <div className="catmgr-item-desc">{cat.description}</div>
                      )}
                    </div>
                    <div className="catmgr-item-count">
                      <span>{cat.itemCount || 0}</span> món
                    </div>
                    <div className="catmgr-item-actions">
                      <button
                        className="catmgr-action-btn"
                        onClick={() => startEdit(cat)}
                        title="Chỉnh sửa"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        className="catmgr-action-btn catmgr-action-btn--danger"
                        onClick={() => handleDelete(cat)}
                        title="Xóa"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
            )}
          </div>

          {/* Add/Edit Form */}
          {showForm ? (
            <div className="catmgr-form">
              <div className="catmgr-form-title">
                {editId ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
              </div>

              <div className="catmgr-form-fields">
                <div className="catmgr-form-group">
                  <label>Tên danh mục <span className="required">*</span></label>
                  <input
                    type="text"
                    placeholder="VD: Món khai vị, Tráng miệng..."
                    value={formName}
                    onChange={(e) => { setFormName(e.target.value); setError(null); }}
                    maxLength={100}
                    autoFocus
                  />
                </div>

                <div className="catmgr-form-group">
                  <label>Mô tả</label>
                  <input
                    type="text"
                    placeholder="Mô tả ngắn (tùy chọn)"
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    maxLength={500}
                  />
                </div>

                <div className="catmgr-form-group catmgr-form-group--order">
                  <label>Thứ tự hiển thị</label>
                  <input
                    type="number"
                    value={formOrder}
                    onChange={(e) => setFormOrder(Number(e.target.value))}
                    min="0"
                  />
                </div>
              </div>

              <div className="catmgr-form-actions">
                <button
                  type="button"
                  className="catmgr-btn catmgr-btn--ghost"
                  onClick={resetForm}
                >
                  Hủy
                </button>
                <button
                  type="button"
                  className="catmgr-btn catmgr-btn--primary"
                  onClick={editId ? handleEdit : handleAdd}
                  disabled={loading}
                >
                  <Check size={14} />
                  {loading ? 'Đang xử lý...' : editId ? 'Cập nhật' : 'Tạo danh mục'}
                </button>
              </div>
            </div>
          ) : (
            <button
              className="catmgr-add-btn"
              onClick={() => setShowForm(true)}
            >
              <Plus size={16} />
              <span>Thêm danh mục mới</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
