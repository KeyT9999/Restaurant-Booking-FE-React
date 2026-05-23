import { useState, useEffect, useMemo } from 'react';

// Data tỉnh/thành, quận/huyện, phường/xã Việt Nam (simplified)
// Trong thực tế nên dùng API hoặc file JSON đầy đủ
const CITIES = [
  'Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ',
  'An Giang', 'Bà Rịa - Vũng Tàu', 'Bắc Giang', 'Bắc Kạn', 'Bạc Liêu',
  'Bắc Ninh', 'Bến Tre', 'Bình Định', 'Bình Dương', 'Bình Phước',
  'Bình Thuận', 'Cà Mau', 'Cao Bằng', 'Đắk Lắk', 'Đắk Nông',
  'Điện Biên', 'Đồng Nai', 'Đồng Tháp', 'Gia Lai', 'Hà Giang',
  'Hà Nam', 'Hà Tĩnh', 'Hải Dương', 'Hậu Giang', 'Hòa Bình',
  'Hưng Yên', 'Khánh Hòa', 'Kiên Giang', 'Kon Tum', 'Lai Châu',
  'Lâm Đồng', 'Lạng Sơn', 'Lào Cai', 'Long An', 'Nam Định',
  'Nghệ An', 'Ninh Bình', 'Ninh Thuận', 'Phú Thọ', 'Phú Yên',
  'Quảng Bình', 'Quảng Nam', 'Quảng Ngãi', 'Quảng Ninh', 'Quảng Trị',
  'Sóc Trăng', 'Sơn La', 'Tây Ninh', 'Thái Bình', 'Thái Nguyên',
  'Thanh Hóa', 'Thừa Thiên Huế', 'Tiền Giang', 'Trà Vinh', 'Tuyên Quang',
  'Vĩnh Long', 'Vĩnh Phúc', 'Yên Bái',
];

export default function AddressStep({ data, onChange, errors }) {
  const address = data.address || {};
  const coordinates = data.coordinates || {};

  const [showCoordinates, setShowCoordinates] = useState(
    !!(coordinates.latitude || coordinates.longitude)
  );

  const handleAddressChange = (field, value) => {
    const newAddress = { ...address, [field]: value };
    // Auto-generate fullAddress
    const parts = [newAddress.street, newAddress.ward, newAddress.district, newAddress.city].filter(Boolean);
    newAddress.fullAddress = parts.join(', ');
    onChange({ ...data, address: newAddress });
  };

  const handleCoordChange = (field, value) => {
    onChange({
      ...data,
      coordinates: { ...coordinates, [field]: value === '' ? null : Number(value) },
    });
  };

  const fullAddress = useMemo(() => {
    const parts = [address.street, address.ward, address.district, address.city].filter(Boolean);
    return parts.join(', ') || '—';
  }, [address.street, address.ward, address.district, address.city]);

  return (
    <div className="form-step" id="step-address">
      <h2 className="step-title">
        <span className="step-icon">📍</span>
        Địa chỉ nhà hàng
      </h2>
      <p className="step-desc">Xác định vị trí chính xác để khách hàng dễ dàng tìm thấy.</p>

      {/* City */}
      <div className={`form-group ${errors?.['address.city'] ? 'has-error' : ''}`}>
        <label className="form-label" htmlFor="address-city">
          Tỉnh/Thành phố <span className="required">*</span>
        </label>
        <select
          id="address-city"
          className="form-select"
          value={address.city || ''}
          onChange={(e) => handleAddressChange('city', e.target.value)}
        >
          <option value="">— Chọn Tỉnh/Thành phố —</option>
          {CITIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        {errors?.['address.city'] && <span className="field-error">{errors['address.city']}</span>}
      </div>

      {/* District */}
      <div className={`form-group ${errors?.['address.district'] ? 'has-error' : ''}`}>
        <label className="form-label" htmlFor="address-district">
          Quận/Huyện <span className="required">*</span>
        </label>
        <input
          id="address-district"
          type="text"
          className="form-input"
          placeholder="VD: Hai Bà Trưng"
          value={address.district || ''}
          onChange={(e) => handleAddressChange('district', e.target.value)}
        />
        {errors?.['address.district'] && <span className="field-error">{errors['address.district']}</span>}
      </div>

      {/* Ward */}
      <div className={`form-group ${errors?.['address.ward'] ? 'has-error' : ''}`}>
        <label className="form-label" htmlFor="address-ward">
          Phường/Xã <span className="required">*</span>
        </label>
        <input
          id="address-ward"
          type="text"
          className="form-input"
          placeholder="VD: Phạm Đình Hổ"
          value={address.ward || ''}
          onChange={(e) => handleAddressChange('ward', e.target.value)}
        />
        {errors?.['address.ward'] && <span className="field-error">{errors['address.ward']}</span>}
      </div>

      {/* Street */}
      <div className={`form-group ${errors?.['address.street'] ? 'has-error' : ''}`}>
        <label className="form-label" htmlFor="address-street">
          Số nhà, tên đường <span className="required">*</span>
        </label>
        <input
          id="address-street"
          type="text"
          className="form-input"
          placeholder="VD: 13 Lò Đúc"
          value={address.street || ''}
          onChange={(e) => handleAddressChange('street', e.target.value)}
        />
        {errors?.['address.street'] && <span className="field-error">{errors['address.street']}</span>}
      </div>

      {/* Full Address (auto-generated, read-only) */}
      <div className="form-group">
        <label className="form-label">Địa chỉ đầy đủ</label>
        <div className="full-address-preview">{fullAddress}</div>
      </div>

      {/* Coordinates toggle */}
      <div className="form-group">
        <button
          type="button"
          className="btn-toggle-coords"
          onClick={() => setShowCoordinates(!showCoordinates)}
        >
          {showCoordinates ? '▲ Ẩn tọa độ' : '▼ Thêm tọa độ (nâng cao)'}
        </button>
      </div>

      {showCoordinates && (
        <div className="coords-row">
          <div className={`form-group ${errors?.['coordinates.latitude'] ? 'has-error' : ''}`}>
            <label className="form-label" htmlFor="coord-lat">Vĩ độ (Latitude)</label>
            <input
              id="coord-lat"
              type="number"
              className="form-input"
              placeholder="VD: 21.0285"
              value={coordinates.latitude ?? ''}
              onChange={(e) => handleCoordChange('latitude', e.target.value)}
              step="0.0000001"
              min={-90}
              max={90}
            />
            {errors?.['coordinates.latitude'] && <span className="field-error">{errors['coordinates.latitude']}</span>}
          </div>
          <div className={`form-group ${errors?.['coordinates.longitude'] ? 'has-error' : ''}`}>
            <label className="form-label" htmlFor="coord-lng">Kinh độ (Longitude)</label>
            <input
              id="coord-lng"
              type="number"
              className="form-input"
              placeholder="VD: 105.8542"
              value={coordinates.longitude ?? ''}
              onChange={(e) => handleCoordChange('longitude', e.target.value)}
              step="0.0000001"
              min={-180}
              max={180}
            />
            {errors?.['coordinates.longitude'] && <span className="field-error">{errors['coordinates.longitude']}</span>}
          </div>
        </div>
      )}
    </div>
  );
}
