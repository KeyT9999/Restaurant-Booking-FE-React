import { cn } from '../ui/utils';
import { Card } from '../ui/card';

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
    <Card className="p-5 bg-card border-border flex flex-col gap-4 text-left" aria-label="Lịch sử trạng thái đặt bàn">
      <h5 className="font-bold text-white text-sm pb-3 border-b border-border/60" style={{ fontFamily: "'Playfair Display', serif" }}>
        📊 Lịch sử trạng thái đơn
      </h5>
      <div className="flex flex-col relative pl-6 border-l border-border/60 ml-2 mt-2 gap-6" role="list">
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
              className="relative flex flex-col gap-1.5 text-xs text-muted-foreground"
              role="listitem"
              aria-label={`${statusLabels[historyItem.status] || historyItem.status} - ${dateStr}`}
            >
              {/* timeline dot indicator */}
              <span className={cn(
                "absolute -left-[30px] top-1 h-3.5 w-3.5 rounded-full border bg-card flex items-center justify-center",
                isLast ? "border-primary" : "border-border"
              )}>
                <span className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  historyItem.status === 'confirmed' ? 'bg-emerald-400' :
                  historyItem.status === 'pending' ? 'bg-amber-400' :
                  historyItem.status === 'cancelled' ? 'bg-rose-400' :
                  historyItem.status === 'completed' ? 'bg-zinc-400' : 'bg-primary'
                )} />
              </span>

              <div className="flex justify-between items-center gap-2">
                <span className={cn(
                  "font-bold text-white",
                  isLast && "text-primary"
                )}>
                  {statusLabels[historyItem.status] || historyItem.status}
                </span>
                <span className="text-[10px] text-muted-foreground">{dateStr}</span>
              </div>
              {historyItem.note && (
                <p className="text-xs text-muted-foreground/85 italic bg-secondary/20 p-2 border border-border/40 rounded mt-0.5 leading-relaxed">
                  {historyItem.note}
                </p>
              )}
              {historyItem.changedBy && historyItem.changedBy.fullName && (
                <span className="text-[10px] text-muted-foreground/60">
                  Thực hiện bởi: <strong className="text-muted-foreground">{historyItem.changedBy.fullName}</strong>
                </span>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
