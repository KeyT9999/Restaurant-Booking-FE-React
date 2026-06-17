import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Folder, Plus, Search, Utensils, AlertCircle } from 'lucide-react';
import OwnerLayout from '../../components/owner/OwnerLayout';
import { useRestaurantContext } from '../../context/useRestaurantContext';
import * as menuApi from '../../api/menuApi';
import MenuCategoryManager from '../../components/menu/MenuCategoryManager';
import MenuItemCard from '../../components/menu/MenuItemCard';
import MenuItemForm from '../../components/menu/MenuItemForm';
import { Button } from '../../components/ui/button';

export default function MenuPage() {
  const { selectedRestaurantId, isRestaurantReady } = useRestaurantContext();

  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      setError(err.message || 'Không thể tải dữ liệu thực đơn');
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
        toast.success('Cập nhật món ăn thành công!');
      } else {
        await menuApi.createMenuItem(selectedRestaurantId, data);
        toast.success('Thêm món ăn thành công!');
      }
      setShowForm(false);
      setEditingItem(null);
      fetchData();
    } catch (err) {
      toast.error(err.message || 'Có lỗi xảy ra');
    }
  };

  const handleDeleteClick = (item) => setDeleteModal({ open: true, item });
  const handleDeleteConfirm = async () => {
    if (!deleteModal.item) return;
    try {
      await menuApi.deleteMenuItem(deleteModal.item.id);
      toast.success('Xóa món ăn thành công!');
      setDeleteModal({ open: false, item: null });
      fetchData();
    } catch (err) {
      toast.error(err.message || 'Không thể xóa món ăn');
      setDeleteModal({ open: false, item: null });
    }
  };

  const handleToggleAvailability = async (item) => {
    try {
      await menuApi.toggleMenuItemAvailability(item.id, !item.isAvailable);
      toast.success(item.isAvailable ? 'Đã tạm ngưng bán món này!' : 'Đã mở bán lại món này!');
      fetchData();
    } catch (err) {
      toast.error(err.message || 'Có lỗi xảy ra');
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
      <OwnerLayout title="Quản lý Thực đơn" subtitle="Quản lý các món ăn, đồ uống trong thực đơn nhà hàng">
        <div className="flex flex-col items-center justify-center p-12 border border-dashed border-border/40 bg-card/10 rounded-2xl text-center max-w-lg mx-auto my-10">
          <Utensils size={48} className="text-muted-foreground/60 mb-4 animate-pulse" />
          <p className="text-sm text-muted-foreground">Vui lòng chọn nhà hàng ở thanh bên để quản lý thực đơn.</p>
        </div>
      </OwnerLayout>
    );
  }

  return (
    <OwnerLayout title="Quản lý Thực đơn" subtitle="Thiết lập danh mục, thông tin món ăn và điều chỉnh trạng thái phục vụ">
      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-card border border-border rounded-xl p-4 flex flex-col justify-between hover:border-primary/30 transition-all text-left">
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Tổng số món</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-bold text-white">{stats.total}</span>
            <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400"><Utensils size={16} /></span>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 flex flex-col justify-between hover:border-emerald-500/30 transition-all text-left">
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Đang phục vụ</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-bold text-emerald-500">{stats.available}</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 flex flex-col justify-between hover:border-amber-500/30 transition-all text-left">
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Tạm ngưng</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-bold text-amber-550">{stats.unavailable}</span>
            <span className="w-2 h-2 rounded-full bg-amber-500" />
          </div>
        </div>
      </div>

      {/* Toolbar Filter & Create */}
      <div className="bg-card border border-border rounded-xl p-4 mb-6 flex flex-col lg:flex-row gap-3 items-center justify-between">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto flex-1">
          {/* Tìm kiếm */}
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Tìm kiếm món ăn..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-[#0F1115] border border-border text-white text-xs rounded-lg pl-9 pr-3 py-2 focus:ring-primary focus:border-primary focus:outline-none h-9 w-full"
              aria-label="Tìm kiếm món ăn"
            />
          </div>

          {/* Lọc danh mục */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-[#0F1115] border border-border text-white text-xs rounded-lg px-3 py-2 focus:ring-primary focus:border-primary focus:outline-none h-9 w-full sm:w-[160px] cursor-pointer"
            aria-label="Lọc danh mục"
          >
            <option value="">Tất cả danh mục</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          {/* Lọc trạng thái */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-[#0F1115] border border-border text-white text-xs rounded-lg px-3 py-2 focus:ring-primary focus:border-primary focus:outline-none h-9 w-full sm:w-[160px] cursor-pointer"
            aria-label="Lọc trạng thái"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="available">Đang phục vụ</option>
            <option value="unavailable">Tạm ngưng phục vụ</option>
            <option value="hidden">Ẩn</option>
          </select>
        </div>

        <div className="flex items-center gap-2.5 w-full lg:w-auto shrink-0 mt-2 lg:mt-0 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowCategoryManager(true)}
            className="border-border hover:bg-secondary/40 text-xs h-9 gap-1.5 flex-1 lg:flex-none"
          >
            <Folder size={14} /> Quản lý danh mục
          </Button>
          <Button
            type="button"
            variant="default"
            onClick={handleCreateItem}
            className="bg-primary hover:bg-primary/95 text-black font-semibold text-xs h-9 gap-1.5 flex-1 lg:flex-none"
          >
            <Plus size={14} /> Thêm món mới
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 rounded-xl border border-destructive/25 bg-destructive/10 text-destructive text-sm leading-relaxed flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Menu List */}
      <div>
        {loading ? (
          <div className="p-20 text-center text-sm text-muted-foreground flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p>Đang tải thực đơn...</p>
          </div>
        ) : items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
          <div className="flex flex-col items-center justify-center p-12 border border-dashed border-border/40 bg-card/10 rounded-2xl text-center max-w-lg mx-auto my-10">
            <Utensils size={48} className="text-primary/70 mb-4 animate-pulse" />
            <h3 className="font-serif text-lg font-bold text-white mb-2">Chưa có món ăn nào</h3>
            <p className="text-xs text-muted-foreground mb-4">Bắt đầu thiết lập thực đơn phục vụ thực khách.</p>
            <Button
              type="button"
              variant="default"
              onClick={handleCreateItem}
              className="bg-primary hover:bg-primary/95 text-black font-semibold text-xs h-9"
            >
              <Plus size={14} className="mr-1" /> Thêm món ăn đầu tiên
            </Button>
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
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" 
          onClick={() => setDeleteModal({ open: false, item: null })}
        >
          <div 
            className="relative w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 text-center"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Xác nhận xóa món ăn"
          >
            <h3 className="font-serif text-lg font-bold text-white mb-2">Xác nhận xóa</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Bạn có chắc chắn muốn xóa món ăn <strong>{deleteModal.item?.name}</strong> không? Hành động này không thể hoàn tác.
            </p>
            <div className="flex justify-center items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeleteModal({ open: false, item: null })}
                className="border-border hover:bg-secondary/40 text-xs h-9"
              >
                Hủy
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDeleteConfirm}
                className="text-xs h-9"
              >
                Xóa
              </Button>
            </div>
          </div>
        </div>
      )}
    </OwnerLayout>
  );
}
