import React, { useState, useEffect } from 'react';
import './VoucherFormModal.css';

const VoucherFormModal = ({ isOpen, onClose, onSubmit, voucher }) => {
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    maxDiscountAmount: '',
    minOrderAmount: '0',
    startDate: '',
    endDate: '',
    globalUsageLimit: '',
    perCustomerLimit: '1',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (voucher) {
      setFormData({
        code: voucher.code || '',
        description: voucher.description || '',
        discountType: voucher.discountType || 'percentage',
        discountValue: voucher.discountValue || '',
        maxDiscountAmount: voucher.maxDiscountAmount || '',
        minOrderAmount: voucher.minOrderAmount || '0',
        startDate: voucher.startDate ? new Date(voucher.startDate).toISOString().split('T')[0] : '',
        endDate: voucher.endDate ? new Date(voucher.endDate).toISOString().split('T')[0] : '',
        globalUsageLimit: voucher.globalUsageLimit || '',
        perCustomerLimit: voucher.perCustomerLimit || '1',
      });
    } else {
      setFormData({
        code: '',
        description: '',
        discountType: 'percentage',
        discountValue: '',
        maxDiscountAmount: '',
        minOrderAmount: '0',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        globalUsageLimit: '',
        perCustomerLimit: '1',
      });
    }
    setErrors({});
  }, [voucher, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'code' ? value.toUpperCase().replace(/\s/g, '') : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const tempErrors = {};
    if (!formData.code) tempErrors.code = 'Mã voucher là bắt buộc';
    if (!formData.discountValue || Number(formData.discountValue) <= 0) {
      tempErrors.discountValue = 'Giá trị giảm phải lớn hơn 0';
    }
    if (formData.discountType === 'percentage' && Number(formData.discountValue) > 100) {
      tempErrors.discountValue = 'Giá trị phần trăm không thể lớn hơn 100%';
    }
    if (Number(formData.minOrderAmount) < 0) {
      tempErrors.minOrderAmount = 'Số tiền đơn tối thiểu không thể âm';
    }
    if (formData.endDate && formData.startDate && new Date(formData.endDate) < new Date(formData.startDate)) {
      tempErrors.endDate = 'Ngày kết thúc không thể trước ngày bắt đầu';
    }
    
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    // Trả về data định dạng phù hợp cho API
    const dataToSend = {
      ...formData,
      discountValue: Number(formData.discountValue),
      minOrderAmount: Number(formData.minOrderAmount),
      maxDiscountAmount: formData.maxDiscountAmount ? Number(formData.maxDiscountAmount) : null,
      globalUsageLimit: formData.globalUsageLimit ? Number(formData.globalUsageLimit) : null,
      perCustomerLimit: Number(formData.perCustomerLimit),
      startDate: formData.startDate || null,
      endDate: formData.endDate || null,
    };

    onSubmit(dataToSend);
  };

  return (
    <div className="voucher-modal-overlay">
      <div className="voucher-modal-container">
        <div className="voucher-modal-header">
          <h3 className="voucher-modal-title">
            {voucher ? `Chỉnh sửa Voucher: ${voucher.code}` : 'Tạo ưu đãi Voucher mới'}
          </h3>
          <button className="voucher-modal-close-btn" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="voucher-modal-form">
          <div className="form-group">
            <label className="form-label">Mã Voucher * (Ví dụ: SUMMER50)</label>
            <input
              type="text"
              name="code"
              className={`form-input ${errors.code ? 'input-error' : ''}`}
              value={formData.code}
              onChange={handleChange}
              disabled={!!voucher} // Không cho sửa code khi edit để bảo toàn dữ liệu
              placeholder="Nhập mã viết hoa không dấu"
            />
            {errors.code && <span className="error-text">{errors.code}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Mô tả chương trình khuyến mại</label>
            <textarea
              name="description"
              className="form-textarea"
              value={formData.description}
              onChange={handleChange}
              placeholder="Ví dụ: Giảm giá đặt cọc bàn tiệc nhân dịp hè..."
              maxLength={255}
            />
          </div>

          <div className="form-row">
            <div className="form-group col-6">
              <label className="form-label">Hình thức giảm *</label>
              <select
                name="discountType"
                className="form-input"
                value={formData.discountType}
                onChange={handleChange}
              >
                <option value="percentage">Phần trăm (%)</option>
                <option value="fixed_amount">Số tiền cố định (đ)</option>
              </select>
            </div>

            <div className="form-group col-6">
              <label className="form-label">Mức giảm *</label>
              <input
                type="number"
                name="discountValue"
                className={`form-input ${errors.discountValue ? 'input-error' : ''}`}
                value={formData.discountValue}
                onChange={handleChange}
                placeholder={formData.discountType === 'percentage' ? 'Ví dụ: 15' : 'Ví dụ: 50000'}
              />
              {errors.discountValue && <span className="error-text">{errors.discountValue}</span>}
            </div>
          </div>

          {formData.discountType === 'percentage' && (
            <div className="form-group">
              <label className="form-label">Mức giảm tối đa (đ) - Để trống nếu không giới hạn</label>
              <input
                type="number"
                name="maxDiscountAmount"
                className="form-input"
                value={formData.maxDiscountAmount}
                onChange={handleChange}
                placeholder="Ví dụ: 100000"
              />
            </div>
          )}

          <div className="form-row">
            <div className="form-group col-6">
              <label className="form-label">Đơn đặt tối thiểu (đ)</label>
              <input
                type="number"
                name="minOrderAmount"
                className={`form-input ${errors.minOrderAmount ? 'input-error' : ''}`}
                value={formData.minOrderAmount}
                onChange={handleChange}
                placeholder="Ví dụ: 200000"
              />
              {errors.minOrderAmount && <span className="error-text">{errors.minOrderAmount}</span>}
            </div>

            <div className="form-group col-6">
              <label className="form-label">Lượt dùng tối đa / khách</label>
              <input
                type="number"
                name="perCustomerLimit"
                className="form-input"
                value={formData.perCustomerLimit}
                onChange={handleChange}
                min="1"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group col-6">
              <label className="form-label">Tổng lượt dùng hệ thống (để trống nếu không giới hạn)</label>
              <input
                type="number"
                name="globalUsageLimit"
                className="form-input"
                value={formData.globalUsageLimit}
                onChange={handleChange}
                placeholder="Ví dụ: 100"
              />
            </div>

            <div className="form-group col-6">
              <label className="form-label">Ngày bắt đầu</label>
              <input
                type="date"
                name="startDate"
                className="form-input"
                value={formData.startDate}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Ngày kết thúc (để trống nếu không thời hạn)</label>
            <input
              type="date"
              name="endDate"
              className={`form-input ${errors.endDate ? 'input-error' : ''}`}
              value={formData.endDate}
              onChange={handleChange}
            />
            {errors.endDate && <span className="error-text">{errors.endDate}</span>}
          </div>

          <div className="voucher-modal-actions">
            <button type="button" className="voucher-btn-secondary" onClick={onClose}>
              Hủy bỏ
            </button>
            <button type="submit" className="voucher-btn-primary">
              {voucher ? 'Cập nhật' : 'Tạo mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VoucherFormModal;
