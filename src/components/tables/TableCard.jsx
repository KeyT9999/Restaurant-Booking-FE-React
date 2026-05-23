import { Edit, Trash2, Users, MapPin, DollarSign, FileText } from 'lucide-react';

const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '0₫';
  return new Intl.NumberFormat('vi-VN').format(amount) + '₫';
};

export default function TableCard({ table, onEdit, onDelete, onStatusChange, statusOptions }) {
  const currentStatusOption = statusOptions.find(opt => opt.value === table.status) || {
    label: table.status,
    color: '#94a3b8'
  };

  return (
    <div className={`table-card table-card--${table.status}`}>
      <div className="table-card-header">
        <h3 className="table-card-number">{table.tableNumber}</h3>
        <span 
          className="table-card-status-badge"
          style={{ backgroundColor: `${currentStatusOption.color}20`, color: currentStatusOption.color }}
        >
          {currentStatusOption.label}
        </span>
      </div>

      <div className="table-card-body">
        <div className="table-card-info-item">
          <Users size={16} />
          <span>Sức chứa: <strong>{table.capacity}</strong> người</span>
        </div>

        {table.zone && (
          <div className="table-card-info-item">
            <MapPin size={16} />
            <span>Khu vực: <strong>{table.zone}</strong></span>
          </div>
        )}

        {table.depositAmount > 0 && (
          <div className="table-card-info-item text-amber">
            <DollarSign size={16} />
            <span>Đặt cọc: <strong>{formatCurrency(table.depositAmount)}</strong></span>
          </div>
        )}

        {table.note && (
          <div className="table-card-info-item table-card-note">
            <FileText size={14} />
            <span>{table.note}</span>
          </div>
        )}
      </div>

      <div className="table-card-actions">
        <div className="table-status-select-wrapper">
          <select
            value={table.status}
            onChange={(e) => onStatusChange(table, e.target.value)}
            className="table-status-select"
            style={{ borderColor: currentStatusOption.color }}
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        
        <div className="table-card-buttons">
          <button className="table-action-btn" onClick={() => onEdit(table)} title="Chỉnh sửa">
            <Edit size={15} />
          </button>
          <button className="table-action-btn table-action-btn--danger" onClick={() => onDelete(table)} title="Xóa">
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
