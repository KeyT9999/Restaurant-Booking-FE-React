import { useState } from 'react';
import { uploadImage } from '../../../api/uploadApi';
import { Plus, Trash2, Upload, ImageIcon, HelpCircle } from 'lucide-react';
import { Button } from '../../ui/button';

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
    <div className="flex flex-col gap-2.5">
      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</label>
      <div className="space-y-2">
        {listItems.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              type="text"
              className="flex-1 bg-[#0F1115] border border-border text-white text-sm rounded-xl px-3 py-2 focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none transition-all"
              value={item}
              onChange={(e) => handleItemChange(index, e.target.value)}
              placeholder={placeholder}
              aria-label={`${label} dòng ${index + 1}`}
            />
            {listItems.length > 1 && (
              <button
                type="button"
                className="w-9 h-9 rounded-xl border border-destructive/20 bg-destructive/10 text-destructive hover:bg-destructive/20 flex items-center justify-center transition shrink-0 cursor-pointer"
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
        className="inline-flex items-center gap-1 text-xs text-primary font-bold hover:underline self-start bg-transparent border-0 cursor-pointer mt-1"
        onClick={handleAddItem}
      >
        <Plus size={12} /> Thêm dòng mới
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
    <div className="space-y-5 text-left" id="step-additional-info">
      <h2 className="font-serif text-xl font-bold text-white flex items-center gap-2">
        <span className="text-lg">🖼️</span>
        Hình ảnh & Thông tin bổ sung
      </h2>
      <p className="text-xs text-muted-foreground">
        Bổ sung các thông tin tùy chọn giúp nâng cao hiển thị trên trang tìm kiếm.
        <span className="text-primary italic font-medium"> (Không bắt buộc)</span>
      </p>

      {/* Logo Upload */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Logo Nhà Hàng</label>
        
        {data.logo ? (
          <div className="relative border border-border rounded-xl bg-[#0F1115]/50 overflow-hidden flex flex-col items-center justify-center p-4 gap-3 max-w-sm">
            <img src={data.logo} alt="Logo" className="max-h-[120px] object-contain rounded-lg border border-border/80 shadow" />
            <button
              type="button"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-destructive/20 bg-destructive/10 text-destructive hover:bg-destructive/20 text-xs font-semibold transition cursor-pointer"
              onClick={() => handleChange('logo', '')}
            >
              ✕ Xóa ảnh
            </button>
          </div>
        ) : (
          <div className="border border-dashed border-border/60 hover:border-primary/50 rounded-xl bg-[#0F1115]/30 p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 gap-2 max-w-lg">
            <label htmlFor="logo-file-input" className="flex flex-col items-center gap-2 cursor-pointer w-full">
              {uploading ? (
                <div className="flex flex-col items-center gap-2 text-xs text-muted-foreground">
                  <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                  <span>Đang tải lên...</span>
                </div>
              ) : (
                <>
                  <Upload size={28} className="text-muted-foreground/60" />
                  <span className="text-xs text-white">Nhấp để chọn file ảnh làm logo thương hiệu</span>
                  <span className="text-[10px] text-muted-foreground">JPEG, PNG, GIF, WebP tối đa 5MB</span>
                </>
              )}
            </label>
            <input
              id="logo-file-input"
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              disabled={uploading}
              className="hidden"
            />
          </div>
        )}
        {uploadError && <span className="text-xs text-rose-455 font-medium mt-0.5">{uploadError}</span>}
      </div>

      {/* Price section */}
      <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-border/40 pb-2 mt-6">
        💰 Thông tin giá cả
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground" htmlFor="avg-price">Giá trung bình (VNĐ)</label>
          <input
            id="avg-price"
            type="number"
            className={`bg-[#0F1115] border text-white text-sm rounded-xl px-3 py-2.5 focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none transition-all ${
              errors?.averagePrice ? 'border-destructive' : 'border-border'
            }`}
            placeholder="VD: 80000"
            value={data.averagePrice || ''}
            onChange={(e) => handleChange('averagePrice', e.target.value)}
            min={0}
          />
          {errors?.averagePrice && <span className="text-xs text-rose-455 font-medium mt-0.5">{errors.averagePrice}</span>}
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground" htmlFor="price-min">Giá thấp nhất (VNĐ)</label>
          <input
            id="price-min"
            type="number"
            className={`bg-[#0F1115] border text-white text-sm rounded-xl px-3 py-2.5 focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none transition-all ${
              errors?.priceRangeMin ? 'border-destructive' : 'border-border'
            }`}
            placeholder="VD: 50000"
            value={data.priceRangeMin || ''}
            onChange={(e) => handleChange('priceRangeMin', e.target.value)}
            min={0}
          />
          {errors?.priceRangeMin && <span className="text-xs text-rose-455 font-medium mt-0.5">{errors.priceRangeMin}</span>}
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground" htmlFor="price-max">Giá cao nhất (VNĐ)</label>
          <input
            id="price-max"
            type="number"
            className={`bg-[#0F1115] border text-white text-sm rounded-xl px-3 py-2.5 focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none transition-all ${
              errors?.priceRangeMax ? 'border-destructive' : 'border-border'
            }`}
            placeholder="VD: 200000"
            value={data.priceRangeMax || ''}
            onChange={(e) => handleChange('priceRangeMax', e.target.value)}
            min={0}
          />
          {errors?.priceRangeMax && <span className="text-xs text-rose-455 font-medium mt-0.5">{errors.priceRangeMax}</span>}
        </div>
      </div>

      {/* Display info */}
      <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-border/40 pb-2 mt-6">
        ✨ Thông tin hiển thị khám phá
      </h3>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground" htmlFor="status-message">Dòng trạng thái nhanh</label>
        <input
          id="status-message"
          type="text"
          className="bg-[#0F1115] border border-border text-white text-sm rounded-xl px-3 py-2.5 focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none transition-all"
          placeholder="Ví dụ: Đang giảm 10% đặt bàn hôm nay, Mở cửa đón khách từ 10:30"
          value={data.statusMessage || ''}
          onChange={(e) => handleChange('statusMessage', e.target.value)}
          maxLength={255}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground" htmlFor="summary-highlights">Điểm nổi bật ngắn gọn</label>
        <textarea
          id="summary-highlights"
          className="bg-[#0F1115] border border-border text-white text-sm rounded-xl px-3 py-2.5 focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none transition-all resize-y min-h-[70px]"
          placeholder="Ví dụ: Không gian sân vườn thoáng đãng, Thích hợp tiệc công ty..."
          value={data.summaryHighlights || ''}
          onChange={(e) => handleChange('summaryHighlights', e.target.value)}
          rows={3}
        />
      </div>

      <MultiInputList
        label="Không gian phù hợp cho"
        items={data.suitableFor}
        placeholder="Ví dụ: Họp nhóm, Liên hoan gia đình, Sinh nhật"
        onChange={(val) => handleChange('suitableFor', val)}
      />

      <MultiInputList
        label="Món ăn đặc sản / Món ký danh"
        items={data.signatureDishes}
        placeholder="Ví dụ: Lẩu cua đồng bắp bò, Gỏi cuốn ngũ sắc"
        onChange={(val) => handleChange('signatureDishes', val)}
      />

      <MultiInputList
        label="Tiện ích đi kèm"
        items={data.amenities}
        placeholder="Ví dụ: Chỗ để xe ô tô rộng rãi, Máy lạnh, Phòng riêng"
        onChange={(val) => handleChange('amenities', val)}
      />

      <MultiInputList
        label="Quy định nhà hàng"
        items={data.policyRules}
        placeholder="Ví dụ: Hạn chế hút thuốc, Giữ trật tự khu chung"
        onChange={(val) => handleChange('policyRules', val)}
      />

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground" htmlFor="booking-notes">Lưu ý đặt bàn quan trọng</label>
        <textarea
          id="booking-notes"
          className="bg-[#0F1115] border border-border text-white text-sm rounded-xl px-3 py-2.5 focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none transition-all resize-y min-h-[70px]"
          placeholder="Ví dụ: Chỉ giữ bàn tối đa 15 phút, Đặt cọc trước 20% đối với tiệc trên 20 khách..."
          value={data.bookingNotes || ''}
          onChange={(e) => handleChange('bookingNotes', e.target.value)}
          rows={3}
        />
      </div>

      {/* Cấu hình hoàn thiện */}
      <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-border/40 pb-2 mt-6">
        ⚙️ Hoàn thiện cấu hình nhà hàng
      </h3>

      <div className="flex flex-col gap-3 pt-1">
        <label className="flex items-center gap-2.5 text-xs text-muted-foreground select-none cursor-pointer">
          <input
            id="has-menu-chk"
            type="checkbox"
            checked={data.hasMenu || false}
            onChange={(e) => handleChange('hasMenu', e.target.checked)}
            className="h-4.5 w-4.5 rounded border-border bg-[#0F1115] text-primary focus:ring-primary focus:ring-offset-0 cursor-pointer"
          />
          <span className="text-white/90">
            Tôi đã hoàn thành thiết lập <strong>Thực đơn (Menu)</strong> cho nhà hàng
          </span>
        </label>

        <label className="flex items-center gap-2.5 text-xs text-muted-foreground select-none cursor-pointer">
          <input
            id="has-table-layout-chk"
            type="checkbox"
            checked={data.hasTableLayout || false}
            onChange={(e) => handleChange('hasTableLayout', e.target.checked)}
            className="h-4.5 w-4.5 rounded border-border bg-[#0F1115] text-primary focus:ring-primary focus:ring-offset-0 cursor-pointer"
          />
          <span className="text-white/90">
            Tôi đã hoàn thành thiết lập <strong>Sơ đồ bàn (Table layout)</strong> cho nhà hàng
          </span>
        </label>
        
        <p className="text-[11px] text-muted-foreground/60 italic leading-relaxed mt-1">
          Lưu ý: Sau khi được duyệt, bạn bắt buộc phải xác nhận hoàn thành cấu hình hai mục này để nhà hàng có thể chính thức mở cửa nhận đặt bàn công khai.
        </p>
      </div>
    </div>
  );
}
