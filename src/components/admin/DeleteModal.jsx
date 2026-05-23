import React, { useState } from 'react';

export default function DeleteModal({ isOpen, restaurant, onConfirm, onClose, loading }) {
  const [reason, setReason] = useState('');

  if (!isOpen || !restaurant) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(restaurant.id, reason.trim());
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h3>Xóa nhà hàng</h3>
        <p style={{ color: '#f87171' }}>Cảnh báo: Bạn đang thực hiện xóa nhà hàng <strong>{restaurant.name}</strong>.</p>
        <p className="modal-hint" style={{ marginTop: '8px' }}>Hành động này là soft delete (xóa tạm thời). Bạn vẫn có thể khôi phục lại nhà hàng này từ bộ lọc "Đã xóa".</p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', color: 'var(--color-aged-parchment)' }}>Lý do xóa (không bắt buộc)</label>
            <textarea
              className="modal-input"
              rows="3"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Nhập lý do xóa nhà hàng..."
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
              disabled={loading}
            >
              {loading ? 'Đang xử lý...' : 'Xác nhận xóa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
