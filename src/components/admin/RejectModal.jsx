import React, { useState } from 'react';

export default function RejectModal({ isOpen, restaurant, onConfirm, onClose, loading }) {
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
        <h3>Từ chối nhà hàng</h3>
        <p>Từ chối phê duyệt cho nhà hàng <strong>{restaurant.name}</strong>.</p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', color: 'var(--color-aged-parchment)' }}>Lý do từ chối *</label>
            <textarea
              className="modal-input"
              rows="4"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Nhập lý do từ chối (tối thiểu 10 ký tự)..."
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
              {loading ? 'Đang xử lý...' : 'Từ chối duyệt'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
