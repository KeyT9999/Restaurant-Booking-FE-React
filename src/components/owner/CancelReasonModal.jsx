import { useState, useEffect, useRef } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/button';

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
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" 
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 text-left"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cancel-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
          <h4 id="cancel-modal-title" className="text-rose-500 flex items-center gap-2 font-serif text-base font-bold">
            <AlertTriangle size={18} /> Từ chối / Hủy đặt bàn
          </h4>
          <button 
            type="button"
            className="text-muted-foreground hover:text-white transition rounded-lg p-1 hover:bg-secondary/40" 
            onClick={onClose}
            aria-label="Đóng"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Bạn đang thực hiện hủy đơn đặt bàn của khách hàng{' '}
            <strong className="text-white">{bookingInfo?.name}</strong>. Hành động này sẽ tự động gửi thông báo và email hủy đến cho khách hàng.
          </p>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Lý do hủy đặt bàn (Bắt buộc):</label>
            <textarea
              className="w-full bg-[#0F1115] border border-border text-white text-sm rounded-xl p-3 focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none transition-all resize-y min-h-[90px]"
              rows="3"
              placeholder="Nhập lý do chi tiết (ví dụ: hết bàn, nhà hàng sửa chữa)..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              maxLength="200"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-border pt-4 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-border hover:bg-secondary/40 text-xs h-9"
            >
              Quay lại
            </Button>
            <Button
              type="submit"
              variant="destructive"
              className="text-xs h-9"
              disabled={!reason.trim()}
            >
              Xác nhận hủy đặt bàn
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
