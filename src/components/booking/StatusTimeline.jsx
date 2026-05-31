import './StatusTimeline.css';

const statusLabels = {
  pending: 'Đặt bàn chờ duyệt',
  confirmed: 'Đặt bàn đã xác nhận',
  completed: 'Dùng bữa hoàn tất',
  cancelled: 'Đơn đặt đã hủy',
  no_show: 'Khách không đến (no-show)',
};

export default function StatusTimeline({ statusHistory = [] }) {
  if (!statusHistory || statusHistory.length === 0) return null;

  // Sort by time ascending
  const sortedHistory = [...statusHistory].sort(
    (a, b) => new Date(a.changedAt) - new Date(b.changedAt)
  );

  return (
    <div className="status-timeline" aria-label="Lịch sử trạng thái đặt bàn">
      <h5 className="timeline-title">📊 Lịch sử trạng thái</h5>
      <div className="timeline-container" role="list">
        {sortedHistory.map((historyItem, idx) => {
          const isLast = idx === sortedHistory.length - 1;
          const dateStr = new Date(historyItem.changedAt).toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });

          return (
            <div
              key={historyItem._id || idx}
              className={`timeline-item ${isLast ? 'timeline-item-active' : ''}`}
              role="listitem"
              aria-label={`${statusLabels[historyItem.status] || historyItem.status} - ${dateStr}`}
            >
              <div className="timeline-marker" aria-hidden="true">
                <div className={`timeline-dot ${historyItem.status}`}></div>
                {!isLast && <div className="timeline-line"></div>}
              </div>
              <div className="timeline-content">
                <div className="timeline-header">
                  <span className="timeline-status-label">
                    {statusLabels[historyItem.status] || historyItem.status}
                  </span>
                  <span className="timeline-time">{dateStr}</span>
                </div>
                {historyItem.note && (
                  <p className="timeline-note">{historyItem.note}</p>
                )}
                {historyItem.changedBy && historyItem.changedBy.fullName && (
                  <span className="timeline-actor">Thực hiện bởi: {historyItem.changedBy.fullName}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
