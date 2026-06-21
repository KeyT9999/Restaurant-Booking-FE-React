import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from '../ui/card';
import { cn } from '../ui/utils';

/**
 * StatCard — Dashboard statistics card
 * Hiển thị label, value, delta percentage, và icon.
 * @param {string} label — Label text (uppercase)
 * @param {string} value — Main value display
 * @param {number} delta — Percentage change (positive = up, negative = down)
 * @param {React.ComponentType} icon — Lucide icon component
 * @param {string} accent — Override accent color class (default: amber)
 */
export function StatCard({ label, value, delta, icon: Icon, accent }) {
  const up = (delta ?? 0) >= 0;
  return (
    <Card className="p-5 bg-[#1A1D24] border-[#2C313C]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-[#A5ADBA]">{label}</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums">{value}</p>
        </div>
        {Icon && (
          <div className={cn('w-10 h-10 rounded-xl grid place-items-center', accent || 'bg-[#D49653]/15 text-[#D49653]')}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      {delta !== undefined && (
        <div className="mt-3 flex items-center gap-1.5 text-xs">
          {up ? <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> : <TrendingDown className="w-3.5 h-3.5 text-rose-400" />}
          <span className={up ? 'text-emerald-400' : 'text-rose-400'}>{up ? '+' : ''}{delta}%</span>
          <span className="text-[#A5ADBA]">vs last week</span>
        </div>
      )}
    </Card>
  );
}
