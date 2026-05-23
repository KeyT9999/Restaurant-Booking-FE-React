import React from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Play, RefreshCcw, Edit, PlusCircle, Trash2 } from 'lucide-react';
import './ActivityTimeline.css';

export default function ActivityTimeline({ logs, loading, hasMore, onLoadMore }) {
  const getActionDetails = (action) => {
    switch (action) {
      case 'created':
        return { label: 'Tạo mới nhà hàng', color: '#60a5fa', icon: <PlusCircle size={14} /> };
      case 'approved':
        return { label: 'Phê duyệt hoạt động', color: '#34d399', icon: <CheckCircle2 size={14} /> };
      case 'rejected':
        return { label: 'Từ chối phê duyệt', color: '#f87171', icon: <XCircle size={14} /> };
      case 'suspended':
        return { label: 'Tạm ngưng hoạt động', color: '#fb923c', icon: <AlertTriangle size={14} /> };
      case 'unsuspended':
        return { label: 'Gỡ tạm ngưng', color: '#4ade80', icon: <Play size={14} /> };
      case 'deleted':
        return { label: 'Xóa nhà hàng (Soft Delete)', color: '#ef4444', icon: <Trash2 size={14} /> };
      case 'restored':
        return { label: 'Khôi phục nhà hàng', color: '#22c55e', icon: <RefreshCcw size={14} /> };
      case 'updated':
        return { label: 'Cập nhật thông tin', color: '#a78bfa', icon: <Edit size={14} /> };
      case 'featured':
        return { label: 'Thiết lập nổi bật', color: '#fbbf24', icon: <CheckCircle2 size={14} /> };
      case 'unfeatured':
        return { label: 'Hủy nổi bật', color: '#9ca3af', icon: <XCircle size={14} /> };
      default:
        return { label: action, color: 'var(--color-faded-stone)', icon: <Edit size={14} /> };
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!logs || logs.length === 0) {
    return (
      <div className="timeline-empty">
        <p>Chưa có lịch sử hoạt động nào được ghi nhận cho nhà hàng này.</p>
      </div>
    );
  }

  return (
    <div className="activity-timeline-container">
      <div className="timeline-list">
        {logs.map((log, index) => {
          const details = getActionDetails(log.action);
          const actor = log.performedBy?.fullName || 'Hệ thống';
          const actorRole = log.performedByRole === 'admin' ? 'Admin' : 'Chủ nhà hàng';

          return (
            <div key={log._id || index} className="timeline-item">
              <div className="timeline-marker" style={{ backgroundColor: details.color }}>
                {details.icon}
              </div>
              <div className="timeline-content">
                <div className="timeline-header">
                  <span className="timeline-action">{details.label}</span>
                  <span className="timeline-time">{formatDate(log.createdAt)}</span>
                </div>
                <div className="timeline-body">
                  <p className="timeline-actor">
                    Thực hiện bởi: <strong>{actor}</strong> ({actorRole})
                  </p>
                  {log.reason && (
                    <div className="timeline-reason">
                      <strong>Lý do:</strong> {log.reason}
                    </div>
                  )}
                  {log.metadata && log.metadata.changes && (
                    <div className="timeline-metadata">
                      <strong>Thay đổi:</strong>
                      <ul>
                        {Object.keys(log.metadata.changes).map((key) => {
                          const change = log.metadata.changes[key];
                          const labelMap = {
                            commissionRate: 'Tỷ lệ hoa hồng',
                            featured: 'Nổi bật',
                            active: 'Trạng thái hoạt động',
                          };
                          const fieldLabel = labelMap[key] || key;
                          const formatVal = (val) => {
                            if (val === true) return 'Bật';
                            if (val === false) return 'Tắt';
                            if (val === null || val === undefined) return 'Trống';
                            return val;
                          };
                          return (
                            <li key={key}>
                              {fieldLabel}: <span>{formatVal(change.old)}</span> &rarr; <span>{formatVal(change.new)}</span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {hasMore && (
        <div className="timeline-actions">
          <button className="btn-load-more" onClick={onLoadMore} disabled={loading}>
            {loading ? 'Đang tải...' : 'Xem thêm lịch sử'}
          </button>
        </div>
      )}
    </div>
  );
}
