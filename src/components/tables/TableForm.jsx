import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';

export default function TableForm({ table, statusOptions, onSubmit, onClose }) {
  const isEdit = !!table;

  const [formData, setFormData] = useState({
    tableNumber: '',
    capacity: 4,
    zone: '',
    status: 'available',
    depositAmount: 0,
    note: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (table) {
      setFormData({
        tableNumber: table.tableNumber || '',
        capacity: table.capacity || 4,
        zone: table.zone || '',
        status: table.status || 'available',
        depositAmount: table.depositAmount || 0,
        note: table.note || ''
      });
    }
  }, [table]);

  const validate = () => {
    const newErrors = {};
    if (!formData.tableNumber.trim()) {
      newErrors.tableNumber = 'Tên hoặc số bàn là bắt buộc';
    } else if (formData.tableNumber.length > 50) {
      newErrors.tableNumber = 'Tên hoặc số bàn tối đa 50 ký tự';
    }

    if (!formData.capacity || formData.capacity <= 0) {
      newErrors.capacity = 'Sức chứa phải lớn hơn 0';
    }

    if (formData.depositAmount < 0) {
      newErrors.depositAmount = 'Tiền đặt cọc không được âm';
    }

    if (formData.note && formData.note.length > 500) {
      newErrors.note = 'Ghi chú tối đa 500 ký tự';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let finalValue = value;
    
    if (type === 'number') {
      finalValue = value === '' ? '' : Number(value);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: finalValue
    }));

    // Clear validation error when typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="table-modal-overlay" onClick={onClose}>
      <div className="table-modal" onClick={(e) => e.stopPropagation()}>
        <div className="table-modal-header">
          <h2>{isEdit ? 'Chỉnh sửa bàn' : 'Thêm bàn mới'}</h2>
          <button className="table-modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="table-form">
          <div className="table-form-row">
            <div className="table-form-group">
              <label className="table-form-label">Tên/Số bàn <span className="required">*</span></label>
              <input
                type="text"
                name="tableNumber"
                value={formData.tableNumber}
                onChange={handleChange}
                placeholder="Ví dụ: Bàn 1, VIP-01"
                className={`table-form-input ${errors.tableNumber ? 'table-form-input--error' : ''}`}
                required
              />
              {errors.tableNumber && <span className="table-form-error">{errors.tableNumber}</span>}
            </div>

            <div className="table-form-group">
              <label className="table-form-label">Sức chứa (người) <span className="required">*</span></label>
              <input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                min="1"
                className={`table-form-input ${errors.capacity ? 'table-form-input--error' : ''}`}
                required
              />
              {errors.capacity && <span className="table-form-error">{errors.capacity}</span>}
            </div>
          </div>

          <div className="table-form-row">
            <div className="table-form-group">
              <label className="table-form-label">Khu vực / Zone</label>
              <input
                type="text"
                name="zone"
                value={formData.zone}
                onChange={handleChange}
                placeholder="Ví dụ: Tầng 1, Ngoài trời, VIP"
                className="table-form-input"
              />
            </div>

            <div className="table-form-group">
              <label className="table-form-label">Trạng thái ban đầu</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="table-form-input"
              >
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="table-form-group">
            <label className="table-form-label">Tiền đặt cọc bàn (VNĐ)</label>
            <input
              type="number"
              name="depositAmount"
              value={formData.depositAmount}
              onChange={handleChange}
              min="0"
              step="1000"
              placeholder="0"
              className={`table-form-input ${errors.depositAmount ? 'table-form-input--error' : ''}`}
            />
            {errors.depositAmount && <span className="table-form-error">{errors.depositAmount}</span>}
            <span className="table-form-hint">Nhập 0 nếu không cần đặt cọc bàn này</span>
          </div>

          <div className="table-form-group">
            <label className="table-form-label">Ghi chú</label>
            <textarea
              name="note"
              value={formData.note}
              onChange={handleChange}
              placeholder="Ví dụ: Cạnh cửa sổ, view hồ..."
              rows="3"
              className={`table-form-textarea ${errors.note ? 'table-form-textarea--error' : ''}`}
            />
            {errors.note && <span className="table-form-error">{errors.note}</span>}
          </div>

          <div className="table-form-actions">
            <button type="button" className="table-btn table-btn--ghost" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="table-btn table-btn--primary">
              <Save size={16} /> Lưu thông tin
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
