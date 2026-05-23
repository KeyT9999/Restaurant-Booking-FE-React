import { useCallback, useEffect, useState } from 'react';
import { Folder, Plus, Search, Utensils } from 'lucide-react';
import OwnerLayout from '../../components/owner/OwnerLayout';
import { useRestaurantContext } from '../../context/useRestaurantContext';
import * as menuApi from '../../api/menuApi';
import MenuCategoryManager from '../../components/menu/MenuCategoryManager';
import MenuItemCard from '../../components/menu/MenuItemCard';
import MenuItemForm from '../../components/menu/MenuItemForm';
import './MenuPage.css';

export default function MenuPage() {
  const { selectedRestaurantId, isRestaurantReady } = useRestaurantContext();

  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Form modal
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Category modal
  const [showCategoryManager, setShowCategoryManager] = useState(false);

  // Delete modal
  const [deleteModal, setDeleteModal] = useState({ open: false, item: null });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchData = useCallback(async () => {
    if (!selectedRestaurantId) return;
    setLoading(true);
    setError(null);
    try {
      const [menuRes, catRes] = await Promise.all([
        menuApi.getMenuItems(selectedRestaurantId, {
          search: search || undefined,
          categoryId: filterCategory || undefined,
          status: filterStatus || undefined,
        }),
        menuApi.getMenuCategories(selectedRestaurantId),
      ]);
      setItems(menuRes.data?.items || []);
      setCategories(catRes.data?.categories || []);
    } catch (err) {
      setError(err.message || 'Không thể tải dữ liệu menu');
    } finally {
      setLoading(false);
    }
  }, [selectedRestaurantId, search, filterCategory, filterStatus]);

  useEffect(() => {
    if (isRestaurantReady) fetchData();
    else { setItems([]); setCategories([]); setLoading(false); }
  }, [isRestaurantReady, fetchData]);

  // ─── Handlers ───
  const handleCreateItem = () => { setEditingItem(null); setShowForm(true); };
  const handleEditItem = (item) => { setEditingItem(item); setShowForm(true); };

  const handleFormSubmit = async (data) => {
    try {
      if (editingItem) {
        await menuApi.updateMenuItem(editingItem.id, data);
        showToast('Cập nhật món ăn thành công');
      } else {
        await menuApi.createMenuItem(selectedRestaurantId, data);
        showToast('Tạo món ăn thành công');
      }
      setShowForm(false);
      setEditingItem(null);
      fetchData();
    } catch (err) {
      showToast(err.message || 'Có lỗi xảy ra', 'error');
    }
  };

  const handleDeleteClick = (item) => setDeleteModal({ open: true, item });
  const handleDeleteConfirm = async () => {
    if (!deleteModal.item) return;
    try {
      await menuApi.deleteMenuItem(deleteModal.item.id);
      showToast('Xóa món ăn thành công');
      setDeleteModal({ open: false, item: null });
      fetchData();
    } catch (err) {
      showToast(err.message || 'Không thể xóa món ăn', 'error');
      setDeleteModal({ open: false, item: null });
    }
  };

  const handleToggleAvailability = async (item) => {
    try {
      await menuApi.toggleMenuItemAvailability(item.id, !item.isAvailable);
      showToast(item.isAvailable ? 'Đã tắt món ăn' : 'Đã bật món ăn');
      fetchData();
    } catch (err) {
      showToast(err.message || 'Có lỗi xảy ra', 'error');
    }
  };

  // Stats
  const stats = {
    total: items.length,
    available: items.filter((i) => i.isAvailable).length,
    unavailable: items.filter((i) => !i.isAvailable).length,
  };

  if (!isRestaurantReady) {
    return (
      <OwnerLayout title="Quản lý Menu" subtitle="Quản lý thực đơn nhà hàng">
        <div className="menu-empty-state">
          <Utensils size={48} />
          <p>Vui lòng chọn nhà hàng để xem menu</p>
        </div>
      </OwnerLayout>
    );
  }

  return (
    <OwnerLayout title="Quản lý Menu" subtitle="Quản lý thực đơn nhà hàng">
      {/* Toast */}
      {toast && (
        <div className={`menu-toast menu-toast--${toast.type}`}>
          {toast.message}
        </div>
      )}

      {/* Stats */}
      <div className="menu-stats">
        <div className="menu-stat-card">
          <span className="menu-stat-number">{stats.total}</span>
          <span className="menu-stat-label">Tổng số món</span>
        </div>
        <div className="menu-stat-card menu-stat-card--success">
          <span className="menu-stat-number">{stats.available}</span>
          <span className="menu-stat-label">Còn món</span>
        </div>
        <div className="menu-stat-card menu-stat-card--warning">
          <span className="menu-stat-number">{stats.unavailable}</span>
          <span className="menu-stat-label">Hết món</span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="menu-toolbar">
        <div className="menu-search">
          <Search size={16} />
          <input
            type="text"
            placeholder="Tìm kiếm món ăn..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="menu-filters">
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
            <option value="">Tất cả danh mục</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="">Tất cả trạng thái</option>
            <option value="available">Còn món</option>
            <option value="unavailable">Hết món</option>
            <option value="hidden">Ẩn</option>
          </select>
        </div>
        <div className="menu-actions">
          <button className="menu-btn menu-btn--secondary" onClick={() => setShowCategoryManager(true)}>
            <Folder size={16} /> Danh mục
          </button>
          <button className="menu-btn menu-btn--primary" onClick={handleCreateItem}>
            <Plus size={16} /> Thêm món
          </button>
        </div>
      </div>

      {/* Error */}
      {error && <div className="menu-alert menu-alert--error">{error}</div>}

      {/* Content */}
      <div className="menu-content">
        {loading ? (
          <div className="menu-loading">
            <div className="menu-spinner" />
            <p>Đang tải dữ liệu...</p>
          </div>
        ) : items.length > 0 ? (
          <div className="menu-grid">
            {items.map((item) => (
              <MenuItemCard
                key={item.id}
                item={item}
                onEdit={handleEditItem}
                onDelete={handleDeleteClick}
                onToggle={handleToggleAvailability}
              />
            ))}
          </div>
        ) : (
          <div className="menu-empty-state">
            <Utensils size={48} />
            <h3>Chưa có món ăn nào</h3>
            <p>Bắt đầu thêm món ăn cho nhà hàng của bạn</p>
            <button className="menu-btn menu-btn--primary" onClick={handleCreateItem}>
              <Plus size={16} /> Thêm món đầu tiên
            </button>
          </div>
        )}
      </div>

      {/* Menu Item Form Modal */}
      {showForm && (
        <MenuItemForm
          item={editingItem}
          categories={categories}
          onSubmit={handleFormSubmit}
          onClose={() => { setShowForm(false); setEditingItem(null); }}
        />
      )}

      {/* Category Manager Modal */}
      {showCategoryManager && (
        <MenuCategoryManager
          restaurantId={selectedRestaurantId}
          categories={categories}
          onClose={() => { setShowCategoryManager(false); fetchData(); }}
        />
      )}

      {/* Delete Confirm Modal */}
      {deleteModal.open && (
        <div className="menu-modal-overlay" onClick={() => setDeleteModal({ open: false, item: null })}>
          <div className="menu-modal menu-modal--delete" onClick={(e) => e.stopPropagation()}>
            <h3>Xác nhận xóa</h3>
            <p>Bạn có chắc muốn xóa món <strong>{deleteModal.item?.name}</strong>?</p>
            <div className="menu-modal-actions">
              <button className="menu-btn menu-btn--ghost" onClick={() => setDeleteModal({ open: false, item: null })}>Hủy</button>
              <button className="menu-btn menu-btn--danger" onClick={handleDeleteConfirm}>Xóa</button>
            </div>
          </div>
        </div>
      )}
    </OwnerLayout>
  );
}
