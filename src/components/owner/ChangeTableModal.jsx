import { useState, useEffect, useRef } from 'react';
import { getAvailableTablesForBooking, changeTable } from '../../api/bookingApi';
import { X, Users, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '../ui/button';

export default function ChangeTableModal({ isOpen, onClose, bookingId, currentTables = [], onConfirm }) {
  const [availableTables, setAvailableTables] = useState([]);
  const [selectedTables, setSelectedTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

    // Initial focus on close button or first selectable table
    const timeoutId = window.setTimeout(() => {
      const focusable = modalRef.current?.querySelectorAll(
        'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex="0"]'
      );
      if (focusable && focusable.length > 0) {
        focusable[0].focus();
      }
    }, 50);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.clearTimeout(timeoutId);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    const fetchAvailableTables = async () => {
      if (!isOpen || !bookingId) return;
      setLoading(true);
      try {
        const res = await getAvailableTablesForBooking(bookingId);
        if (res.success) {
          setAvailableTables(res.data || []);
        } else {
          toast.error(res.message || 'Lỗi khi kiểm tra bàn trống');
          onClose();
        }
      } catch (err) {
        console.error(err);
        toast.error('Có lỗi xảy ra khi tải danh sách bàn ăn');
        onClose();
      } finally {
        setLoading(false);
      }
    };

    fetchAvailableTables();
  }, [isOpen, bookingId, onClose]);

  if (!isOpen) return null;

  const handleTableToggle = (tableNumber) => {
    if (selectedTables.includes(tableNumber)) {
      setSelectedTables(selectedTables.filter(t => t !== tableNumber));
    } else {
      setSelectedTables([...selectedTables, tableNumber]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedTables.length === 0) {
      toast.error('Vui lòng chọn ít nhất một bàn');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await changeTable(bookingId, selectedTables);
      if (res.success) {
        toast.success('Thay đổi bàn ăn thành công');
        if (onConfirm) onConfirm();
        onClose();
      } else {
        toast.error(res.message || 'Không thể đổi bàn ăn');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Lỗi khi đổi bàn ăn');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" 
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 text-left"
        role="dialog"
        aria-modal="true"
        aria-labelledby="change-table-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
          <h4 id="change-table-modal-title" className="text-white flex items-center gap-2 font-serif text-base font-bold">
            🪑 Thay đổi bàn ăn cho đơn đặt
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
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Bàn hiện tại: <strong className="text-white">{currentTables.join(', ') || 'Chưa gán bàn'}</strong>
            </p>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3 text-sm text-muted-foreground">
                <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                <p>Đang kiểm tra bàn trống...</p>
              </div>
            ) : availableTables.length === 0 ? (
              <div className="py-8 text-center text-rose-400 bg-rose-500/5 border border-rose-500/10 rounded-xl text-sm font-medium">
                Không còn bàn trống nào phù hợp cho khung giờ này!
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {availableTables.map((table) => {
                  const isChecked = selectedTables.includes(table.tableNumber);
                  return (
                    <button
                      type="button"
                      key={table.id}
                      className={`flex flex-col text-left p-3 rounded-xl border transition-all ${
                        isChecked
                          ? 'border-primary bg-primary/10 text-white ring-1 ring-primary'
                          : 'border-border bg-[#0F1115] text-muted-foreground hover:border-border/80 hover:text-white'
                      }`}
                      onClick={() => handleTableToggle(table.tableNumber)}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="font-semibold text-sm text-white">Bàn {table.tableNumber}</span>
                        {isChecked && <Check size={14} className="text-primary" />}
                      </div>
                      <div className="flex flex-col gap-0.5 mt-2 text-[11px]">
                        <span className="flex items-center gap-1">
                          <Users size={12} className="text-muted-foreground/60" /> {table.capacity} chỗ
                        </span>
                        {table.zone && <span className="text-[10px] text-muted-foreground/50 truncate">📍 {table.zone}</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-border pt-4 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="border-border hover:bg-secondary/40 text-xs h-9"
            >
              Quay lại
            </Button>
            <Button
              type="submit"
              variant="default"
              className="bg-primary hover:bg-primary/95 text-black font-semibold text-xs h-9"
              disabled={loading || selectedTables.length === 0 || isSubmitting}
            >
              {isSubmitting ? 'Đang cập nhật...' : 'Xác nhận đổi bàn'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
