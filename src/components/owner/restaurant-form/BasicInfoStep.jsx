import { useState } from 'react';

const CUISINE_SUGGESTIONS = [
  'Việt Nam', 'Nhật Bản', 'Hàn Quốc', 'Trung Hoa', 'Thái Lan',
  'Ý', 'Pháp', 'Mỹ', 'Ấn Độ', 'BBQ', 'Lẩu', 'Hải sản',
  'Buffet', 'Pizza', 'Sushi', 'Phở', 'Bún', 'Cơm', 'Chay',
];

const PRICE_RANGES = [
  { value: 'budget', label: '💰 Bình dân' },
  { value: 'moderate', label: '💰💰 Trung cấp' },
  { value: 'expensive', label: '💰💰💰 Cao cấp' },
  { value: 'luxury', label: '💰💰💰💰 Sang trọng' },
];

export default function BasicInfoStep({ data, onChange, errors }) {
  const [cuisineInput, setCuisineInput] = useState('');

  const handleChange = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  const addCuisine = (type) => {
    if (!type.trim()) return;
    const current = data.cuisineTypes || [];
    if (current.length >= 10) return;
    if (!current.includes(type.trim())) {
      handleChange('cuisineTypes', [...current, type.trim()]);
    }
    setCuisineInput('');
  };

  const removeCuisine = (type) => {
    handleChange('cuisineTypes', (data.cuisineTypes || []).filter((t) => t !== type));
  };

  const handleCuisineKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCuisine(cuisineInput);
    }
  };

  return (
    <div className="form-step" id="step-basic-info">
      <h2 className="step-title">
        <span className="step-icon">📋</span>
        Thông tin cơ bản
      </h2>
      <p className="step-desc">Nhập các thông tin nhận diện cốt lõi cho nhà hàng của bạn.</p>

      {/* Name */}
      <div className={`form-group ${errors?.name ? 'has-error' : ''}`}>
        <label className="form-label" htmlFor="restaurant-name">
          Tên nhà hàng <span className="required">*</span>
        </label>
        <input
          id="restaurant-name"
          type="text"
          className="form-input"
          placeholder="VD: Nhà hàng Phở Thìn"
          value={data.name || ''}
          onChange={(e) => handleChange('name', e.target.value)}
          maxLength={200}
        />
        {errors?.name && <span className="field-error">{errors.name}</span>}
        <span className="field-hint">{(data.name || '').length}/200 ký tự</span>
      </div>

      {/* Description */}
      <div className={`form-group ${errors?.description ? 'has-error' : ''}`}>
        <label className="form-label" htmlFor="restaurant-description">
          Mô tả <span className="required">*</span>
        </label>
        <textarea
          id="restaurant-description"
          className="form-textarea"
          placeholder="Mô tả về nhà hàng, phong cách ẩm thực, không gian..."
          value={data.description || ''}
          onChange={(e) => handleChange('description', e.target.value)}
          maxLength={2000}
          rows={5}
        />
        {errors?.description && <span className="field-error">{errors.description}</span>}
        <span className="field-hint">{(data.description || '').length}/2000 ký tự (tối thiểu 10)</span>
      </div>

      {/* Cuisine Types */}
      <div className="form-group">
        <label className="form-label">Loại hình ẩm thực</label>
        <div className="cuisine-tags">
          {(data.cuisineTypes || []).map((type) => (
            <span key={type} className="cuisine-tag">
              {type}
              <button type="button" className="tag-remove" onClick={() => removeCuisine(type)}>×</button>
            </span>
          ))}
        </div>
        <div className="cuisine-input-row">
          <input
            type="text"
            className="form-input"
            placeholder="Nhập loại ẩm thực..."
            value={cuisineInput}
            onChange={(e) => setCuisineInput(e.target.value)}
            onKeyDown={handleCuisineKeyDown}
          />
          <button
            type="button"
            className="btn-add-tag"
            onClick={() => addCuisine(cuisineInput)}
            disabled={!cuisineInput.trim() || (data.cuisineTypes || []).length >= 10}
          >
            Thêm
          </button>
        </div>
        <div className="cuisine-suggestions">
          {CUISINE_SUGGESTIONS.filter((s) => !(data.cuisineTypes || []).includes(s)).slice(0, 8).map((s) => (
            <button key={s} type="button" className="suggestion-chip" onClick={() => addCuisine(s)}>
              + {s}
            </button>
          ))}
        </div>
        <span className="field-hint">{(data.cuisineTypes || []).length}/10 loại</span>
      </div>

      {/* Price Range */}
      <div className="form-group">
        <label className="form-label" htmlFor="restaurant-price-range">Phân khúc giá</label>
        <select
          id="restaurant-price-range"
          className="form-select"
          value={data.priceRange || 'moderate'}
          onChange={(e) => handleChange('priceRange', e.target.value)}
        >
          {PRICE_RANGES.map((pr) => (
            <option key={pr.value} value={pr.value}>{pr.label}</option>
          ))}
        </select>
      </div>

      {/* Capacity */}
      <div className="form-group">
        <label className="form-label" htmlFor="restaurant-capacity">Sức chứa tối đa (số khách)</label>
        <input
          id="restaurant-capacity"
          type="number"
          className="form-input"
          placeholder="VD: 100"
          value={data.capacity || ''}
          onChange={(e) => handleChange('capacity', e.target.value)}
          min={0}
        />
        {errors?.capacity && <span className="field-error">{errors.capacity}</span>}
      </div>
    </div>
  );
}
