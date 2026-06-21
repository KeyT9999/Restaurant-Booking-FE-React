import { useState } from 'react';
import AIFieldPolishButton from '../AIFieldPolishButton';

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
    <div className="space-y-4 text-left" id="step-basic-info">
      <h2 className="font-serif text-xl font-bold text-white flex items-center gap-2">
        <span className="text-lg">📋</span>
        Thông tin cơ bản
      </h2>
      <p className="text-xs text-muted-foreground">Nhập các thông tin nhận diện cốt lõi cho nhà hàng của bạn.</p>

      {/* Name */}
      <div className="flex flex-col gap-1.5 relative">
        <div className="flex justify-between items-center">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground" htmlFor="restaurant-name">
            Tên nhà hàng <span className="text-destructive">*</span>
          </label>
          <AIFieldPolishButton
            fieldKey="name"
            value={data.name || ''}
            maxLength={200}
            context={{ step: 'basic_info' }}
            onApply={(val) => handleChange('name', val)}
          />
        </div>
        <input
          id="restaurant-name"
          type="text"
          className={`bg-[#0F1115] border text-white text-sm rounded-xl px-3 py-2.5 focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none transition-all ${
            errors?.name ? 'border-destructive' : 'border-border'
          }`}
          placeholder="Ví dụ: Nhà hàng Phở Thìn Lò Đúc"
          value={data.name || ''}
          onChange={(e) => handleChange('name', e.target.value)}
          maxLength={200}
        />
        {errors?.name && <span className="text-xs text-rose-450 font-medium mt-0.5">{errors.name}</span>}
        <span className="text-[10px] text-muted-foreground/50 self-end">{(data.name || '').length}/200 ký tự</span>
      </div>

      {/* Description */}
      <div className="flex flex-col gap-1.5 relative">
        <div className="flex justify-between items-center">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground" htmlFor="restaurant-description">
            Mô tả chi tiết <span className="text-destructive">*</span>
          </label>
          <AIFieldPolishButton
            fieldKey="description"
            value={data.description || ''}
            maxLength={2000}
            context={{ restaurantName: data.name, step: 'basic_info' }}
            onApply={(val) => handleChange('description', val)}
          />
        </div>
        <textarea
          id="restaurant-description"
          className={`bg-[#0F1115] border text-white text-sm rounded-xl px-3 py-2.5 focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none transition-all resize-y min-h-[100px] ${
            errors?.description ? 'border-destructive' : 'border-border'
          }`}
          placeholder="Mô tả về phong cách không gian, nét đặc sắc trong ẩm thực của nhà hàng..."
          value={data.description || ''}
          onChange={(e) => handleChange('description', e.target.value)}
          maxLength={2000}
          rows={5}
        />
        {errors?.description && <span className="text-xs text-rose-450 font-medium mt-0.5">{errors.description}</span>}
        <div className="flex justify-between items-center text-[10px] text-muted-foreground/50">
          <span>Tối thiểu 10 ký tự</span>
          <span>{(data.description || '').length}/2000 ký tự</span>
        </div>
      </div>

      {/* Cuisine Types */}
      <div className="flex flex-col gap-1.5 relative">
        <div className="flex justify-between items-center">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Loại hình ẩm thực</label>
          <AIFieldPolishButton
            fieldKey="customCuisine"
            value={cuisineInput}
            maxLength={50}
            context={{ step: 'basic_info' }}
            onApply={(val) => setCuisineInput(val)}
          />
        </div>
        <div className="flex flex-wrap gap-1.5 mb-1">
          {(data.cuisineTypes || []).map((type) => (
            <span key={type} className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/20 text-primary px-3 py-1 rounded-full text-xs font-medium">
              {type}
              <button 
                type="button" 
                className="text-primary hover:text-white text-sm leading-none font-bold" 
                onClick={() => removeCuisine(type)}
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            className="flex-1 bg-[#0F1115] border border-border text-white text-sm rounded-xl px-3 py-2.5 focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none transition-all"
            placeholder="Nhập loại ẩm thực rồi nhấn Thêm..."
            value={cuisineInput}
            onChange={(e) => setCuisineInput(e.target.value)}
            onKeyDown={handleCuisineKeyDown}
          />
          <button
            type="button"
            className="px-4 py-2.5 bg-primary/15 border border-primary/30 rounded-xl text-primary hover:bg-primary/25 text-xs font-bold transition-all disabled:opacity-40"
            onClick={() => addCuisine(cuisineInput)}
            disabled={!cuisineInput.trim() || (data.cuisineTypes || []).length >= 10}
          >
            Thêm
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {CUISINE_SUGGESTIONS.filter((s) => !(data.cuisineTypes || []).includes(s)).slice(0, 8).map((s) => (
            <button 
              key={s} 
              type="button" 
              className="text-[11px] px-2.5 py-1 rounded-full bg-secondary/35 border border-border/80 text-muted-foreground hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-all" 
              onClick={() => addCuisine(s)}
            >
              + {s}
            </button>
          ))}
        </div>
        <span className="text-[10px] text-muted-foreground/50 self-end">{(data.cuisineTypes || []).length}/10 loại ẩm thực đã chọn</span>
      </div>

      {/* Price Range */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground" htmlFor="restaurant-price-range">
          Phân khúc giá nhà hàng
        </label>
        <select
          id="restaurant-price-range"
          className="bg-[#0F1115] border border-border text-white text-xs rounded-xl px-3 py-2.5 h-11 focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none transition-all cursor-pointer"
          value={data.priceRange || 'moderate'}
          onChange={(e) => handleChange('priceRange', e.target.value)}
        >
          {PRICE_RANGES.map((pr) => (
            <option key={pr.value} value={pr.value}>{pr.label}</option>
          ))}
        </select>
      </div>

      {/* Capacity */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground" htmlFor="restaurant-capacity">
          Sức chứa tối đa (số khách cùng lúc)
        </label>
        <input
          id="restaurant-capacity"
          type="number"
          className={`bg-[#0F1115] border text-white text-sm rounded-xl px-3 py-2.5 focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none transition-all ${
            errors?.capacity ? 'border-destructive' : 'border-border'
          }`}
          placeholder="Ví dụ: 100"
          value={data.capacity || ''}
          onChange={(e) => handleChange('capacity', e.target.value)}
          min={0}
        />
        {errors?.capacity && <span className="text-xs text-rose-455 font-medium mt-0.5">{errors.capacity}</span>}
      </div>
    </div>
  );
}
