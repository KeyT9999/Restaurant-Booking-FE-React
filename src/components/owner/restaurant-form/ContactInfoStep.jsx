export default function ContactInfoStep({ data, onChange, errors }) {
  const handleChange = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-4 text-left">
      <h2 className="font-serif text-xl font-bold text-white flex items-center gap-2">
        <span className="text-lg">📞</span>
        Thông tin liên hệ
      </h2>
      <p className="text-xs text-muted-foreground">Thiết lập các kênh liên lạc chính thức của nhà hàng.</p>

      {/* Phone */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground" htmlFor="restaurant-phone">
          Số điện thoại chính <span className="text-destructive">*</span>
        </label>
        <input
          id="restaurant-phone"
          type="tel"
          className={`bg-[#0F1115] border text-white text-sm rounded-xl px-3 py-2.5 focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none transition-all ${
            errors?.phoneNumber ? 'border-destructive' : 'border-border'
          }`}
          placeholder="Ví dụ: 0901234567"
          value={data.phoneNumber || ''}
          onChange={(e) => handleChange('phoneNumber', e.target.value)}
          maxLength={20}
        />
        {errors?.phoneNumber && <span className="text-xs text-rose-405 font-medium mt-0.5">{errors.phoneNumber}</span>}
        <span className="text-[11px] text-muted-foreground/60">Định dạng: 10 chữ số, bắt đầu bằng 03/05/07/08/09</span>
      </div>

      {/* Email */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground" htmlFor="restaurant-email">
          Email nhà hàng <span className="text-destructive">*</span>
        </label>
        <input
          id="restaurant-email"
          type="email"
          className={`bg-[#0F1115] border text-white text-sm rounded-xl px-3 py-2.5 focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none transition-all ${
            errors?.email ? 'border-destructive' : 'border-border'
          }`}
          placeholder="Ví dụ: contact@nhahang.com"
          value={data.email || ''}
          onChange={(e) => handleChange('email', e.target.value)}
          maxLength={255}
        />
        {errors?.email && <span className="text-xs text-rose-450 font-medium mt-0.5">{errors.email}</span>}
      </div>
    </div>
  );
}
