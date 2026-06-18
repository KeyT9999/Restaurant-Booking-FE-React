import { FileText, Info } from 'lucide-react';

export default function AIPolicyAnswer({ payload }) {
  if (!payload) return null;
  const bullets = payload.bullets || [];

  return (
    <article className="rounded-lg border border-border bg-card p-3 text-left shadow-sm">
      <div className="flex items-start gap-2">
        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
          <FileText size={15} aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-semibold text-foreground">
            {payload.restaurant?.name ? `Chính sách của ${payload.restaurant.name}` : 'Chính sách BookEat'}
          </h4>
          {payload.answer && (
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{payload.answer}</p>
          )}
        </div>
      </div>

      {bullets.length > 0 && (
        <ul className="mt-3 space-y-1.5 text-xs leading-relaxed text-muted-foreground">
          {bullets.map((item) => (
            <li key={item} className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-3 flex items-center gap-1.5 border-t border-border pt-2 text-[11px] text-muted-foreground">
        <Info size={12} aria-hidden="true" />
        Nguồn: {payload.sourceLabel || 'Nguồn public BookEat'}
      </p>
    </article>
  );
}
