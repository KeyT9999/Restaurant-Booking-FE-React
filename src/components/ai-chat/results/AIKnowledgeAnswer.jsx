import { BookOpenText, Info, ShieldCheck } from 'lucide-react';

const formatDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const getCategoryLabel = (category) => ({
  policy: 'Chính sách',
  faq: 'FAQ',
  guide: 'Hướng dẫn',
  support: 'Hỗ trợ',
  terms: 'Điều khoản',
}[category] || 'Knowledge');

export default function AIKnowledgeAnswer({ payload }) {
  if (!payload) return null;

  const sources = Array.isArray(payload.matchedSources) ? payload.matchedSources : [];
  const updatedAt = formatDate(payload.updatedAt);

  return (
    <article className="max-w-full overflow-hidden rounded-lg border border-border bg-card p-3 text-left shadow-sm">
      <div className="flex items-start gap-2">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
          <BookOpenText size={16} aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <h4 className="min-w-0 break-words text-sm font-semibold text-foreground">
              {payload.title || 'Không tìm thấy tài liệu phù hợp'}
            </h4>
            {payload.category && (
              <span className="shrink-0 rounded-md border border-border bg-secondary/60 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                {getCategoryLabel(payload.category)}
              </span>
            )}
          </div>
          {updatedAt && (
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              Cập nhật {updatedAt}
            </p>
          )}
        </div>
      </div>

      {payload.answer && (
        <p className="mt-3 whitespace-pre-wrap break-words rounded-md border border-border bg-secondary/40 p-2.5 text-xs leading-relaxed text-muted-foreground">
          {payload.answer}
        </p>
      )}

      {sources.length > 0 && (
        <div className="mt-3 rounded-md border border-border bg-secondary/30 p-2.5">
          <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold text-foreground">
            <ShieldCheck size={13} className="shrink-0 text-primary" aria-hidden="true" />
            Nguồn nội bộ
          </div>
          <ul className="space-y-1.5 text-[11px] leading-relaxed text-muted-foreground">
            {sources.map((source) => (
              <li key={`${source.title}-${source.version}`} className="min-w-0 break-words">
                <span className="font-medium text-foreground">{source.title}</span>
                {source.version ? <span> · v{source.version}</span> : null}
                {source.sourceLabel ? <span> · {source.sourceLabel}</span> : null}
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="mt-3 flex items-start gap-1.5 border-t border-border pt-2 text-[11px] leading-relaxed text-muted-foreground">
        <Info size={12} className="mt-0.5 shrink-0" aria-hidden="true" />
        <span className="min-w-0 break-words">
          {payload.disclaimer || 'Thông tin được lấy từ knowledge base đã published của BookEat.'}
        </span>
      </p>
    </article>
  );
}
