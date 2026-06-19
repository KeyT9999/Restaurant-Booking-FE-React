import { useState, useMemo } from 'react';

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
    <div className="space-y-4 text-left" id="step-address">
      <h2 className="font-serif text-xl font-bold text-white flex items-center gap-2">
        <span className="text-lg">📍</span>
        Địa chỉ nhà hàng
      </h2>
      <p className="text-xs text-muted-foreground">Xác định vị trí chính xác để khách hàng dễ dàng tìm thấy.</p>

      {/* City */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground" htmlFor="address-city">
          Tỉnh/Thành phố <span className="text-destructive">*</span>
        </label>
        <select
          id="address-city"
          className={`bg-[#0F1115] border text-white text-xs rounded-xl px-3 py-2.5 h-11 focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none transition-all cursor-pointer ${
            errors?.['address.city'] ? 'border-destructive' : 'border-border'
          }`}
          value={address.city || ''}
          onChange={(e) => handleAddressChange('city', e.target.value)}
        >
          <option value="">— Chọn Tỉnh/Thành phố —</option>
          {CITIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        {errors?.['address.city'] && <span className="text-xs text-rose-450 font-medium mt-0.5">{errors['address.city']}</span>}
      </div>

      {/* District */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground" htmlFor="address-district">
          Quận/Huyện <span className="text-destructive">*</span>
        </label>
        <input
          id="address-district"
          type="text"
          className={`bg-[#0F1115] border text-white text-sm rounded-xl px-3 py-2.5 focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none transition-all ${
            errors?.['address.district'] ? 'border-destructive' : 'border-border'
          }`}
          placeholder="Ví dụ: Hai Bà Trưng, Cầu Giấy"
          value={address.district || ''}
          onChange={(e) => handleAddressChange('district', e.target.value)}
        />
        {errors?.['address.district'] && <span className="text-xs text-rose-450 font-medium mt-0.5">{errors['address.district']}</span>}
      </div>

      {/* Ward */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground" htmlFor="address-ward">
          Phường/Xã <span className="text-destructive">*</span>
        </label>
        <input
          id="address-ward"
          type="text"
          className={`bg-[#0F1115] border text-white text-sm rounded-xl px-3 py-2.5 focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none transition-all ${
            errors?.['address.ward'] ? 'border-destructive' : 'border-border'
          }`}
          placeholder="Ví dụ: Phạm Đình Hổ, Dịch Vọng Hậu"
          value={address.ward || ''}
          onChange={(e) => handleAddressChange('ward', e.target.value)}
        />
        {errors?.['address.ward'] && <span className="text-xs text-rose-450 font-medium mt-0.5">{errors['address.ward']}</span>}
      </div>

      {/* Street */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground" htmlFor="address-street">
          Số nhà, tên đường <span className="text-destructive">*</span>
        </label>
        <input
          id="address-street"
          type="text"
          className={`bg-[#0F1115] border text-white text-sm rounded-xl px-3 py-2.5 focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none transition-all ${
            errors?.['address.street'] ? 'border-destructive' : 'border-border'
          }`}
          placeholder="Ví dụ: 13 Lò Đúc"
          value={address.street || ''}
          onChange={(e) => handleAddressChange('street', e.target.value)}
        />
        {errors?.['address.street'] && <span className="text-xs text-rose-450 font-medium mt-0.5">{errors['address.street']}</span>}
      </div>

      {/* Full Address */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Địa chỉ đầy đủ hiển thị</label>
        <div className="bg-[#0F1115]/50 border border-border/80 border-dashed text-xs text-muted-foreground italic rounded-xl px-4 py-3">
          {fullAddress}
        </div>
      </div>

      {/* Coordinates toggle */}
      <div className="pt-2">
        <button
          type="button"
          className="text-xs text-muted-foreground hover:text-primary transition-all flex items-center gap-1 cursor-pointer bg-transparent"
          onClick={() => setShowCoordinates(!showCoordinates)}
        >
          {showCoordinates ? '▲ Ẩn tọa độ bản đồ' : '▼ Thêm tọa độ GPS (nâng cao)'}
        </button>
      </div>

      {showCoordinates && (
        <div className="grid grid-cols-2 gap-4 animate-in fade-in duration-200">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground" htmlFor="coord-lat">
              Vĩ độ (Latitude)
            </label>
            <input
              id="coord-lat"
              type="number"
              className={`bg-[#0F1115] border text-white text-sm rounded-xl px-3 py-2.5 focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none transition-all ${
                errors?.['coordinates.latitude'] ? 'border-destructive' : 'border-border'
              }`}
              placeholder="Ví dụ: 21.0285"
              value={coordinates.latitude ?? ''}
              onChange={(e) => handleCoordChange('latitude', e.target.value)}
              step="0.0000001"
              min={-90}
              max={90}
            />
            {errors?.['coordinates.latitude'] && <span className="text-xs text-rose-450 font-medium mt-0.5">{errors['coordinates.latitude']}</span>}
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground" htmlFor="coord-lng">
              Kinh độ (Longitude)
            </label>
            <input
              id="coord-lng"
              type="number"
              className={`bg-[#0F1115] border text-white text-sm rounded-xl px-3 py-2.5 focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none transition-all ${
                errors?.['coordinates.longitude'] ? 'border-destructive' : 'border-border'
              }`}
              placeholder="Ví dụ: 105.8542"
              value={coordinates.longitude ?? ''}
              onChange={(e) => handleCoordChange('longitude', e.target.value)}
              step="0.0000001"
              min={-180}
              max={180}
            />
            {errors?.['coordinates.longitude'] && <span className="text-xs text-rose-450 font-medium mt-0.5">{errors['coordinates.longitude']}</span>}
          </div>
        </div>
      )}
    </div>
  );
}
