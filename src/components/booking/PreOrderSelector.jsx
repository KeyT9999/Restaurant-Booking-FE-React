import { useEffect, useState } from 'react';
import { Plus, Minus, ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';
import { updatePreOrder } from '../../api/bookingApi';
import { getPublicMenu } from '../../api/menuApi';
import './PreOrderSelector.css';

const getMenuItemId = (item) => item?.id || item?._id || null;

export default function PreOrderSelector({ restaurantId, bookingId, onUpdate, onChange }) {
  const [menuItems, setMenuItems] = useState([]);
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
          setMenuItems(Array.isArray(items) ? items : []);
        }
      } catch {
        if (!ignore) {
          setMenuItems([]);
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

      const quantity = Math.max(1, (prev[itemId].quantity || 1) + delta);
      const next = {
        ...prev,
        [itemId]: {
          ...prev[itemId],
          quantity,
        },
      };

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

  return (
    <div className="preorder-container">
      <div className="preorder-header">
        <h3><ShoppingCart size={16} /> Đặt món trước</h3>
        {selectedCount > 0 && <span className="preorder-count">{selectedCount} món</span>}
      </div>

      <div className="preorder-items">
        {menuItems.length === 0 && (
          <p className="preorder-empty">Nhà hàng chưa có thực đơn</p>
        )}

        {menuItems.map((item) => {
          const itemId = getMenuItemId(item);
          if (!itemId) return null;

          return (
            <div key={itemId} className={`preorder-item ${selected[itemId] ? 'selected' : ''}`}>
              <div className="preorder-item-info" onClick={() => toggleItem(item)}>
                <span className="preorder-item-name">{item.name}</span>
                <span className="preorder-item-price">
                  {(item.price ?? 0) > 0 ? `${item.price.toLocaleString('vi-VN')}đ` : 'Liên hệ'}
                </span>
              </div>

              {selected[itemId] && (
                <div className="preorder-qty-controls">
                  <button onClick={() => updateQty(itemId, -1)} disabled={selected[itemId].quantity <= 1}>
                    <Minus size={14} />
                  </button>
                  <span>{selected[itemId].quantity}</span>
                  <button onClick={() => updateQty(itemId, 1)}>
                    <Plus size={14} />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selectedCount > 0 && (
        <div className="preorder-footer">
          <div className="preorder-total">
            <span>Tạm tính:</span>
            <strong>{totalAmount.toLocaleString('vi-VN')}đ</strong>
          </div>

          {bookingId ? (
            <button className="preorder-save-btn" onClick={handleSave} disabled={saving}>
              {saving ? 'Đang lưu...' : 'Xác nhận đặt món trước'}
            </button>
          ) : (
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#9ca3af' }}>
              Món đã chọn sẽ được gửi cùng yêu cầu đặt bàn của bạn.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
