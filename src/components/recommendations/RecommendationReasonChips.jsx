export default function RecommendationReasonChips({ reasons = [] }) {
  if (!Array.isArray(reasons) || reasons.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {reasons.slice(0, 3).map((reason) => (
        <span
          key={reason}
          className="inline-flex items-center rounded-full border border-primary/15 bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary"
        >
          {reason}
        </span>
      ))}
    </div>
  );
}
