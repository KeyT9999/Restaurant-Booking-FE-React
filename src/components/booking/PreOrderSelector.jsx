import { useState, useEffect } from 'react';
import { getPublicMenu } from '../../api/menuApi';
import { updatePreOrder } from '../../api/bookingApi';
import { Plus, Minus, ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';
import './PreOrderSelector.css';

export default function PreOrderSelector({ restaurantId, bookingId, onUpdate, onChange }) {
  const [menuItems, setMenuItems] = useState([]);
  const [selected, setSelected] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await getPublicMenu(restaurantId);
        if (res.success) {
          const items = res.data?.items || [];
          setMenuItems(Array.isArray(items) ? items : []);
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    })();
  }, [restaurantId]);

  const getItemsArray = (sel) => Object.values(sel).map((s) => ({
    menuItemId: s.id,
    nameSnapshot: s.name,
    priceSnapshot: s.price ?? 0,
    quantity: s.quantity,
    note: null,
  }));

  const toggleItem = (item) => {
    setSelected((prev) => {
      const next = { ...prev };
      if (next[item.id]) {
        delete next[item.id];
      } else {
        next[item.id] = { ...item, quantity: 1 };
      }
      onChange?.(getItemsArray(next));
      return next;
    });
  };

  const updateQty = (id, delta) => {
    setSelected((prev) => {
      if (!prev[id]) return prev;
      const qty = Math.max(1, (prev[id].quantity || 1) + delta);
      const next = { ...prev, [id]: { ...prev[id], quantity: qty } };
      onChange?.(getItemsArray(next));
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const items = Object.values(selected).map((s) => ({
        menuItemId: s._id,
        name: s.name,
        price: s.price,
        quantity: s.quantity,
      }));
      const res = await updatePreOrder(bookingId, items);
      if (res.success) {
        toast.success('Đặt món trước thành công');
        onUpdate?.(items);
      } else {
        toast.error(res.message || 'Lưu thất bại');
      }
    } catch (err) {
      toast.error('Lỗi khi lưu món đặt trước');
    } finally {
      setSaving(false);
    }
  };

  const totalAmount = Object.values(selected).reduce((sum, s) => sum + (s.price || 0) * s.quantity, 0);
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
        {menuItems.map((item) => (
          <div key={item._id} className={`preorder-item ${selected[item._id] ? 'selected' : ''}`}>
            <div className="preorder-item-info" onClick={() => toggleItem(item)}>
              <span className="preorder-item-name">{item.name}</span>
              <span className="preorder-item-price">{(item.price ?? 0) > 0 ? `${(item.price).toLocaleString('vi-VN')}đ` : 'Liên hệ'}</span>
            </div>
            {selected[item._id] && (
              <div className="preorder-qty-controls">
                <button onClick={() => updateQty(item._id, -1)} disabled={selected[item._id].quantity <= 1}>
                  <Minus size={14} />
                </button>
                <span>{selected[item._id].quantity}</span>
                <button onClick={() => updateQty(item._id, 1)}>
                  <Plus size={14} />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {selectedCount > 0 && (
        <div className="preorder-footer">
          <div className="preorder-total">
            <span>Tạm tính:</span>
            <strong>{totalAmount.toLocaleString('vi-VN')}đ</strong>
          </div>
          <button className="preorder-save-btn" onClick={handleSave} disabled={saving}>
            {saving ? 'Đang lưu...' : 'Xác nhận đặt món trước'}
          </button>
        </div>
      )}
    </div>
  );
}
