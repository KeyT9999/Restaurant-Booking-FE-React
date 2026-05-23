import React, { useState } from 'react';

export default function SuspendModal({ isOpen, restaurant, onConfirm, onClose, loading }) {
  const [reason, setReason] = useState('');

  if (!isOpen || !restaurant) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (reason.trim().length < 10) return;
    onConfirm(restaurant.id, reason.trim());
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h3>Tạm ngưng nhà hàng</h3>
        <p>Tạm ngưng hoạt động của nhà hàng <strong>{restaurant.name}</strong>. Nhà hàng sẽ bị ẩn khỏi các danh sách tìm kiếm công khai.</p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', color: 'var(--color-aged-parchment)' }}>Lý do tạm ngưng *</label>
            <textarea
              className="modal-input"
              rows="4"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Nhập lý do tạm ngưng (tối thiểu 10 ký tự)..."
              required
              style={{ margin: 0, resize: 'vertical' }}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={loading}>
              Hủy
            </button>
            <button 
              type="submit" 
              className="btn-danger" 
              disabled={loading || reason.trim().length < 10}
            >
              {loading ? 'Đang xử lý...' : 'Tạm ngưng hoạt động'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
