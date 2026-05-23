export default function ContactInfoStep({ data, onChange, errors }) {
  const handleChange = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="form-step" id="step-contact-info">
      <h2 className="step-title">
        <span className="step-icon">📞</span>
        Thông tin liên hệ
      </h2>
      <p className="step-desc">Thiết lập các kênh liên lạc chính thức của nhà hàng.</p>

      {/* Phone */}
      <div className={`form-group ${errors?.phoneNumber ? 'has-error' : ''}`}>
        <label className="form-label" htmlFor="restaurant-phone">
          Số điện thoại chính <span className="required">*</span>
        </label>
        <input
          id="restaurant-phone"
          type="tel"
          className="form-input"
          placeholder="VD: 0901234567"
          value={data.phoneNumber || ''}
          onChange={(e) => handleChange('phoneNumber', e.target.value)}
          maxLength={20}
        />
        {errors?.phoneNumber && <span className="field-error">{errors.phoneNumber}</span>}
        <span className="field-hint">Định dạng: 10 số, bắt đầu bằng 03/05/07/08/09</span>
      </div>

      {/* Email */}
      <div className={`form-group ${errors?.email ? 'has-error' : ''}`}>
        <label className="form-label" htmlFor="restaurant-email">
          Email nhà hàng <span className="required">*</span>
        </label>
        <input
          id="restaurant-email"
          type="email"
          className="form-input"
          placeholder="VD: contact@nhahang.com"
          value={data.email || ''}
          onChange={(e) => handleChange('email', e.target.value)}
          maxLength={255}
        />
        {errors?.email && <span className="field-error">{errors.email}</span>}
      </div>

    </div>
  );
}
