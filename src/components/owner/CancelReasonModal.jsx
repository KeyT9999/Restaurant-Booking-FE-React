import { useState, useEffect, useRef } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import './CancelReasonModal.css';

export default function CancelReasonModal({ isOpen, onClose, onConfirm, bookingInfo }) {
  const [reason, setReason] = useState('');
  const modalRef = useRef(null);

  // Focus trap & Escape key handler
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex="0"]'
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Initial focus on the first element (close button or input)
    const timeoutId = window.setTimeout(() => {
      const focusable = modalRef.current?.querySelectorAll(
        'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex="0"]'
      );
      if (focusable && focusable.length > 0) {
        // Focus the textarea instead of the close button for faster typing
        const textarea = modalRef.current.querySelector('textarea');
        if (textarea) textarea.focus();
        else focusable[0].focus();
      }
    }, 50);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.clearTimeout(timeoutId);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason.trim()) return;
    onConfirm(reason);
  };

  return (
    <div className="owner-modal-overlay" onMouseDown={onClose}>
      <div
        ref={modalRef}
        className="owner-modal owner-modal--cancel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cancel-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h4 id="cancel-modal-title" className="text-danger flex items-center gap-2">
            <AlertTriangle size={20} /> Từ chối / Hủy đơn đặt bàn
          </h4>
          <button className="close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <p>
              Bạn đang thực hiện hủy đơn đặt bàn của khách hàng{' '}
              <strong>{bookingInfo?.name}</strong>. Hành động này sẽ gửi thông báo và email hủy đến khách hàng.
            </p>

            <div className="form-group">
              <label className="input-label">Lý do hủy đặt bàn (Bắt buộc):</label>
              <textarea
                className="form-control"
                rows="3"
                placeholder="Nhập lý do chi tiết để khách hàng được biết..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
                maxLength="200"
              ></textarea>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Quay lại
            </button>
            <button
              type="submit"
              className="btn btn-danger"
              disabled={!reason.trim()}
            >
              Xác nhận hủy đặt bàn
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
