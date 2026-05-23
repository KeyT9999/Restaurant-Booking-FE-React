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
    <div className="form-step" id="step-operating-hours">
      <h2 className="step-title">
        <span className="step-icon">🕐</span>
        Thời gian hoạt động
      </h2>
      <p className="step-desc">Thiết lập khung giờ mở cửa cho từng ngày trong tuần.</p>

      {/* Apply all toggle */}
      <div className="hours-controls">
        <label className="toggle-label">
          <input
            type="checkbox"
            checked={applyAll}
            onChange={handleApplyAll}
            className="toggle-checkbox"
          />
          <span className="toggle-text">Áp dụng chung giờ cho cả tuần</span>
        </label>
        <button type="button" className="btn-copy-hours" onClick={copyMondayToAll}>
          📋 Sao chép Thứ 2 cho tất cả
        </button>
      </div>

      {/* Days grid */}
      <div className="hours-grid">
        {DAYS.map((day) => {
          const dayData = hours[day.key] || DEFAULT_HOURS;
          const isClosed = dayData.closed;
          const dayErrors = errors?.[day.key];

          return (
            <div
              key={day.key}
              className={`hours-day ${isClosed ? 'is-closed' : ''} ${dayErrors ? 'has-error' : ''}`}
            >
              <div className="hours-day-header">
                <span className="day-name">{day.label}</span>
                <label className="closed-toggle">
                  <input
                    type="checkbox"
                    checked={isClosed}
                    onChange={(e) => handleDayChange(day.key, 'closed', e.target.checked)}
                  />
                  <span className="closed-text">Nghỉ</span>
                </label>
              </div>

              {!isClosed && (
                <div className="hours-time-row">
                  <div className="time-field">
                    <label className="time-label">Mở cửa</label>
                    <input
                      type="time"
                      className="form-input time-input"
                      value={dayData.open || '08:00'}
                      onChange={(e) => handleDayChange(day.key, 'open', e.target.value)}
                    />
                  </div>
                  <span className="time-separator">→</span>
                  <div className="time-field">
                    <label className="time-label">Đóng cửa</label>
                    <input
                      type="time"
                      className="form-input time-input"
                      value={dayData.close || '22:00'}
                      onChange={(e) => handleDayChange(day.key, 'close', e.target.value)}
                    />
                  </div>
                </div>
              )}

              {isClosed && (
                <div className="closed-notice">🔒 Nghỉ ngày này</div>
              )}

              {dayErrors && <span className="field-error">{dayErrors}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
