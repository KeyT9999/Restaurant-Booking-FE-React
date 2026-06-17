import { Landmark, Sparkles, Users } from 'lucide-react';
import { cn } from '../ui/utils';

const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '0đ';
  return `${new Intl.NumberFormat('vi-VN').format(amount)}đ`;
};

export default function BookingTableCard({
  table,
  isSelected,
  isSuggested,
  onSelect,
}) {
  const { tableNumber, capacity, zone, depositAmount, note } = table;

  return (
    <button
      type="button"
      onClick={() => onSelect?.(table)}
      aria-pressed={isSelected}
      aria-label={`Chọn bàn ${tableNumber}, sức chứa ${capacity} chỗ${zone ? `, khu vực ${zone}` : ''}`}
      className={cn(
        'relative w-full rounded-xl border bg-card/70 p-4 text-left transition-all hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/40',
        isSelected
          ? 'border-primary bg-primary/10 ring-1 ring-primary'
          : isSuggested
            ? 'border-amber-500/35 bg-amber-500/10'
            : 'border-border'
      )}
    >
      {isSuggested && (
        <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-md border border-amber-500/25 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-400">
          <Sparkles size={11} /> Gợi ý
        </span>
      )}

      <div className="flex items-center gap-2 pr-20">
        <h4 className="text-lg font-bold text-white">Bàn {tableNumber}</h4>
        {zone && (
          <span className="rounded bg-secondary px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
            {zone}
          </span>
        )}
      </div>

      <div className="mt-4 flex flex-col gap-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Users size={14} className="text-primary/80" />
          <span>
            Sức chứa: <strong className="font-semibold text-white">{capacity}</strong> chỗ
          </span>
        </div>

        {depositAmount > 0 && (
          <div className="flex items-center gap-2 text-primary">
            <Landmark size={14} />
            <span>
              Tiền cọc: <strong className="font-bold">{formatCurrency(depositAmount)}</strong>
            </span>
          </div>
        )}
      </div>

      {note && (
        <p className="mt-3 line-clamp-2 border-t border-border/50 pt-3 text-xs leading-relaxed text-muted-foreground">
          {note}
        </p>
      )}

      <div
        className={cn(
          'mt-4 rounded-md py-2 text-center text-xs font-bold uppercase tracking-wide transition-colors',
          isSelected
            ? 'bg-primary text-background'
            : 'bg-secondary text-muted-foreground group-hover:text-white'
        )}
      >
        {isSelected ? 'Đã chọn' : 'Chọn bàn này'}
      </div>
    </button>
  );
}
