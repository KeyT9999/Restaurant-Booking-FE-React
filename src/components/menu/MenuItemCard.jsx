import { Edit, Trash2, ToggleLeft, ToggleRight, Clock, Tag } from 'lucide-react';

const formatCurrency = (price) => {
  if (!price && price !== 0) return '0₫';
  return new Intl.NumberFormat('vi-VN').format(price) + '₫';
};

export default function MenuItemCard({ item, onEdit, onDelete, onToggle }) {
  return (
    <div className={`bg-card border border-border rounded-xl overflow-hidden flex flex-col hover:border-primary/40 transition-all duration-300 hover:shadow-xl h-full ${!item.isAvailable ? 'opacity-70' : ''}`}>
      {/* Image container */}
      <div className="relative aspect-video w-full bg-[#0F1115]/50 overflow-hidden flex items-center justify-center border-b border-border/40">
        {item.image ? (
          <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
        ) : (
          <div className="text-3xl text-muted-foreground/40 font-serif">🍽️</div>
        )}
        <span className={`absolute top-2.5 right-2.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
          item.isAvailable 
            ? 'bg-emerald-500/15 text-emerald-450 border-emerald-500/30' 
            : 'bg-zinc-500/15 text-zinc-350 border-zinc-500/30'
        }`}>
          {item.isAvailable ? 'Còn món' : 'Hết món'}
        </span>
      </div>

      {/* Content body */}
      <div className="p-4 flex flex-col flex-1 gap-2 text-left">
        <h3 className="font-serif text-base font-bold text-white leading-tight">{item.name}</h3>

        {item.categoryName && (
          <span className="inline-flex text-[10px] font-semibold text-primary bg-primary/5 px-2 py-0.5 rounded-full border border-primary/15 self-start">
            {item.categoryName}
          </span>
        )}

        {item.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mt-1">
            {item.description}
          </p>
        )}

        <div className="mt-auto pt-3 flex items-center justify-between">
          <span className="font-serif text-sm font-bold text-white">{formatCurrency(item.price)}</span>
          {item.preparationTime && (
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Clock size={12} className="text-muted-foreground/70" /> {item.preparationTime} phút
            </span>
          )}
        </div>

        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {item.tags.map((tag, i) => (
              <span key={i} className="inline-flex items-center gap-1 bg-secondary/35 text-muted-foreground text-[10px] px-1.5 py-0.5 rounded border border-border/60">
                <Tag size={10} className="text-muted-foreground/60" /> {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="px-4 pb-4 pt-2 border-t border-border/30 flex justify-end items-center gap-1.5">
        <button
          className={`w-8 h-8 rounded-lg border border-border flex items-center justify-center transition bg-transparent hover:bg-secondary/40 cursor-pointer ${
            item.isAvailable ? 'text-primary hover:text-primary/80' : 'text-muted-foreground hover:text-white'
          }`}
          onClick={() => onToggle(item)}
          title={item.isAvailable ? 'Tắt món' : 'Bật món'}
        >
          {item.isAvailable ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
        </button>
        <button 
          className="w-8 h-8 rounded-lg border border-border text-muted-foreground hover:text-primary hover:border-primary/50 flex items-center justify-center transition bg-transparent hover:bg-secondary/40 cursor-pointer" 
          onClick={() => onEdit(item)} 
          title="Chỉnh sửa"
        >
          <Edit size={14} />
        </button>
        <button 
          className="w-8 h-8 rounded-lg border border-border text-muted-foreground hover:text-destructive hover:border-destructive/50 flex items-center justify-center transition bg-transparent hover:bg-secondary/40 cursor-pointer" 
          onClick={() => onDelete(item)} 
          title="Xóa"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
