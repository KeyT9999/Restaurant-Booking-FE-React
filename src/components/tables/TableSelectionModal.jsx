import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import BookingTableCard from './BookingTableCard';
import './TableSelectionModal.css';

export default function TableSelectionModal({
  isOpen,
  onClose,
  tables = [],
  suggestedTables = [],
  selectedTables = [],
  onConfirm,
  numberOfGuests,
}) {
  const [selected, setSelected] = useState([]);
  const [zoneFilter, setZoneFilter] = useState('all');

  // Sync initial selected tables
  useEffect(() => {
    if (!isOpen) return undefined;

    const timeoutId = window.setTimeout(() => {
      setSelected(selectedTables);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [isOpen, selectedTables]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Extract unique zones from tables
  const zones = ['all', ...new Set(tables.map(t => t.zone).filter(Boolean))];

  const handleTableSelect = (table) => {
    const isAlreadySelected = selected.some(t => t.id === table.id);
    if (isAlreadySelected) {
      setSelected(selected.filter(t => t.id !== table.id));
    } else {
      setSelected([...selected, table]);
    }
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm(selected);
    }
    onClose();
  };

  const filteredTables = tables.filter(t => {
    if (zoneFilter !== 'all' && t.zone !== zoneFilter) return false;
    return true;
  });

  const totalCapacity = selected.reduce((sum, t) => sum + t.capacity, 0);
  const capacityMet = totalCapacity >= numberOfGuests;

  return (
    <div className="table-selection-modal-overlay" onMouseDown={onClose}>
      <div
        className="table-selection-modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="table-selection-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="table-modal-header">
          <h3 id="table-selection-title">🪑 Chọn bàn ăn phù hợp</h3>
          <button type="button" className="table-modal-close" onClick={onClose} aria-label="Đóng cửa sổ chọn bàn">
            <X size={20} />
          </button>
        </div>

        <div className="table-modal-info-bar">
          <div className="guest-info">
            Số khách: <strong>{numberOfGuests} người</strong>
          </div>
          <div className={`capacity-info ${capacityMet ? 'met' : 'insufficient'}`}>
            Đã chọn: <strong>{totalCapacity} chỗ</strong> {capacityMet ? '✓ Đủ sức chứa' : `(Cần thêm ít nhất ${numberOfGuests - totalCapacity} chỗ)`}
          </div>
        </div>

        {/* Filter bar */}
        <div className="table-modal-filter-bar" style={{ padding: 'var(--spacing-12) var(--spacing-20)', borderBottom: '1px solid var(--border-dimmed)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label htmlFor="modal-zone-filter" style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-faded-stone)' }}>Khu vực:</label>
          <select
            id="modal-zone-filter"
            value={zoneFilter}
            onChange={(e) => setZoneFilter(e.target.value)}
            className="form-control"
            style={{ padding: '6px 10px', fontSize: 'var(--text-body-sm)' }}
          >
            {zones.map(z => (
              <option key={z} value={z}>
                {z === 'all' ? 'Tất cả khu vực' : z}
              </option>
            ))}
          </select>
        </div>

        <div className="table-modal-body">
          {filteredTables.length === 0 ? (
            <div className="modal-empty-state">
              <p>Không có bàn nào trống phù hợp với bộ lọc hiện tại.</p>
            </div>
          ) : (
            <div className="tables-grid">
              {filteredTables.map((table) => {
                const isSelected = selected.some(t => t.id === table.id);
                const isSuggested = suggestedTables.some(t => t.tableNumber === table.tableNumber);

                return (
                  <BookingTableCard
                    key={table.id}
                    table={table}
                    isSelected={isSelected}
                    isSuggested={isSuggested}
                    onSelect={handleTableSelect}
                  />
                );
              })}
            </div>
          )}
        </div>

        <div className="table-modal-footer">
          <button type="button" className="btn btn-outline" onClick={onClose} aria-label="Bỏ qua, tự động xếp bàn">
            Bỏ qua / Tự động xếp bàn
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleConfirm}
            disabled={selected.length > 0 && !capacityMet}
            aria-label={`Xác nhận chọn ${selected.length} bàn`}
          >
            Xác nhận chọn {selected.length} bàn
          </button>
        </div>
      </div>
    </div>
  );
}
