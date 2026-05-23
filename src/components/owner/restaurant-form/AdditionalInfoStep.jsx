import { useState } from 'react';
import { uploadImage } from '../../../api/uploadApi';

function MultiInputList({ label, items = [], placeholder, onChange }) {
  const listItems = Array.isArray(items) ? (items.length === 0 ? [''] : items) : [''];

  const handleItemChange = (index, value) => {
    const newItems = [...listItems];
    newItems[index] = value;
    onChange(newItems);
  };

  const handleAddItem = () => {
    onChange([...listItems, '']);
  };

  const handleRemoveItem = (index) => {
    const newItems = listItems.filter((_, i) => i !== index);
    onChange(newItems.length === 0 ? [] : newItems);
  };

  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <div className="multi-input-list">
        {listItems.map((item, index) => (
          <div key={index} className="multi-input-item">
            <input
              type="text"
              className="form-input"
              value={item}
              onChange={(e) => handleItemChange(index, e.target.value)}
              placeholder={`${placeholder}`}
            />
            {listItems.length > 1 && (
              <button
                type="button"
                className="btn-remove-item"
                onClick={() => handleRemoveItem(index)}
                title="Xóa dòng này"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>
      <button
        type="button"
        className="btn-add-item"
        onClick={handleAddItem}
      >
        ➕ Thêm dòng mới
      </button>
    </div>
  );
}

export default function AdditionalInfoStep({ data, onChange, errors }) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const handleChange = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File quá lớn. Vui lòng chọn file dưới 5MB.');
      return;
    }

    setUploading(true);
    setUploadError('');

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('folder', 'bookeat/logos');

      const response = await uploadImage(formData);
      if (response.success && response.data?.url) {
        handleChange('logo', response.data.url);
      } else {
        setUploadError(response.message || 'Không thể upload ảnh, vui lòng thử lại.');
      }
    } catch (err) {
      console.error('Error uploading logo:', err);
      setUploadError(err.message || 'Lỗi kết nối khi upload logo.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="form-step" id="step-additional-info">
      <h2 className="step-title">
        <span className="step-icon">🖼️</span>
        Hình ảnh & Thông tin bổ sung
      </h2>
      <p className="step-desc">
        Bổ sung các thông tin tùy chọn giúp nâng cao hiển thị trên trang tìm kiếm.
        <span className="step-optional"> (Tất cả các trường đều không bắt buộc)</span>
      </p>

      {/* Logo Upload */}
      <div className="form-group logo-upload-group">
        <label className="form-label">Logo Nhà Hàng</label>
        <div className="logo-upload-container">
          {data.logo ? (
            <div className="logo-uploaded-preview">
              <img src={data.logo} alt="Logo" />
              <button
                type="button"
                className="btn-remove-logo"
                onClick={() => handleChange('logo', '')}
              >
                ✕ Xóa ảnh
              </button>
            </div>
          ) : (
            <div className="logo-upload-placeholder">
              <label htmlFor="logo-file-input" className="logo-upload-label">
                {uploading ? (
                  <div className="upload-spinner-wrapper">
                    <span className="upload-spinner"></span>
                    <span>Đang tải lên...</span>
                  </div>
                ) : (
                  <>
                    <span className="upload-icon">📤</span>
                    <span className="upload-text">Nhấp để chọn hoặc kéo thả file ảnh làm logo</span>
                    <span className="upload-subtext">Định dạng JPEG, PNG, GIF, WebP tối đa 5MB</span>
                  </>
                )}
              </label>
              <input
                id="logo-file-input"
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                disabled={uploading}
                style={{ display: 'none' }}
              />
            </div>
          )}
          {uploadError && <span className="field-error">{uploadError}</span>}
        </div>
      </div>

      {/* Price section */}
      <div className="form-section-divider">
        <span>💰 Thông tin giá cả</span>
      </div>

      <div className="form-row-3">
        <div className={`form-group ${errors?.averagePrice ? 'has-error' : ''}`}>
          <label className="form-label" htmlFor="avg-price">Giá trung bình (VNĐ)</label>
          <input
            id="avg-price"
            type="number"
            className="form-input"
            placeholder="VD: 80000"
            value={data.averagePrice || ''}
            onChange={(e) => handleChange('averagePrice', e.target.value)}
            min={0}
          />
          {errors?.averagePrice && <span className="field-error">{errors.averagePrice}</span>}
        </div>
        <div className={`form-group ${errors?.priceRangeMin ? 'has-error' : ''}`}>
          <label className="form-label" htmlFor="price-min">Giá thấp nhất (VNĐ)</label>
          <input
            id="price-min"
            type="number"
            className="form-input"
            placeholder="VD: 50000"
            value={data.priceRangeMin || ''}
            onChange={(e) => handleChange('priceRangeMin', e.target.value)}
            min={0}
          />
          {errors?.priceRangeMin && <span className="field-error">{errors.priceRangeMin}</span>}
        </div>
        <div className={`form-group ${errors?.priceRangeMax ? 'has-error' : ''}`}>
          <label className="form-label" htmlFor="price-max">Giá cao nhất (VNĐ)</label>
          <input
            id="price-max"
            type="number"
            className="form-input"
            placeholder="VD: 200000"
            value={data.priceRangeMax || ''}
            onChange={(e) => handleChange('priceRangeMax', e.target.value)}
            min={0}
          />
          {errors?.priceRangeMax && <span className="field-error">{errors.priceRangeMax}</span>}
        </div>
      </div>

      {/* Display info */}
      <div className="form-section-divider">
        <span>✨ Thông tin hiển thị</span>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="status-message">Dòng trạng thái</label>
        <input
          id="status-message"
          type="text"
          className="form-input"
          placeholder="VD: Mở cửa đón khách từ 10:30"
          value={data.statusMessage || ''}
          onChange={(e) => handleChange('statusMessage', e.target.value)}
          maxLength={255}
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="summary-highlights">Điểm nổi bật</label>
        <textarea
          id="summary-highlights"
          className="form-textarea"
          placeholder="VD: Không gian sang trọng, view sông Hàn tuyệt đẹp..."
          value={data.summaryHighlights || ''}
          onChange={(e) => handleChange('summaryHighlights', e.target.value)}
          rows={3}
        />
      </div>

      <MultiInputList
        label="Phù hợp cho"
        items={data.suitableFor}
        placeholder="VD: Gia đình, Hẹn hò, Họp lớp"
        onChange={(val) => handleChange('suitableFor', val)}
      />

      <MultiInputList
        label="Món ăn đặc trưng"
        items={data.signatureDishes}
        placeholder="VD: Phở bò, Bún chả, Vịt quay Bắc Kinh"
        onChange={(val) => handleChange('signatureDishes', val)}
      />

      <MultiInputList
        label="Tiện ích đi kèm"
        items={data.amenities}
        placeholder="VD: Chỗ đỗ xe ô tô, Máy lạnh, WiFi miễn phí"
        onChange={(val) => handleChange('amenities', val)}
      />

      <MultiInputList
        label="Quy định nhà hàng"
        items={data.policyRules}
        placeholder="VD: Không mang thức ăn từ bên ngoài vào, Giữ trật tự chung"
        onChange={(val) => handleChange('policyRules', val)}
      />

      <div className="form-group">
        <label className="form-label" htmlFor="booking-notes">Lưu ý đặt bàn</label>
        <textarea
          id="booking-notes"
          className="form-textarea"
          placeholder="VD: Giữ bàn tối đa 15 phút kể từ giờ đặt"
          value={data.bookingNotes || ''}
          onChange={(e) => handleChange('bookingNotes', e.target.value)}
          rows={3}
        />
      </div>
    </div>
  );
}
