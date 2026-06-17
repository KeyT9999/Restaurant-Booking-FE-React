import { useState } from 'react';

const DAYS = [
  { key: 'monday', label: 'Thứ 2' },
  { key: 'tuesday', label: 'Thứ 3' },
  { key: 'wednesday', label: 'Thứ 4' },
  { key: 'thursday', label: 'Thứ 5' },
  { key: 'friday', label: 'Thứ 6' },
  { key: 'saturday', label: 'Thứ 7' },
  { key: 'sunday', label: 'Chủ nhật' },
];

const DEFAULT_HOURS = { open: '08:00', close: '22:00', closed: false };

export default function OperatingHoursStep({ data, onChange, errors }) {
  const hours = data.operatingHours || {};
  const [applyAll, setApplyAll] = useState(false);

  const handleDayChange = (dayKey, field, value) => {
    const newHours = { ...hours };
    newHours[dayKey] = { ...(newHours[dayKey] || DEFAULT_HOURS), [field]: value };

    // If applyAll and changing monday, copy to all days
    if (applyAll && dayKey === 'monday') {
      for (const day of DAYS) {
        newHours[day.key] = { ...newHours[dayKey] };
      }
    }

    onChange({ ...data, operatingHours: newHours });
  };

  const handleApplyAll = () => {
    setApplyAll(!applyAll);
    if (!applyAll) {
      // Copy monday to all
      const mondayData = hours.monday || DEFAULT_HOURS;
      const newHours = {};
      for (const day of DAYS) {
        newHours[day.key] = { ...mondayData };
      }
      onChange({ ...data, operatingHours: newHours });
    }
  };

  const copyMondayToAll = () => {
    const mondayData = hours.monday || DEFAULT_HOURS;
    const newHours = {};
    for (const day of DAYS) {
      newHours[day.key] = { ...mondayData };
    }
    onChange({ ...data, operatingHours: newHours });
  };

  return (
    <div className="space-y-4 text-left" id="step-operating-hours">
      <h2 className="font-serif text-xl font-bold text-white flex items-center gap-2">
        <span className="text-lg">🕐</span>
        Thời gian hoạt động
      </h2>
      <p className="text-xs text-muted-foreground">Thiết lập khung giờ mở cửa cho từng ngày trong tuần.</p>

      {/* Apply all controls */}
      <div className="flex flex-wrap items-center gap-4 bg-[#0F1115]/50 border border-border p-4 rounded-xl mb-4">
        <label className="flex items-center gap-2 text-xs font-semibold text-white select-none cursor-pointer">
          <input
            type="checkbox"
            checked={applyAll}
            onChange={handleApplyAll}
            className="h-4 w-4 rounded border-border bg-[#0F1115] text-primary focus:ring-primary focus:ring-offset-0"
          />
          <span>Áp dụng chung giờ cho cả tuần</span>
        </label>
        <button 
          type="button" 
          className="text-xs px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-secondary/40 text-muted-foreground hover:text-white transition-all cursor-pointer bg-transparent"
          onClick={copyMondayToAll}
        >
          📋 Sao chép Thứ 2 cho tất cả
        </button>
      </div>

      {/* Days list */}
      <div className="space-y-2">
        {DAYS.map((day) => {
          const dayData = hours[day.key] || DEFAULT_HOURS;
          const isClosed = dayData.closed;
          const dayErrors = errors?.[day.key];

          return (
            <div
              key={day.key}
              className={`p-4 rounded-xl border bg-card transition-all ${
                isClosed 
                  ? 'border-border/60 opacity-60' 
                  : dayErrors 
                    ? 'border-destructive' 
                    : 'border-border hover:border-border/80'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-white">{day.label}</span>
                <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isClosed}
                    onChange={(e) => handleDayChange(day.key, 'closed', e.target.checked)}
                    className="h-4 w-4 rounded border-border bg-[#0F1115] text-destructive focus:ring-destructive focus:ring-offset-0"
                  />
                  <span>Đóng cửa (Nghỉ)</span>
                </label>
              </div>

              {!isClosed && (
                <div className="flex items-center gap-3 mt-3">
                  <div className="flex-1">
                    <label className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block mb-1">Giờ mở cửa</label>
                    <input
                      type="time"
                      className="bg-[#0F1115] border border-border text-white text-xs rounded-lg px-2.5 py-1.5 w-full focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                      value={dayData.open || '08:00'}
                      onChange={(e) => handleDayChange(day.key, 'open', e.target.value)}
                    />
                  </div>
                  <span className="text-muted-foreground text-sm self-end pb-2">→</span>
                  <div className="flex-1">
                    <label className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block mb-1">Giờ đóng cửa</label>
                    <input
                      type="time"
                      className="bg-[#0F1115] border border-border text-white text-xs rounded-lg px-2.5 py-1.5 w-full focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                      value={dayData.close || '22:00'}
                      onChange={(e) => handleDayChange(day.key, 'close', e.target.value)}
                    />
                  </div>
                </div>
              )}

              {isClosed && (
                <div className="text-xs text-muted-foreground/60 italic mt-2">🔒 Tạm nghỉ, không nhận khách ngày này</div>
              )}

              {dayErrors && <span className="text-xs text-rose-455 font-medium mt-1.5 block">{dayErrors}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
