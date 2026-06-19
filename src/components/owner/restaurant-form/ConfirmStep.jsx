import { useState } from 'react';
import SafeImage from '../../common/SafeImage';

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
    <div className="bg-[#0F1115]/30 border border-border rounded-xl p-4 space-y-3.5">
      <div className="flex items-center justify-between border-b border-border/40 pb-2">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider">{title}</h3>
        <button 
          type="button" 
          className="text-[11px] px-2.5 py-1 rounded-lg border border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary font-semibold transition cursor-pointer" 
          onClick={() => onEdit(stepNum)}
        >
          ✏️ Sửa
        </button>
      </div>
      <div className="space-y-2.5 text-xs text-muted-foreground">{children}</div>
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
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-1 sm:gap-4 pb-2 border-b border-border/20 last:border-0 last:pb-0">
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
          <div className="sm:col-span-3 text-white">
            <ul className="list-disc list-inside space-y-0.5">
              {filtered.map((item, idx) => (
                <li key={idx} className="text-xs leading-normal">{item}</li>
              ))}
            </ul>
          </div>
        </div>
      );
    }
    displayValue = filtered[0];
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-4 gap-1 sm:gap-4 pb-2 border-b border-border/20 last:border-0 last:pb-0">
      <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
      <span className="sm:col-span-3 text-white leading-normal font-medium">{displayValue}</span>
    </div>
  );
}

export default function ConfirmStep({ data, onEdit, onSubmit, isSubmitting, isEdit }) {
  const [confirmed, setConfirmed] = useState(false);

  const address = data.address || {};
  const hours = data.operatingHours || {};

  const formatPrice = (val) => {
    if (!val && val !== 0) return null;
    return Number(val).toLocaleString('vi-VN') + ' ₫';
  };

  return (
    <div className="space-y-5 text-left" id="step-confirm">
      <h2 className="font-serif text-xl font-bold text-white flex items-center gap-2">
        <span className="text-lg">✅</span>
        Xác nhận thông tin
      </h2>
      <p className="text-xs text-muted-foreground">
        {isEdit ? 'Kiểm tra lại toàn bộ thông tin trước khi cập nhật nhà hàng.' : 'Kiểm tra lại toàn bộ thông tin trước khi tạo nhà hàng.'}
      </p>

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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {Object.entries(DAY_LABELS).map(([key, label]) => {
              const dayData = hours[key];
              if (!dayData) return null;
              return (
                <div key={key} className="flex justify-between items-center bg-[#0F1115]/40 p-2 rounded-lg border border-border/60">
                  <span className="font-medium text-white">{label}</span>
                  <span className="text-muted-foreground">
                    {dayData.closed ? '🔒 Nghỉ ngày này' : `${dayData.open || '--:--'} → ${dayData.close || '--:--'}`}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="italic text-muted-foreground">Chưa thiết lập giờ hoạt động</p>
        )}
      </SectionCard>

      {/* Section 5: Additional Info */}
      <SectionCard title="🖼️ Thông tin bổ sung" stepNum={5} onEdit={onEdit}>
        {data.logo ? (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-1 sm:gap-4 pb-2 border-b border-border/20">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Logo</span>
            <span className="sm:col-span-3">
              <SafeImage
                src={data.logo}
                alt="Logo"
                className="max-w-[60px] max-h-[60px] rounded-lg border border-border/80 object-cover shadow"
                fallback={<span className="text-xs text-muted-foreground">Anh logo khong tai duoc</span>}
              />
            </span>
          </div>
        ) : null}
        {data.coverImage ? (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-1 sm:gap-4 pb-2 border-b border-border/20">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Anh bia</span>
            <span className="sm:col-span-3">
              <SafeImage
                src={data.coverImage}
                alt="Anh bia nha hang"
                className="h-20 w-40 rounded-lg border border-border/80 object-cover shadow"
                fallback={<span className="text-xs text-muted-foreground">Anh bia khong tai duoc</span>}
              />
            </span>
          </div>
        ) : null}
        {Array.isArray(data.galleryImages) && data.galleryImages.filter(Boolean).length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-1 sm:gap-4 pb-2 border-b border-border/20">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Anh khac</span>
            <div className="sm:col-span-3 flex flex-wrap gap-2">
              {data.galleryImages.filter(Boolean).slice(0, 6).map((url, index) => (
                <SafeImage
                  key={`${url}-${index}`}
                  src={url}
                  alt={`Anh nha hang ${index + 1}`}
                  className="h-14 w-20 rounded-lg border border-border/80 object-cover shadow"
                  fallback={<span className="inline-flex h-14 w-20 items-center justify-center rounded-lg border border-border text-[10px] text-muted-foreground">Loi anh</span>}
                />
              ))}
              {data.galleryImages.filter(Boolean).length > 6 && (
                <span className="inline-flex h-14 items-center rounded-lg border border-border px-3 text-xs font-semibold text-muted-foreground">
                  +{data.galleryImages.filter(Boolean).length - 6}
                </span>
              )}
            </div>
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
        <InfoRow label="Thiết lập Thực đơn" value={data.hasMenu ? '✅ Đã hoàn thành' : '❌ Chưa hoàn thành'} />
        <InfoRow label="Thiết lập Sơ đồ bàn" value={data.hasTableLayout ? '✅ Đã hoàn thành' : '❌ Chưa hoàn thành'} />
      </SectionCard>

      {/* Confirmation checkbox */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mt-6">
        <label className="flex items-center gap-2.5 text-xs text-muted-foreground select-none cursor-pointer">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            className="h-4.5 w-4.5 rounded border-border bg-[#0F1115] text-primary focus:ring-primary focus:ring-offset-0 cursor-pointer"
            id="confirm-checkbox"
          />
          <span className="text-white font-medium">
            Tôi xác nhận toàn bộ thông tin khai báo ở trên là chính xác và trung thực
          </span>
        </label>
      </div>

      {/* Submit button */}
      <div className="flex justify-center mt-6">
        <button
          type="button"
          onClick={onSubmit}
          disabled={!confirmed || isSubmitting}
          className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-primary text-black font-semibold text-sm hover:bg-primary/95 transition-all shadow-lg hover:shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          id="btn-create-restaurant"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              <span>{isEdit ? 'Đang cập nhật...' : 'Đang tạo nhà hàng...'}</span>
            </>
          ) : (
            <span>{isEdit ? '💾 Cập nhật thông tin nhà hàng' : '🏗️ Đăng ký nhà hàng'}</span>
          )}
        </button>
      </div>
    </div>
  );
}
