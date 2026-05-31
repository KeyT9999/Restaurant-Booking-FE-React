import { Users, Landmark } from 'lucide-react';
import './BookingTableCard.css';

const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '0₫';
  return new Intl.NumberFormat('vi-VN').format(amount) + '₫';
};

export default function BookingTableCard({
  table,
  isSelected,
  isSuggested,
  onSelect,
}) {
  const { tableNumber, capacity, zone, depositAmount, note } = table;

  const handleClick = () => {
    if (onSelect) {
      onSelect(table);
    }
  };

  return (
    <button
      type="button"
      className={`booking-table-card ${isSelected ? 'selected' : ''} ${
        isSuggested ? 'suggested' : ''
      }`}
      onClick={handleClick}
      aria-pressed={isSelected}
      aria-label={`Chon ban ${tableNumber}, suc chua ${capacity} cho${zone ? `, khu vuc ${zone}` : ''}`}
    >
      {isSuggested && <span className="suggested-badge">💡 Gợi ý</span>}

      <div className="table-header">
        <h4 className="table-number">{tableNumber}</h4>
        {zone && <span className="table-zone-badge">{zone}</span>}
      </div>

      <div className="table-details">
        <div className="table-detail-item">
          <Users size={14} />
          <span>Sức chứa: <strong>{capacity}</strong> chỗ</span>
        </div>

        {depositAmount > 0 && (
          <div className="table-detail-item deposit">
            <Landmark size={14} />
            <span>Cọc: <strong>{formatCurrency(depositAmount)}</strong></span>
          </div>
        )}
      </div>

      {note && <p className="table-note-text">{note}</p>}

      <div className="selection-indicator">
        {isSelected ? '✓ Đã chọn' : 'Chọn bàn'}
      </div>
    </button>
  );
}
