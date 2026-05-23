import { useState } from 'react';

const PRICE_LABELS = {
  budget: 'Bình dân',
  moderate: 'Trung cấp',
  expensive: 'Cao cấp',
  luxury: 'Sang trọng',
};

const DAY_LABELS = {
  monday: 'Thứ 2',
  tuesday: 'Thứ 3',
  wednesday: 'Thứ 4',
  thursday: 'Thứ 5',
  friday: 'Thứ 6',
  saturday: 'Thứ 7',
  sunday: 'Chủ nhật',
};

function SectionCard({ title, stepNum, onEdit, children }) {
  return (
    <div className="confirm-section">
      <div className="confirm-section-header">
        <h3 className="confirm-section-title">{title}</h3>
        <button type="button" className="btn-edit-section" onClick={() => onEdit(stepNum)}>
          ✏️ Sửa
        </button>
      </div>
      <div className="confirm-section-body">{children}</div>
    </div>
  );
}

function InfoRow({ label, value }) {
  if (!value && value !== 0) return null;

  let displayValue = value;
  if (Array.isArray(value)) {
    const filtered = value.filter(Boolean);
    if (filtered.length === 0) return null;

    if (filtered.length > 1) {
      return (
        <div className="confirm-row align-start">
          <span className="confirm-label">{label}</span>
          <div className="confirm-value">
            <ul className="confirm-bullet-list">
              {filtered.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      );
    }
    displayValue = filtered[0];
  }

  return (
    <div className="confirm-row">
      <span className="confirm-label">{label}</span>
      <span className="confirm-value">{displayValue}</span>
    </div>
  );
}

export default function ConfirmStep({ data, onEdit, onSubmit, isSubmitting }) {
  const [confirmed, setConfirmed] = useState(false);

  const address = data.address || {};
  const hours = data.operatingHours || {};

  const formatPrice = (val) => {
    if (!val && val !== 0) return null;
    return Number(val).toLocaleString('vi-VN') + ' ₫';
  };

  return (
    <div className="form-step" id="step-confirm">
      <h2 className="step-title">
        <span className="step-icon">✅</span>
        Xác nhận thông tin
      </h2>
      <p className="step-desc">Kiểm tra lại toàn bộ thông tin trước khi tạo nhà hàng.</p>

      {/* Section 1: Basic Info */}
      <SectionCard title="📋 Thông tin cơ bản" stepNum={1} onEdit={onEdit}>
        <InfoRow label="Tên nhà hàng" value={data.name} />
        <InfoRow label="Mô tả" value={data.description} />
        <InfoRow label="Loại ẩm thực" value={(data.cuisineTypes || []).join(', ') || null} />
        <InfoRow label="Phân khúc giá" value={PRICE_LABELS[data.priceRange]} />
        <InfoRow label="Sức chứa" value={data.capacity ? `${data.capacity} khách` : null} />
      </SectionCard>

      {/* Section 2: Contact */}
      <SectionCard title="📞 Thông tin liên hệ" stepNum={2} onEdit={onEdit}>
        <InfoRow label="Số điện thoại" value={data.phoneNumber} />
        <InfoRow label="Email" value={data.email} />
      </SectionCard>

      {/* Section 3: Address */}
      <SectionCard title="📍 Địa chỉ" stepNum={3} onEdit={onEdit}>
        <InfoRow label="Địa chỉ" value={address.fullAddress || [address.street, address.ward, address.district, address.city].filter(Boolean).join(', ')} />
        {data.coordinates?.latitude && (
          <InfoRow label="Tọa độ" value={`${data.coordinates.latitude}, ${data.coordinates.longitude}`} />
        )}
      </SectionCard>

      {/* Section 4: Operating Hours */}
      <SectionCard title="🕐 Thời gian hoạt động" stepNum={4} onEdit={onEdit}>
        {Object.keys(hours).length > 0 ? (
          <div className="confirm-hours-grid">
            {Object.entries(DAY_LABELS).map(([key, label]) => {
              const dayData = hours[key];
              if (!dayData) return null;
              return (
                <div key={key} className="confirm-hours-row">
                  <span className="confirm-day">{label}</span>
                  <span className="confirm-time">
                    {dayData.closed ? '🔒 Nghỉ' : `${dayData.open || '--:--'} → ${dayData.close || '--:--'}`}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="confirm-empty">Chưa thiết lập</p>
        )}
      </SectionCard>

      {/* Section 5: Additional Info */}
      <SectionCard title="🖼️ Thông tin bổ sung" stepNum={5} onEdit={onEdit}>
        {data.logo ? (
          <div className="confirm-row">
            <span className="confirm-label">Logo</span>
            <span className="confirm-value">
              <img src={data.logo} alt="Logo" style={{ maxWidth: '60px', maxHeight: '60px', borderRadius: '4px', border: '1px solid rgba(216, 203, 184, 0.15)' }} />
            </span>
          </div>
        ) : null}
        <InfoRow label="Giá trung bình" value={formatPrice(data.averagePrice)} />
        <InfoRow label="Giá thấp nhất" value={formatPrice(data.priceRangeMin)} />
        <InfoRow label="Giá cao nhất" value={formatPrice(data.priceRangeMax)} />
        <InfoRow label="Dòng trạng thái" value={data.statusMessage} />
        <InfoRow label="Điểm nổi bật" value={data.summaryHighlights} />
        <InfoRow label="Phù hợp cho" value={data.suitableFor} />
        <InfoRow label="Món đặc trưng" value={data.signatureDishes} />
        <InfoRow label="Tiện ích" value={data.amenities} />
        <InfoRow label="Quy định" value={data.policyRules} />
        <InfoRow label="Lưu ý đặt bàn" value={data.bookingNotes} />
      </SectionCard>

      {/* Confirmation checkbox */}
      <div className="confirm-checkbox-wrapper">
        <label className="confirm-checkbox-label">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            className="confirm-checkbox"
            id="confirm-checkbox"
          />
          <span className="confirm-checkbox-text">
            Tôi xác nhận toàn bộ thông tin khai báo trên là chính xác
          </span>
        </label>
      </div>

      {/* Submit button */}
      <div className="confirm-actions">
        <button
          type="button"
          className="btn-submit-restaurant"
          onClick={onSubmit}
          disabled={!confirmed || isSubmitting}
          id="btn-create-restaurant"
        >
          {isSubmitting ? (
            <>
              <span className="btn-spinner" />
              Đang tạo...
            </>
          ) : (
            '🏗️ Tạo nhà hàng'
          )}
        </button>
      </div>
    </div>
  );
}
