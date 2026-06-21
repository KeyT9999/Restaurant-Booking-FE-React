import { useState, useEffect, useRef } from 'react';
import { X, Save, Upload, ImageIcon, Trash2 } from 'lucide-react';
import { uploadImage } from '../../api/uploadApi';
import { Button } from '../ui/button';
import AIFieldPolishButton from '../owner/AIFieldPolishButton';

export default function MenuItemForm({ item, categories, onSubmit, onClose }) {
  const isEdit = !!item;
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    price: '',
    description: '',
    image: '',
    isAvailable: true,
    status: 'available',
    preparationTime: '',
    tags: '',
  });

  // State riêng cho file upload
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || '',
        categoryId: item.categoryId || '',
        price: item.price ?? '',
        description: item.description || '',
        image: item.image || '',
        isAvailable: item.isAvailable !== false,
        status: item.status || 'available',
        preparationTime: item.preparationTime ?? '',
        tags: item.tags?.join(', ') || '',
      });
      // Nếu đã có ảnh cũ, hiển thị preview
      if (item.image) {
        setImagePreview(item.image);
      }
    }
  }, [item]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: null }));
  };

  // ── Xử lý chọn / kéo thả file ──
  const handleFileSelect = (file) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Chỉ chấp nhận file ảnh (JPEG, PNG, GIF, WebP)');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Kích thước file tối đa là 5MB');
      return;
    }

    setUploadError('');
    setImageFile(file);

    // Tạo preview local
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    handleFileSelect(file);
    // Reset input để có thể chọn lại cùng file
    e.target.value = '';
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    handleFileSelect(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
    setUploadError('');
    handleChange('image', '');
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Tên món ăn là bắt buộc';
    if (formData.price === '' || formData.price === null) errs.price = 'Giá là bắt buộc';
    else if (isNaN(formData.price) || Number(formData.price) < 0) errs.price = 'Giá phải là số không âm';
    if (formData.preparationTime && (isNaN(formData.preparationTime) || Number(formData.preparationTime) < 0)) {
      errs.preparationTime = 'Thời gian phải là số không âm';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setUploadError('');

    try {
      let imageUrl = formData.image || null;

      // Nếu có file mới → upload lên Cloudinary trước
      if (imageFile) {
        setUploading(true);
        try {
          const fd = new FormData();
          fd.append('image', imageFile);
          fd.append('folder', 'bookeat/menu-items');
          const uploadRes = await uploadImage(fd);
          imageUrl = uploadRes.data.url;
        } catch (uploadErr) {
          const msg = uploadErr.response?.data?.message || 'Upload ảnh thất bại. Vui lòng thử lại.';
          setUploadError(msg);
          setLoading(false);
          setUploading(false);
          return;
        } finally {
          setUploading(false);
        }
      }

      const data = {
        name: formData.name.trim(),
        categoryId: formData.categoryId || null,
        price: Number(formData.price),
        description: formData.description.trim() || null,
        image: imageUrl,
        isAvailable: formData.isAvailable,
        status: formData.status,
        preparationTime: formData.preparationTime ? Number(formData.preparationTime) : null,
        tags: formData.tags ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      };
      await onSubmit(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 text-left" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
          <h3 className="font-serif text-lg font-bold text-white">
            {isEdit ? 'Chỉnh sửa món ăn' : 'Thêm món ăn mới'}
          </h3>
          <button 
            type="button" 
            className="text-muted-foreground hover:text-white transition rounded-lg p-1 hover:bg-secondary/40" 
            onClick={onClose}
            aria-label="Đóng"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Tên món */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Tên món ăn <span className="text-destructive">*</span>
                </label>
                <AIFieldPolishButton
                  fieldKey="name"
                  value={formData.name}
                  onApply={(val) => handleChange('name', val)}
                  context={{ type: 'menu_item' }}
                  maxLength={200}
                />
              </div>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Ví dụ: Bò né hoa thiên lý, Lẩu hải sản"
                maxLength={200}
                className={`bg-[#0F1115] border text-white text-sm rounded-xl px-3 py-2.5 focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none transition-all ${
                  errors.name ? 'border-destructive' : 'border-border'
                }`}
                required
              />
              {errors.name && <span className="text-xs text-rose-400 font-medium mt-0.5">{errors.name}</span>}
            </div>

            {/* Giá món */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Giá (VNĐ) <span className="text-destructive">*</span>
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => handleChange('price', e.target.value)}
                placeholder="Ví dụ: 150000"
                min="0"
                step="1000"
                className={`bg-[#0F1115] border text-white text-sm rounded-xl px-3 py-2.5 focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none transition-all ${
                  errors.price ? 'border-destructive' : 'border-border'
                }`}
                required
              />
              {errors.price && <span className="text-xs text-rose-400 font-medium mt-0.5">{errors.price}</span>}
            </div>

            {/* Danh mục */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Danh mục</label>
              <select 
                value={formData.categoryId} 
                onChange={(e) => handleChange('categoryId', e.target.value)}
                className="bg-[#0F1115] border border-border text-white text-xs rounded-xl px-3 py-2.5 h-11 focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none transition-all cursor-pointer"
              >
                <option value="">Không phân loại (Khác)</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Thời gian chuẩn bị */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Thời gian chuẩn bị (phút)</label>
              <input
                type="number"
                value={formData.preparationTime}
                onChange={(e) => handleChange('preparationTime', e.target.value)}
                placeholder="Ví dụ: 15"
                min="0"
                className={`bg-[#0F1115] border text-white text-sm rounded-xl px-3 py-2.5 focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none transition-all ${
                  errors.preparationTime ? 'border-destructive' : 'border-border'
                }`}
              />
              {errors.preparationTime && <span className="text-xs text-rose-400 font-medium mt-0.5">{errors.preparationTime}</span>}
            </div>

            {/* Mô tả */}
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Mô tả chi tiết</label>
                <AIFieldPolishButton
                  fieldKey="description"
                  value={formData.description}
                  onApply={(val) => handleChange('description', val)}
                  context={{ itemName: formData.name, type: 'menu_item' }}
                  maxLength={1000}
                />
              </div>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Mô tả nguyên liệu, hương vị hoặc lưu ý chế biến..."
                rows="3"
                maxLength={1000}
                className="bg-[#0F1115] border border-border text-white text-sm rounded-xl px-3 py-2.5 focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none transition-all resize-y min-h-[80px]"
              />
            </div>

            {/* Upload ảnh */}
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Ảnh món ăn</label>

              {imagePreview ? (
                <div className="relative border border-border rounded-xl bg-[#0F1115]/50 overflow-hidden flex flex-col items-center justify-center p-4 gap-3">
                  <img src={imagePreview} alt="Preview" className="max-h-[160px] object-contain rounded-lg border border-border/80" />
                  <div className="flex items-center gap-2 mt-1">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border bg-[#0F1115] hover:bg-secondary/40 text-xs font-semibold text-white transition cursor-pointer"
                    >
                      <Upload size={12} /> Đổi ảnh
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-destructive/20 bg-destructive/10 text-destructive hover:bg-destructive/20 text-xs font-semibold transition cursor-pointer"
                    >
                      <Trash2 size={12} /> Xóa
                    </button>
                  </div>
                  {imageFile && (
                    <div className="text-[10px] text-muted-foreground mt-1 truncate max-w-xs">
                      📄 {imageFile.name} ({(imageFile.size / 1024).toFixed(0)} KB)
                    </div>
                  )}
                </div>
              ) : (
                <div
                  className={`border border-dashed rounded-xl bg-[#0F1115]/30 p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 gap-2 ${
                    dragActive 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border/60 hover:border-primary/50'
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <ImageIcon size={32} strokeWidth={1.2} className="text-muted-foreground/60" />
                  <p className="text-xs text-white">
                    Kéo thả file ảnh vào đây hoặc <span className="text-primary font-medium underline">chọn file từ thiết bị</span>
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Định dạng JPEG, PNG, GIF, WebP — Kích thước tối đa 5MB
                  </p>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleFileInputChange}
                className="hidden"
              />

              {uploadError && <span className="text-xs text-rose-405 font-medium mt-0.5">{uploadError}</span>}
            </div>

            {/* Tags */}
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tags (phân cách bởi dấu phẩy)</label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => handleChange('tags', e.target.value)}
                placeholder="Ví dụ: cay, chay, ban chay, dac san"
                className="bg-[#0F1115] border border-border text-white text-sm rounded-xl px-3 py-2.5 focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none transition-all"
              />
            </div>

            {/* Còn món check */}
            <div className="sm:col-span-2 pt-1">
              <label className="flex items-center gap-2 text-sm text-white font-medium select-none cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isAvailable}
                  onChange={(e) => handleChange('isAvailable', e.target.checked)}
                  className="h-4 w-4 rounded border-border bg-[#0F1115] text-primary focus:ring-primary focus:ring-offset-0"
                />
                <span>Cho phép hiển thị & đặt món ăn này ngay (Còn món)</span>
              </label>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-border pt-4 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-border hover:bg-secondary/40 text-xs h-9"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="default"
              disabled={loading || uploading}
              className="bg-primary hover:bg-primary/95 text-black font-semibold text-xs h-9"
            >
              <Save size={14} className="mr-1.5" /> 
              {uploading ? 'Đang tải ảnh lên...' : loading ? 'Đang lưu món...' : isEdit ? 'Cập nhật món ăn' : 'Tạo món ăn'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
