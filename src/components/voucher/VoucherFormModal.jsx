import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import VoucherCard from './VoucherCard';

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
      validateField(name, formattedValue, updated);
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
    code: formData.code || 'SUMMER50',
    name: formData.name || 'Tên Voucher của bạn',
    description: formData.description || 'Mô tả chi tiết chương trình khuyến mại...',
    discountType: formData.discountType,
    discountValue: Number(formData.discountValue) || 0,
    minOrderAmount: Number(formData.minOrderAmount) || 0,
    maxDiscountAmount: formData.maxDiscountAmount ? Number(formData.maxDiscountAmount) : null,
    endDate: formData.endDate || null,
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200" onClick={onClose}>
      <div 
        className="w-full max-w-4xl bg-card border border-border rounded-2xl p-6 md:p-8 flex flex-col gap-6 shadow-2xl relative max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200"
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

        {/* Two column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Form */}
          <form onSubmit={handleSubmit} className="lg:col-span-7 flex flex-col gap-5 text-left">
            
            {/* Display Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Tên hiển thị Voucher <span className="text-primary">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ví dụ: Giảm giá hè 2026"
                className={`flex h-11 w-full rounded-xl border bg-[#20242D] px-4 py-2 text-sm text-white placeholder-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all ${
                  errors.name ? 'border-destructive' : 'border-border'
                }`}
              />
              {errors.name && <span className="text-xs text-destructive font-medium mt-0.5">{errors.name}</span>}
            </div>

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
                disabled={!!voucher}
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

          {/* Live Preview Section */}
          <div className="lg:col-span-5 flex flex-col gap-4 border-t lg:border-t-0 lg:border-l border-border/40 pt-6 lg:pt-0 lg:pl-8">
            <h4 className="font-serif text-sm font-bold text-white uppercase tracking-wider">Xem trước hiển thị</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">Giao diện voucher khi hiển thị với khách hàng lúc đặt bàn:</p>
            <div className="my-2">
              <VoucherCard voucher={previewVoucher} isSaved={false} />
            </div>
            
            <div className="rounded-xl border border-border bg-[#1A1D24] p-4 text-[11px] leading-relaxed text-muted-foreground flex flex-col gap-2 mt-4">
              <h5 className="font-bold text-primary flex items-center gap-1">💡 Mẹo thiết kế ưu đãi:</h5>
              <ul className="list-disc pl-4 space-y-1.5">
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
