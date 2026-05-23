import React, { useState } from 'react';

export default function ApproveModal({ isOpen, restaurant, onConfirm, onClose, loading }) {
  const [commissionRate, setCommissionRate] = useState(10);

  if (!isOpen || !restaurant) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(restaurant.id, commissionRate);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h3>Duyệt nhà hàng</h3>
        <p>Bạn có chắc chắn muốn phê duyệt hoạt động cho nhà hàng <strong>{restaurant.name}</strong>?</p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', color: 'var(--color-aged-parchment)' }}>Tỷ lệ hoa hồng (%) *</label>
            <input
              type="number"
              min="0"
              max="100"
              className="modal-input"
              value={commissionRate}
              onChange={(e) => setCommissionRate(Math.max(0, Math.min(100, Number(e.target.value))))}
              required
              style={{ margin: 0 }}
            />
            <span className="modal-hint" style={{ fontSize: '11px', opacity: 0.6 }}>Thiết lập phần trăm hoa hồng thu từ đặt bàn (mặc định 10%).</span>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={loading}>
              Hủy
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Đang xử lý...' : 'Xác nhận duyệt'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
