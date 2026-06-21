/**
 * Section — Public page section heading
 * Dùng Playfair Display cho title, text phụ #A5ADBA, action slot bên phải.
 * @param {string} title — Section title
 * @param {string} subtitle — Optional subtitle
 * @param {React.ReactNode} action — Optional action button(s) on the right
 * @param {React.ReactNode} children — Section content
 */
export function Section({ title, subtitle, action, children }) {
  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 style={{ fontFamily: "'Playfair Display', serif" }}>{title}</h2>
          {subtitle && <p className="text-sm text-[#A5ADBA] mt-1">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

/**
 * PhaseLabel — Brand eyebrow label
 * Amber text với bg amber/10, border amber/30, rounded-full.
 * @param {React.ReactNode} children — Label text
 */
export function PhaseLabel({ children }) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D49653]/10 border border-[#D49653]/30 text-[#D49653] text-xs uppercase tracking-[0.18em]">
      {children}
    </div>
  );
}
