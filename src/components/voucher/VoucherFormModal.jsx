import React, { useState, useEffect } from 'react';
import VoucherCard from './VoucherCard';
import './VoucherFormModal.css';

const VoucherFormModal = ({ isOpen, onClose, onSubmit, voucher }) => {
  const [formData, setFormData] = useState({
    name: '',
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
        name: voucher.name || '',
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
        name: '',
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

  const validateField = (name, value, currentData) => {
    let err = null;
    const data = currentData || formData;
    
    if (name === 'name' && !value) {
      err = 'Tên hiển thị voucher là bắt buộc';
    } else if (name === 'code' && !value) {
      err = 'Mã voucher là bắt buộc';
    } else if (name === 'discountValue') {
      if (!value || Number(value) <= 0) {
        err = 'Giá trị giảm phải lớn hơn 0';
      } else if (data.discountType === 'percentage' && Number(value) > 100) {
        err = 'Phần trăm giảm tối đa là 100%';
      }
    } else if (name === 'minOrderAmount' && Number(value) < 0) {
      err = 'Số tiền đơn tối thiểu không thể âm';
    } else if (name === 'endDate') {
      if (value && data.startDate && new Date(value) < new Date(data.startDate)) {
        err = 'Ngày kết thúc không thể trước ngày bắt đầu';
      }
    }
    
    setErrors(prev => ({ ...prev, [name]: err }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const formattedValue = name === 'code' ? value.toUpperCase().replace(/\s/g, '') : value;
    
    setFormData(prev => {
      const updated = { ...prev, [name]: formattedValue };
      // validate against the updated data
      validateField(name, formattedValue, updated);
      
      // Additional cross-field validation: if discount type changes, re-validate discountValue
      if (name === 'discountType') {
        validateField('discountValue', prev.discountValue, updated);
      }
      return updated;
    });
  };

  const validateAll = () => {
    const tempErrors = {};
    if (!formData.name) tempErrors.name = 'Tên hiển thị voucher là bắt buộc';
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
    if (!validateAll()) return;

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

  // Preview data
  const previewVoucher = {
    code: formData.code || 'MÃVOUCHER',
    name: formData.name || 'Tên Voucher của bạn',
    description: formData.description || 'Mô tả chi tiết chương trình khuyến mại...',
    discountType: formData.discountType,
    discountValue: Number(formData.discountValue) || 0,
    minOrderAmount: Number(formData.minOrderAmount) || 0,
    maxDiscountAmount: formData.maxDiscountAmount ? Number(formData.maxDiscountAmount) : null,
    endDate: formData.endDate || null,
  };

  return (
    <div className="voucher-modal-overlay">
      <div className="voucher-modal-container">
        <div className="voucher-modal-header">
          <h3 className="voucher-modal-title">
            {voucher ? `Chỉnh sửa Voucher: ${voucher.code}` : 'Tạo ưu đãi Voucher mới'}
          </h3>
          <button className="voucher-modal-close-btn" onClick={onClose} aria-label="Close modal">&times;</button>
        </div>

        <div className="voucher-modal-content-grid">
          {/* Form Section */}
          <form onSubmit={handleSubmit} className="voucher-modal-form">
            <div className="form-group">
              <label className="form-label">Tên hiển thị Voucher *</label>
              <input
                type="text"
                name="name"
                className={`form-input ${errors.name ? 'input-error' : ''}`}
                value={formData.name}
                onChange={handleChange}
                placeholder="Ví dụ: Giảm giá hè 2026"
              />
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Mã Voucher *</label>
              <input
                type="text"
                name="code"
                className={`form-input ${errors.code ? 'input-error' : ''}`}
                value={formData.code}
                onChange={handleChange}
                disabled={!!voucher}
                placeholder="Ví dụ: SUMMER50"
              />
              {errors.code && <span className="error-text">{errors.code}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Mô tả khuyến mại</label>
              <textarea
                name="description"
                className="form-textarea"
                value={formData.description}
                onChange={handleChange}
                placeholder="Ví dụ: Áp dụng khi đặt bàn từ 4 người..."
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
                <label className="form-label">Mức giảm tối đa (đ) - bỏ trống nếu không giới hạn</label>
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
                <label className="form-label">Đơn tối thiểu (đ)</label>
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
                <label className="form-label">Lượt / Khách hàng</label>
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
                <label className="form-label">Lượt dùng tối đa hệ thống</label>
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
              <label className="form-label">Ngày kết thúc *</label>
              <input
                type="date"
                name="endDate"
                className={`form-input ${errors.endDate ? 'input-error' : ''}`}
                value={formData.endDate}
                onChange={handleChange}
                required
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

          {/* Live Preview Section */}
          <div className="voucher-modal-preview-section">
            <h4 className="preview-header-title">Xem trước hiển thị</h4>
            <p className="preview-subtitle">Giao diện voucher khi hiển thị với khách hàng lúc đặt bàn:</p>
            <div className="preview-card-wrapper">
              <VoucherCard voucher={previewVoucher} isSaved={false} />
            </div>
            
            <div className="preview-tips">
              <h5>💡 Mẹo thiết kế ưu đãi:</h5>
              <ul>
                <li>Đặt mã ngắn gọn, dễ nhớ (Ví dụ: BAN10, KHAIXIANG).</li>
                <li>Nên đặt mức đơn tối thiểu hợp lý với giá món trung bình.</li>
                <li>Mức giảm phần trăm (10% - 20%) thường thu hút khách hơn giảm tiền cố định.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoucherFormModal;
