import React from 'react';

export default function UnsuspendModal({ isOpen, restaurant, onConfirm, onClose, loading }) {
  if (!isOpen || !restaurant) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h3>Gỡ tạm ngưng nhà hàng</h3>
        <p>Bạn có chắc muốn gỡ tạm ngưng và khôi phục hoạt động cho nhà hàng <strong>{restaurant.name}</strong>?</p>
        <p className="modal-hint" style={{ marginTop: '8px' }}>Nhà hàng sẽ tiếp tục được hiển thị công khai và nhận đặt bàn.</p>
        
        <div className="modal-actions">
          <button type="button" className="btn-cancel" onClick={onClose} disabled={loading}>
            Hủy
          </button>
          <button 
            type="button" 
            className="btn-primary" 
            onClick={() => onConfirm(restaurant.id)}
            disabled={loading}
          >
            {loading ? 'Đang xử lý...' : 'Xác nhận'}
          </button>
        </div>
      </div>
    </div>
  );
}
