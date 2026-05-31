import { useState, useEffect, useRef } from 'react';
import { getAvailableTablesForBooking, changeTable } from '../../api/bookingApi';
import { X, Users, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import './ChangeTableModal.css';

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
    <div className="owner-modal-overlay" onMouseDown={onClose}>
      <div
        ref={modalRef}
        className="owner-modal owner-modal--change-table"
        role="dialog"
        aria-modal="true"
        aria-labelledby="change-table-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h4 id="change-table-modal-title">🪑 Thay đổi bàn ăn cho đơn đặt</h4>
          <button className="close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <p className="current-tables-desc">
              Bàn hiện tại: <strong>{currentTables.join(', ') || 'Chưa gán bàn'}</strong>
            </p>

            {loading ? (
              <div className="modal-loading-state">
                <div className="spinner"></div>
                <p>Đang kiểm tra bàn trống...</p>
              </div>
            ) : availableTables.length === 0 ? (
              <div className="modal-empty-state">
                <p className="text-danger">Không còn bàn trống nào phù hợp cho khung giờ này!</p>
              </div>
            ) : (
              <div className="available-tables-selection-grid">
                {availableTables.map((table) => {
                  const isChecked = selectedTables.includes(table.tableNumber);
                  return (
                    <div
                      key={table.id}
                      className={`selectable-table-option-card ${isChecked ? 'active' : ''}`}
                      onClick={() => handleTableToggle(table.tableNumber)}
                    >
                      <div className="card-top">
                        <span className="table-name">Bàn {table.tableNumber}</span>
                        {isChecked && <Check size={16} className="checked-icon" />}
                      </div>
                      <div className="card-bottom">
                        <span className="capacity-badge">
                          <Users size={12} /> {table.capacity} chỗ
                        </span>
                        {table.zone && <span className="zone-badge">{table.zone}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={isSubmitting}>
              Quay lại
            </button>
            <button
              type="submit"
              className="btn btn-primary-blue"
              disabled={loading || selectedTables.length === 0 || isSubmitting}
            >
              {isSubmitting ? 'Đang cập nhật...' : 'Xác nhận đổi bàn'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
