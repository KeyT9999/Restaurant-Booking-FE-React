import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';

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
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200" onClick={onClose}>
      <div 
        className="w-full max-w-[580px] bg-card border border-border rounded-2xl p-6 md:p-8 flex flex-col gap-6 shadow-2xl relative max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b border-border/40 pb-4">
          <h3 className="font-serif text-lg md:text-xl text-white font-bold tracking-tight">
            {voucher ? `Chỉnh sửa Voucher: ${voucher.code}` : 'Tạo ưu đãi Voucher mới'}
          </h3>
          <button 
            onClick={onClose} 
            className="text-muted-foreground hover:text-white transition-colors cursor-pointer outline-none"
            aria-label="Đóng"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 text-left">
          
          {/* Voucher Code */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Mã Voucher <span className="text-primary">*</span> <span className="text-[10px] text-muted-foreground/60">(Ví dụ: SUMMER50)</span>
            </label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleChange}
              disabled={!!voucher} // Không cho sửa code khi edit để bảo toàn dữ liệu
              placeholder="Nhập mã viết hoa không dấu"
              className={`flex h-11 w-full rounded-xl border bg-[#20242D] px-4 py-2 text-sm text-white placeholder-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all ${
                errors.code ? 'border-destructive' : 'border-border'
              }`}
            />
            {errors.code && <span className="text-xs text-destructive font-medium mt-0.5">{errors.code}</span>}
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Mô tả chương trình khuyến mại</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Ví dụ: Giảm giá đặt cọc bàn tiệc nhân dịp hè..."
              maxLength={255}
              className="w-full min-h-[72px] rounded-xl border border-border bg-[#20242D] px-4 py-2 text-sm text-white placeholder-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all resize-y"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Discount Type */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Hình thức giảm <span className="text-primary">*</span></label>
              <select
                name="discountType"
                value={formData.discountType}
                onChange={handleChange}
                className="flex h-11 w-full rounded-xl border border-border bg-[#20242D] px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
              >
                <option value="percentage">Phần trăm (%)</option>
                <option value="fixed_amount">Số tiền cố định (đ)</option>
              </select>
            </div>

            {/* Discount Value */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Mức giảm <span className="text-primary">*</span></label>
              <input
                type="number"
                name="discountValue"
                value={formData.discountValue}
                onChange={handleChange}
                placeholder={formData.discountType === 'percentage' ? 'Ví dụ: 15' : 'Ví dụ: 50000'}
                className={`flex h-11 w-full rounded-xl border bg-[#20242D] px-4 py-2 text-sm text-white placeholder-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all ${
                  errors.discountValue ? 'border-destructive' : 'border-border'
                }`}
              />
              {errors.discountValue && <span className="text-xs text-destructive font-medium mt-0.5">{errors.discountValue}</span>}
            </div>
          </div>

          {/* Max Discount Amount */}
          {formData.discountType === 'percentage' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Mức giảm tối đa (đ) <span className="text-[10px] text-muted-foreground/60">(để trống nếu không giới hạn)</span></label>
              <input
                type="number"
                name="maxDiscountAmount"
                value={formData.maxDiscountAmount}
                onChange={handleChange}
                placeholder="Ví dụ: 100000"
                className="flex h-11 w-full rounded-xl border border-border bg-[#20242D] px-4 py-2 text-sm text-white placeholder-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Min Order Amount */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Đơn đặt tối thiểu (đ)</label>
              <input
                type="number"
                name="minOrderAmount"
                value={formData.minOrderAmount}
                onChange={handleChange}
                placeholder="Ví dụ: 200000"
                className={`flex h-11 w-full rounded-xl border bg-[#20242D] px-4 py-2 text-sm text-white placeholder-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all ${
                  errors.minOrderAmount ? 'border-destructive' : 'border-border'
                }`}
              />
              {errors.minOrderAmount && <span className="text-xs text-destructive font-medium mt-0.5">{errors.minOrderAmount}</span>}
            </div>

            {/* Per Customer Limit */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Lượt dùng tối đa / khách</label>
              <input
                type="number"
                name="perCustomerLimit"
                value={formData.perCustomerLimit}
                onChange={handleChange}
                min="1"
                className="flex h-11 w-full rounded-xl border border-border bg-[#20242D] px-4 py-2 text-sm text-white placeholder-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Global Usage Limit */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tổng lượt dùng hệ thống <span className="text-[10px] text-muted-foreground/60">(để trống nếu không giới hạn)</span></label>
              <input
                type="number"
                name="globalUsageLimit"
                value={formData.globalUsageLimit}
                onChange={handleChange}
                placeholder="Ví dụ: 100"
                className="flex h-11 w-full rounded-xl border border-border bg-[#20242D] px-4 py-2 text-sm text-white placeholder-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
              />
            </div>

            {/* Start Date */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Ngày bắt đầu</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="flex h-11 w-full rounded-xl border border-border bg-[#20242D] px-4 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
              />
            </div>
          </div>

          {/* End Date */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Ngày kết thúc <span className="text-[10px] text-muted-foreground/60">(để trống nếu không thời hạn)</span></label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              className={`flex h-11 w-full rounded-xl border bg-[#20242D] px-4 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all ${
                errors.endDate ? 'border-destructive' : 'border-border'
              }`}
            />
            {errors.endDate && <span className="text-xs text-destructive font-medium mt-0.5">{errors.endDate}</span>}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 border-t border-border/40 pt-4 mt-2">
            <button
              type="submit"
              className="flex-1 h-11 rounded-xl bg-primary text-[#0F1115] font-bold text-xs uppercase tracking-wider hover:bg-primary/95 transition-all flex items-center justify-center gap-1.5 cursor-pointer order-last sm:order-first"
            >
              <Save size={14} />
              <span>{voucher ? 'Cập nhật' : 'Tạo mới'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-11 rounded-xl border border-border bg-transparent text-muted-foreground hover:text-white hover:bg-white/5 transition-all flex items-center justify-center text-xs font-bold uppercase tracking-wider cursor-pointer"
            >
              Hủy bỏ
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default VoucherFormModal;
