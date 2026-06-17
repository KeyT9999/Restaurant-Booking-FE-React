import { Edit, Trash2, Users, MapPin, DollarSign, FileText } from 'lucide-react';

const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '0₫';
  return new Intl.NumberFormat('vi-VN').format(amount) + '₫';
};

export default function TableCard({ table, onEdit, onDelete, onStatusChange, statusOptions }) {
  const currentStatusOption = statusOptions.find(opt => opt.value === table.status) || {
    label: table.status,
    color: '#94a3b8'
  };

  // Border hover mapping based on status
  const statusHoverClasses = {
    available: 'hover:border-emerald-500/40',
    occupied: 'hover:border-rose-500/40',
    reserved: 'hover:border-amber-500/40',
    inactive: 'hover:border-zinc-500/40',
    maintenance: 'hover:border-indigo-500/40',
  };
  const hoverClass = statusHoverClasses[table.status] || 'hover:border-primary/40';

  return (
    <div className={`bg-card border border-border rounded-xl p-5 flex flex-col gap-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl h-full ${hoverClass}`}>
      <div className="flex justify-between items-center">
        <h3 className="font-serif text-lg font-bold text-white">Bàn {table.tableNumber}</h3>
        <span 
          className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border"
          style={{ backgroundColor: `${currentStatusOption.color}15`, borderColor: `${currentStatusOption.color}30`, color: currentStatusOption.color }}
        >
          {currentStatusOption.label}
        </span>
      </div>

      <div className="flex flex-col gap-2.5 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Users size={14} className="text-muted-foreground/70" />
          <span>Sức chứa: <strong className="text-white font-medium">{table.capacity}</strong> người</span>
        </div>

        {table.zone && (
          <div className="flex items-center gap-2">
            <MapPin size={14} className="text-muted-foreground/70" />
            <span>Khu vực: <strong className="text-white font-medium">{table.zone}</strong></span>
          </div>
        )}

        {table.depositAmount > 0 && (
          <div className="flex items-center gap-2 text-primary">
            <DollarSign size={14} className="shrink-0" />
            <span>Đặt cọc: <strong className="font-semibold">{formatCurrency(table.depositAmount)}</strong></span>
          </div>
        )}

        {table.note && (
          <div className="mt-1 p-2 bg-[#0F1115]/50 border-l-2 border-primary/30 rounded text-xs italic text-muted-foreground flex items-start gap-1.5 leading-normal">
            <FileText size={12} className="shrink-0 mt-0.5 text-muted-foreground/75" />
            <span>{table.note}</span>
          </div>
        )}
      </div>

      <div className="mt-auto pt-3 border-t border-border/40 flex justify-between items-center gap-2">
        <div className="flex-1">
          <select
            value={table.status}
            onChange={(e) => onStatusChange(table, e.target.value)}
            className="w-full bg-[#0F1115] border text-white text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all cursor-pointer"
            style={{ borderColor: `${currentStatusOption.color}60` }}
            aria-label="Thay đổi trạng thái bàn"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            className="w-8 h-8 rounded-lg border border-border text-muted-foreground hover:text-primary hover:border-primary/50 flex items-center justify-center transition-all bg-transparent hover:bg-secondary/20 cursor-pointer"
            onClick={() => onEdit(table)}
            title="Chỉnh sửa"
          >
            <Edit size={14} />
          </button>
          <button
            className="w-8 h-8 rounded-lg border border-border text-muted-foreground hover:text-destructive hover:border-destructive/50 flex items-center justify-center transition-all bg-transparent hover:bg-secondary/20 cursor-pointer"
            onClick={() => onDelete(table)}
            title="Xóa"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
