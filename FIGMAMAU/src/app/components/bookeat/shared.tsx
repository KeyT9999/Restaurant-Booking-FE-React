import { ReactNode } from "react";
import { Badge } from "../ui/badge";
import { Card } from "../ui/card";
import { cn } from "../ui/utils";
import { TrendingUp, TrendingDown, LucideIcon } from "lucide-react";

export const RESTAURANTS = [
  { id: "1", name: "Maison Lumière", cuisine: "French · Fine Dining", price: "$$$$", rating: 4.9, reviews: 1284, city: "Paris 8e", img: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=900&q=80", featured: true, chef: "Chef Antoine Reverdy" },
  { id: "2", name: "Kaiseki Hinoki", cuisine: "Japanese · Omakase", price: "$$$$", rating: 4.8, reviews: 832, city: "Ginza, Tokyo", img: "https://images.unsplash.com/photo-1579027989536-b7b1f875659b?w=900&q=80", featured: true, chef: "Chef Haruto Ishii" },
  { id: "3", name: "Olive & Ember", cuisine: "Mediterranean", price: "$$$", rating: 4.7, reviews: 642, city: "Soho, London", img: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=900&q=80", chef: "Chef Lina Costa" },
  { id: "4", name: "Cinta Roja", cuisine: "Spanish · Tapas", price: "$$", rating: 4.6, reviews: 1542, city: "Barcelona", img: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=900&q=80", chef: "Chef Marco Vidal" },
  { id: "5", name: "Noor", cuisine: "Modern Levantine", price: "$$$", rating: 4.8, reviews: 921, city: "Dubai Marina", img: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=900&q=80", chef: "Chef Yasmin Khoury" },
  { id: "6", name: "Aurora Steakhouse", cuisine: "Steakhouse", price: "$$$$", rating: 4.7, reviews: 2103, city: "Midtown, NYC", img: "https://images.unsplash.com/photo-1544025162-d76694265947?w=900&q=80", chef: "Chef Daniel Brooks" },
];

export function StatusBadge({ status }: { status: "Confirmed" | "Pending" | "Cancelled" | "Seated" | "Completed" | "No-show" | "Approved" | "Rejected" | "Paid" | "Refunded" }) {
  const map: Record<string, string> = {
    Confirmed: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    Pending: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    Cancelled: "bg-rose-500/15 text-rose-400 border-rose-500/30",
    Seated: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    Completed: "bg-zinc-500/15 text-zinc-300 border-zinc-500/30",
    "No-show": "bg-rose-500/15 text-rose-400 border-rose-500/30",
    Approved: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    Rejected: "bg-rose-500/15 text-rose-400 border-rose-500/30",
    Paid: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    Refunded: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  };
  return <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs", map[status])}>
    <span className="w-1.5 h-1.5 rounded-full bg-current" />{status}
  </span>;
}

export function StatCard({ label, value, delta, icon: Icon, accent }: { label: string; value: string; delta?: number; icon: LucideIcon; accent?: string }) {
  const up = (delta ?? 0) >= 0;
  return (
    <Card className="p-5 bg-[#1A1D24] border-[#2C313C]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-[#A5ADBA]">{label}</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums">{value}</p>
        </div>
        <div className={cn("w-10 h-10 rounded-xl grid place-items-center", accent || "bg-[#D49653]/15 text-[#D49653]")}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      {delta !== undefined && (
        <div className="mt-3 flex items-center gap-1.5 text-xs">
          {up ? <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> : <TrendingDown className="w-3.5 h-3.5 text-rose-400" />}
          <span className={up ? "text-emerald-400" : "text-rose-400"}>{up ? "+" : ""}{delta}%</span>
          <span className="text-[#A5ADBA]">vs last week</span>
        </div>
      )}
    </Card>
  );
}

export function Section({ title, subtitle, action, children }: { title: string; subtitle?: string; action?: ReactNode; children: ReactNode }) {
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

export function PhaseLabel({ children }: { children: ReactNode }) {
  return <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D49653]/10 border border-[#D49653]/30 text-[#D49653] text-xs uppercase tracking-[0.18em]">{children}</div>;
}
