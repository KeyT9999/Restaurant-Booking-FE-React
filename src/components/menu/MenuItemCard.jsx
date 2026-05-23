import { Edit, Trash2, ToggleLeft, ToggleRight, Clock, Tag } from 'lucide-react';

const formatCurrency = (price) => {
  if (!price && price !== 0) return '0₫';
  return new Intl.NumberFormat('vi-VN').format(price) + '₫';
};

export default function MenuItemCard({ item, onEdit, onDelete, onToggle }) {
  return (
    <div className={`menu-item-card ${!item.isAvailable ? 'menu-item-card--unavailable' : ''}`}>
      <div className="menu-item-image">
        {item.image ? (
          <img src={item.image} alt={item.name} />
        ) : (
          <div className="menu-item-placeholder">🍽️</div>
        )}
        <span className={`menu-item-badge ${item.isAvailable ? 'menu-item-badge--available' : 'menu-item-badge--unavailable'}`}>
          {item.isAvailable ? 'Còn món' : 'Hết món'}
        </span>
      </div>

      <div className="menu-item-body">
        <h3 className="menu-item-name">{item.name}</h3>

        {item.categoryName && (
          <span className="menu-item-category">{item.categoryName}</span>
        )}

        {item.description && (
          <p className="menu-item-desc">{item.description}</p>
        )}

        <div className="menu-item-meta">
          <span className="menu-item-price">{formatCurrency(item.price)}</span>
          {item.preparationTime && (
            <span className="menu-item-prep">
              <Clock size={12} /> {item.preparationTime} phút
            </span>
          )}
        </div>

        {item.tags && item.tags.length > 0 && (
          <div className="menu-item-tags">
            {item.tags.map((tag, i) => (
              <span key={i} className="menu-item-tag">
                <Tag size={10} /> {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="menu-item-actions">
        <button
          className="menu-icon-btn menu-icon-btn--toggle"
          onClick={() => onToggle(item)}
          title={item.isAvailable ? 'Tắt món' : 'Bật món'}
        >
          {item.isAvailable ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
        </button>
        <button className="menu-icon-btn" onClick={() => onEdit(item)} title="Chỉnh sửa">
          <Edit size={16} />
        </button>
        <button className="menu-icon-btn menu-icon-btn--danger" onClick={() => onDelete(item)} title="Xóa">
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
