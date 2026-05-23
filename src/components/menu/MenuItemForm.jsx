import { useState, useEffect, useRef } from 'react';
import { X, Save, Upload, ImageIcon, Trash2 } from 'lucide-react';
import { uploadImage } from '../../api/uploadApi';

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
    <div className="menu-modal-overlay" onClick={onClose}>
      <div className="menu-modal menu-modal--form" onClick={(e) => e.stopPropagation()}>
        <div className="menu-modal-header">
          <h3>{isEdit ? 'Chỉnh sửa món ăn' : 'Thêm món ăn mới'}</h3>
          <button className="menu-modal-close" onClick={onClose}><X size={20} /></button>
        </div>

        <form className="menu-form" onSubmit={handleSubmit}>
          <div className="menu-form-grid">
            <div className="menu-form-group">
              <label>Tên món ăn <span className="required">*</span></label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Nhập tên món ăn"
                maxLength={200}
              />
              {errors.name && <span className="menu-form-error">{errors.name}</span>}
            </div>

            <div className="menu-form-group">
              <label>Giá (VNĐ) <span className="required">*</span></label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => handleChange('price', e.target.value)}
                placeholder="100000"
                min="0"
                step="1000"
              />
              {errors.price && <span className="menu-form-error">{errors.price}</span>}
            </div>

            <div className="menu-form-group">
              <label>Danh mục</label>
              <select value={formData.categoryId} onChange={(e) => handleChange('categoryId', e.target.value)}>
                <option value="">Không phân loại</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="menu-form-group">
              <label>Thời gian chuẩn bị (phút)</label>
              <input
                type="number"
                value={formData.preparationTime}
                onChange={(e) => handleChange('preparationTime', e.target.value)}
                placeholder="15"
                min="0"
              />
              {errors.preparationTime && <span className="menu-form-error">{errors.preparationTime}</span>}
            </div>

            <div className="menu-form-group menu-form-full">
              <label>Mô tả</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Mô tả về món ăn..."
                rows="3"
                maxLength={1000}
              />
            </div>

            {/* ── Upload ảnh (thay URL input) ── */}
            <div className="menu-form-group menu-form-full">
              <label>Ảnh món ăn</label>

              {imagePreview ? (
                <div className="menu-image-preview">
                  <img src={imagePreview} alt="Preview" />
                  <div className="menu-image-preview-actions">
                    <button
                      type="button"
                      className="menu-image-btn menu-image-btn--change"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload size={14} /> Đổi ảnh
                    </button>
                    <button
                      type="button"
                      className="menu-image-btn menu-image-btn--remove"
                      onClick={handleRemoveImage}
                    >
                      <Trash2 size={14} /> Xóa
                    </button>
                  </div>
                  {imageFile && (
                    <div className="menu-image-file-info">
                      📄 {imageFile.name} ({(imageFile.size / 1024).toFixed(0)} KB)
                    </div>
                  )}
                </div>
              ) : (
                <div
                  className={`menu-image-dropzone ${dragActive ? 'menu-image-dropzone--active' : ''}`}
                  onClick={() => fileInputRef.current?.click()}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <ImageIcon size={36} strokeWidth={1.2} />
                  <p className="menu-image-dropzone-title">
                    Kéo thả ảnh vào đây hoặc <span>chọn file</span>
                  </p>
                  <p className="menu-image-dropzone-hint">
                    JPEG, PNG, GIF, WebP — Tối đa 5MB
                  </p>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleFileInputChange}
                style={{ display: 'none' }}
              />

              {uploadError && <span className="menu-form-error">{uploadError}</span>}
            </div>

            <div className="menu-form-group menu-form-full">
              <label>Tags (phân cách bởi dấu phẩy)</label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => handleChange('tags', e.target.value)}
                placeholder="cay, chay, best seller"
              />
            </div>

            <div className="menu-form-group">
              <label className="menu-form-checkbox">
                <input
                  type="checkbox"
                  checked={formData.isAvailable}
                  onChange={(e) => handleChange('isAvailable', e.target.checked)}
                />
                <span>Còn món</span>
              </label>
            </div>
          </div>

          <div className="menu-modal-actions">
            <button type="button" className="menu-btn menu-btn--ghost" onClick={onClose}>Hủy</button>
            <button type="submit" className="menu-btn menu-btn--primary" disabled={loading || uploading}>
              <Save size={16} /> {uploading ? 'Đang tải ảnh...' : loading ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Tạo món ăn'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
