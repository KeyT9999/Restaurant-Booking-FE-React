import { useEffect, useState } from 'react';
import { Plus, Minus, ShoppingCart, Utensils } from 'lucide-react';
import toast from 'react-hot-toast';
import { updatePreOrder } from '../../api/bookingApi';
import { getPublicMenu } from '../../api/menuApi';
import './PreOrderSelector.css';

const getMenuItemId = (item) => item?.id || item?._id || null;

export default function PreOrderSelector({ restaurantId, bookingId, onUpdate, onChange }) {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selected, setSelected] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let ignore = false;

    const loadMenu = async () => {
      try {
        const res = await getPublicMenu(restaurantId);
        if (!ignore && res.success) {
          const items = res.data?.items || [];
          const cats = res.data?.categories || [];
          setMenuItems(Array.isArray(items) ? items : []);
          setCategories(Array.isArray(cats) ? cats : []);
        }
      } catch {
        if (!ignore) {
          setMenuItems([]);
          setCategories([]);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    setLoading(true);
    void loadMenu();

    return () => {
      ignore = true;
    };
  }, [restaurantId]);

  const getItemsArray = (selection) => (
    Object.values(selection)
      .map((item) => ({
        menuItemId: getMenuItemId(item),
        nameSnapshot: item.name,
        priceSnapshot: item.price ?? 0,
        quantity: item.quantity,
        note: null,
      }))
      .filter((item) => item.menuItemId)
  );

  const toggleItem = (item) => {
    const itemId = getMenuItemId(item);
    if (!itemId) return;

    setSelected((prev) => {
      const next = { ...prev };
      if (next[itemId]) {
        delete next[itemId];
      } else {
        next[itemId] = { ...item, id: itemId, quantity: 1 };
      }
      onChange?.(getItemsArray(next));
      return next;
    });
  };

  const updateQty = (itemId, delta) => {
    setSelected((prev) => {
      if (!prev[itemId]) return prev;

      const newQty = (prev[itemId].quantity || 1) + delta;
      const next = { ...prev };
      if (newQty <= 0) {
        delete next[itemId];
      } else {
        next[itemId] = {
          ...prev[itemId],
          quantity: newQty,
        };
      }

      onChange?.(getItemsArray(next));
      return next;
    });
  };

  const handleSave = async () => {
    if (!bookingId) return;

    setSaving(true);
    try {
      const items = Object.values(selected)
        .map((item) => ({
          menuItemId: getMenuItemId(item),
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        }))
        .filter((item) => item.menuItemId);

      const res = await updatePreOrder(bookingId, items);
      if (res.success) {
        toast.success('Đặt món trước thành công');
        onUpdate?.(items);
      } else {
        toast.error(res.message || 'Lưu thất bại');
      }
    } catch {
      toast.error('Lỗi khi lưu món đặt trước');
    } finally {
      setSaving(false);
    }
  };

  const totalAmount = Object.values(selected).reduce(
    (sum, item) => sum + (item.price || 0) * item.quantity,
    0
  );
  const selectedCount = Object.keys(selected).length;

  if (loading) {
    return <div className="preorder-loading">Đang tải thực đơn...</div>;
  }

  const renderItemCard = (item) => {
    const itemId = getMenuItemId(item);
    if (!itemId) return null;
    const isItemSelected = !!selected[itemId];
    const qty = selected[itemId]?.quantity || 0;

    return (
      <div key={itemId} className={`preorder-item-card ${isItemSelected ? 'selected' : ''}`}>
        <div className="preorder-item-image-container" onClick={() => toggleItem(item)}>
          {item.image ? (
            <img src={item.image} alt={item.name} className="preorder-item-image" />
          ) : (
            <div className="preorder-item-image-placeholder">
              <Utensils size={20} />
            </div>
          )}
          {qty > 0 && <span className="preorder-item-badge">{qty}</span>}
        </div>

        <div className="preorder-item-content">
          <div className="preorder-item-info-zone" onClick={() => toggleItem(item)}>
            <div className="preorder-item-header-row">
              <span className="preorder-item-name" title={item.name}>{item.name}</span>
              {item.tags && item.tags.length > 0 && (
                <span className="preorder-item-tag">{item.tags[0]}</span>
              )}
            </div>
            {item.description && (
              <p className="preorder-item-description" title={item.description}>
                {item.description}
              </p>
            )}
          </div>

          <div className="preorder-item-footer-row">
            <span className="preorder-item-price">
              {(item.price ?? 0) > 0 ? `${item.price.toLocaleString('vi-VN')}đ` : 'Liên hệ'}
            </span>

            <div className="preorder-item-action-zone">
              {isItemSelected ? (
                <div className="preorder-quantity-selector">
                  <button 
                    className="preorder-qty-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      updateQty(itemId, -1);
                    }}
                  >
                    <Minus size={12} />
                  </button>
                  <span className="preorder-qty-value">{qty}</span>
                  <button 
                    className="preorder-qty-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      updateQty(itemId, 1);
                    }}
                  >
                    <Plus size={12} />
                  </button>
                </div>
              ) : (
                <button 
                  className="preorder-add-button" 
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleItem(item);
                  }}
                >
                  <Plus size={12} /> Thêm
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="preorder-container">
      <div className="preorder-header">
        <h3><ShoppingCart size={16} /> Đặt món trước</h3>
        {selectedCount > 0 && <span className="preorder-count">{selectedCount} món</span>}
      </div>

      <div className="preorder-items-wrapper">
        {menuItems.length === 0 ? (
          <p className="preorder-empty">Nhà hàng chưa có thực đơn</p>
        ) : (
          <>
            {categories.map((cat) => {
              const catItems = menuItems.filter(
                (item) => item.categoryId === cat.id
              );
              if (catItems.length === 0) return null;

              return (
                <div key={cat.id} className="preorder-category-group">
                  <h4 className="preorder-category-title">{cat.name}</h4>
                  <div className="preorder-category-items">
                    {catItems.map(renderItemCard)}
                  </div>
                </div>
              );
            })}

            {/* Uncategorized items group */}
            {(() => {
              const uncategorized = menuItems.filter(
                (item) =>
                  !item.categoryId ||
                  !categories.some((cat) => cat.id === item.categoryId)
              );
              if (uncategorized.length === 0) return null;

              return (
                <div className="preorder-category-group">
                  <h4 className="preorder-category-title">
                    {categories.length > 0 ? 'Món khác' : 'Thực đơn'}
                  </h4>
                  <div className="preorder-category-items">
                    {uncategorized.map(renderItemCard)}
                  </div>
                </div>
              );
            })()}
          </>
        )}
      </div>

      {selectedCount > 0 && (
        <div className="preorder-footer">
          <div className="preorder-total">
            <span className="preorder-total-label">Tạm tính:</span>
            <strong className="preorder-total-value">{totalAmount.toLocaleString('vi-VN')}đ</strong>
          </div>

          {bookingId ? (
            <button className="preorder-save-btn" onClick={handleSave} disabled={saving}>
              {saving ? 'Đang lưu...' : 'Xác nhận đặt món trước'}
            </button>
          ) : (
            <p className="preorder-note">
              Món đã chọn sẽ được gửi cùng yêu cầu đặt bàn của bạn.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
