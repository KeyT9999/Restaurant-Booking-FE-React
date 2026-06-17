import { CheckCircle2, XCircle, AlertTriangle, Play, RefreshCcw, Edit, PlusCircle, Trash2 } from 'lucide-react';

export default function ActivityTimeline({ logs, loading, hasMore, onLoadMore }) {
  const getActionDetails = (action) => {
    switch (action) {
      case 'created':
        return { label: 'Tạo mới nhà hàng', classes: 'text-blue-400 bg-blue-500/10 border-blue-500/20', icon: <PlusCircle size={12} /> };
      case 'approved':
        return { label: 'Phê duyệt hoạt động', classes: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', icon: <CheckCircle2 size={12} /> };
      case 'rejected':
        return { label: 'Từ chối phê duyệt', classes: 'text-rose-400 bg-rose-500/10 border-rose-500/20', icon: <XCircle size={12} /> };
      case 'suspended':
        return { label: 'Tạm ngưng hoạt động', classes: 'text-orange-400 bg-orange-500/10 border-orange-500/20', icon: <AlertTriangle size={12} /> };
      case 'unsuspended':
        return { label: 'Gỡ tạm ngưng', classes: 'text-green-400 bg-green-500/10 border-green-500/20', icon: <Play size={12} /> };
      case 'deleted':
        return { label: 'Xóa nhà hàng (Soft Delete)', classes: 'text-red-400 bg-red-500/10 border-red-500/20', icon: <Trash2 size={12} /> };
      case 'restored':
        return { label: 'Khôi phục nhà hàng', classes: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20', icon: <RefreshCcw size={12} /> };
      case 'updated':
        return { label: 'Cập nhật thông tin', classes: 'text-purple-400 bg-purple-500/10 border-purple-500/20', icon: <Edit size={12} /> };
      case 'featured':
        return { label: 'Thiết lập nổi bật', classes: 'text-amber-400 bg-amber-500/10 border-amber-500/20', icon: <CheckCircle2 size={12} /> };
      case 'unfeatured':
        return { label: 'Hủy nổi bật', classes: 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20', icon: <XCircle size={12} /> };
      default:
        return { label: action, classes: 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20', icon: <Edit size={12} /> };
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
      <div className="text-center py-12 text-zinc-400 bg-[#1A1D24] border border-zinc-800 rounded-xl">
        <p className="text-sm">Chưa có lịch sử hoạt động nào được ghi nhận cho nhà hàng này.</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <div className="relative border-l border-zinc-850 ml-3 pl-6 space-y-6">
        {logs.map((log, index) => {
          const details = getActionDetails(log.action);
          const actor = log.performedBy?.fullName || 'Hệ thống';
          const actorRole = log.performedByRole === 'admin' ? 'Admin' : 'Chủ nhà hàng';

          return (
            <div key={log._id || index} className="relative">
              {/* Timeline marker */}
              <div className={`absolute -left-[31px] top-1 w-6 h-6 rounded-full flex items-center justify-center border ${details.classes}`}>
                {details.icon}
              </div>
              
              <div className="bg-[#1A1D24] border border-zinc-800 p-4 rounded-xl shadow-md">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <span className="font-semibold text-sm text-zinc-200">{details.label}</span>
                  <span className="text-xs text-zinc-400 font-mono">{formatDate(log.createdAt)}</span>
                </div>
                
                <div className="text-sm text-zinc-300 space-y-2">
                  <p className="text-xs text-zinc-400">
                    Thực hiện bởi: <strong className="text-zinc-200">{actor}</strong> ({actorRole})
                  </p>
                  
                  {log.reason && (
                    <div className="mt-2 p-2.5 bg-zinc-900/50 border border-zinc-800/80 rounded-lg text-xs text-zinc-300 italic">
                      <strong className="text-zinc-400 not-italic block mb-0.5">Lý do:</strong>
                      {log.reason}
                    </div>
                  )}
                  
                  {log.metadata && log.metadata.changes && (
                    <div className="mt-2 text-xs text-zinc-400">
                      <strong className="text-zinc-300 block mb-1">Thay đổi:</strong>
                      <ul className="list-disc pl-4 space-y-1">
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
                            <li key={key} className="text-zinc-300">
                              {fieldLabel}: <span className="text-rose-400 line-through">{formatVal(change.old)}</span> &rarr; <span className="text-emerald-400 font-medium">{formatVal(change.new)}</span>
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
        <div className="pt-4 text-center">
          <button 
            className="px-5 py-2 text-xs font-semibold tracking-wide uppercase text-amber-500 border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 rounded-lg transition duration-200 disabled:opacity-50" 
            onClick={onLoadMore} 
            disabled={loading}
          >
            {loading ? 'Đang tải...' : 'Xem thêm lịch sử'}
          </button>
        </div>
      )}
    </div>
  );
}

