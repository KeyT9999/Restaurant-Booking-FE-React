import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { Button } from '../ui/button';

export default function TableForm({ table, statusOptions, onSubmit, onClose }) {
  const isEdit = !!table;

  const [formData, setFormData] = useState({
    tableNumber: '',
    capacity: 4,
    zone: '',
    status: 'available',
    depositAmount: 0,
    note: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!table) return undefined;

    const timeoutId = window.setTimeout(() => {
      setFormData({
        tableNumber: table.tableNumber || '',
        capacity: table.capacity || 4,
        zone: table.zone || '',
        status: table.status || 'available',
        depositAmount: table.depositAmount || 0,
        note: table.note || ''
      });
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [table]);

  const validate = () => {
    const newErrors = {};
    if (!formData.tableNumber.trim()) {
      newErrors.tableNumber = 'Tên hoặc số bàn là bắt buộc';
    } else if (formData.tableNumber.length > 50) {
      newErrors.tableNumber = 'Tên hoặc số bàn tối đa 50 ký tự';
    }

    if (!formData.capacity || formData.capacity <= 0) {
      newErrors.capacity = 'Sức chứa phải lớn hơn 0';
    }

    if (formData.depositAmount < 0) {
      newErrors.depositAmount = 'Tiền đặt cọc không được âm';
    }

    if (formData.note && formData.note.length > 500) {
      newErrors.note = 'Ghi chú tối đa 500 ký tự';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    let finalValue = value;
    
    if (type === 'number') {
      finalValue = value === '' ? '' : Number(value);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: finalValue
    }));

    // Clear validation error when typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl border border-border bg-card shadow-2xl animate-in fade-in zoom-in-95 duration-200 text-left" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-5">
          <h2 className="font-serif text-lg font-bold text-white">
            {isEdit ? 'Chỉnh sửa thông tin bàn' : 'Thêm bàn mới'}
          </h2>
          <button 
            type="button"
            className="text-muted-foreground hover:text-white transition rounded-lg p-1 hover:bg-secondary/40" 
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Tên/Số bàn <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                name="tableNumber"
                value={formData.tableNumber}
                onChange={handleChange}
                placeholder="Ví dụ: Bàn 1, VIP-01"
                className={`bg-[#0F1115] border text-white text-sm rounded-xl px-3 py-2 focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none transition-all ${
                  errors.tableNumber ? 'border-destructive' : 'border-border'
                }`}
                required
              />
              {errors.tableNumber && <span className="text-xs text-rose-400 font-medium mt-0.5">{errors.tableNumber}</span>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Sức chứa (người) <span className="text-destructive">*</span>
              </label>
              <input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                min="1"
                className={`bg-[#0F1115] border text-white text-sm rounded-xl px-3 py-2 focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none transition-all ${
                  errors.capacity ? 'border-destructive' : 'border-border'
                }`}
                required
              />
              {errors.capacity && <span className="text-xs text-rose-400 font-medium mt-0.5">{errors.capacity}</span>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Khu vực / Zone</label>
              <input
                type="text"
                name="zone"
                value={formData.zone}
                onChange={handleChange}
                placeholder="Ví dụ: Tầng 1, VIP, Ngoài trời"
                className="bg-[#0F1115] border border-border text-white text-sm rounded-xl px-3 py-2 focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Trạng thái ban đầu</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="bg-[#0F1115] border border-border text-white text-xs rounded-xl px-3 py-2 h-9 focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none transition-all cursor-pointer"
              >
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tiền đặt cọc bàn (VNĐ)</label>
            <input
              type="number"
              name="depositAmount"
              value={formData.depositAmount}
              onChange={handleChange}
              min="0"
              step="1000"
              placeholder="0"
              className={`bg-[#0F1115] border text-white text-sm rounded-xl px-3 py-2 focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none transition-all ${
                errors.depositAmount ? 'border-destructive' : 'border-border'
              }`}
            />
            {errors.depositAmount && <span className="text-xs text-rose-400 font-medium mt-0.5">{errors.depositAmount}</span>}
            <span className="text-[11px] text-muted-foreground/60">Nhập 0 nếu không cần đặt cọc bàn này</span>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Ghi chú</label>
            <textarea
              name="note"
              value={formData.note}
              onChange={handleChange}
              placeholder="Ví dụ: Cạnh cửa sổ, view sông, gần sân khấu..."
              rows="3"
              className={`bg-[#0F1115] border text-white text-sm rounded-xl px-3 py-2 focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none transition-all resize-y ${
                errors.note ? 'border-destructive' : 'border-border'
              }`}
            />
            {errors.note && <span className="text-xs text-rose-400 font-medium mt-0.5">{errors.note}</span>}
          </div>

          {/* Footer Actions */}
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
              className="bg-primary hover:bg-primary/95 text-black font-semibold text-xs h-9"
            >
              <Save size={14} className="mr-1.5" /> Lưu thông tin
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
