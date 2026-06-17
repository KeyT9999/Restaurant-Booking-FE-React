import { useState, ReactNode } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import { Separator } from "../ui/separator";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { StatusBadge, StatCard, RESTAURANTS } from "./shared";
import { LayoutGrid, CalendarDays, Utensils, Users, Wallet, Star, MessageSquare, Bell, Settings, Search, Plus, ChefHat, ChevronRight, Receipt, Building2, Ticket, LogOut, Filter, MoreHorizontal, TrendingUp, Eye, DollarSign, ClipboardList, MapPin } from "lucide-react";
import { cn } from "../ui/utils";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend } from "recharts";
import { useLang } from "./i18n";

function useNav() {
  const { t } = useLang();
  return [
    { k: "dash", l: t("Dashboard", "Tổng quan"), i: LayoutGrid },
    { k: "bookings", l: t("Bookings", "Đặt bàn"), i: CalendarDays },
    { k: "restaurant", l: t("Restaurant", "Nhà hàng"), i: Building2 },
    { k: "menu", l: t("Menu", "Thực đơn"), i: Utensils },
    { k: "tables", l: t("Tables & Floor", "Bàn & Sơ đồ"), i: ClipboardList },
    { k: "vouchers", l: t("Vouchers", "Mã ưu đãi"), i: Ticket },
    { k: "reviews", l: t("Reviews", "Đánh giá"), i: Star },
    { k: "wallet", l: t("Withdrawals", "Rút tiền"), i: Wallet },
    { k: "chat", l: t("Messages", "Tin nhắn"), i: MessageSquare },
    { k: "settings", l: t("Settings", "Cài đặt"), i: Settings },
  ];
}

function Sidebar({ active, setActive }: { active: string; setActive: (k: string) => void }) {
  const { t } = useLang();
  const NAV = useNav();
  return (
    <aside className="w-64 shrink-0 bg-[#14171D] border-r border-[#2C313C] flex flex-col">
      <div className="p-5 border-b border-[#2C313C] flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#D49653] to-[#A06B33] grid place-items-center"><ChefHat className="w-5 h-5 text-[#0F1115]" /></div>
        <div><p className="text-sm" style={{ fontFamily: "'Playfair Display', serif" }}>Maison Lumière</p><p className="text-[10px] text-[#A5ADBA]">{t("Owner workspace", "Không gian chủ NH")}</p></div>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {NAV.map(n => {
          const Icon = n.i;
          return (
            <button key={n.k} onClick={() => setActive(n.k)} className={cn("w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition", active === n.k ? "bg-[#D49653]/15 text-[#D49653]" : "text-[#A5ADBA] hover:text-white hover:bg-[#20242D]")}>
              <Icon className="w-4 h-4" />{n.l}
            </button>
          );
        })}
      </nav>
      <div className="p-3 border-t border-[#2C313C]">
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#A5ADBA] hover:text-white hover:bg-[#20242D]"><LogOut className="w-4 h-4" />{t("Sign out", "Đăng xuất")}</button>
      </div>
    </aside>
  );
}

function TopBar({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="px-8 py-6 border-b border-[#2C313C] flex items-center justify-between">
      <div>
        <h1 style={{ fontFamily: "'Playfair Display', serif" }}>{title}</h1>
        {subtitle && <p className="text-sm text-[#A5ADBA] mt-1">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        <div className="relative w-72"><Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#A5ADBA]" /><Input className="pl-9 bg-[#20242D] border-[#2C313C]" placeholder="Search bookings, guests…" /></div>
        <Button variant="ghost" size="icon" className="relative"><Bell className="w-4 h-4" /><span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#D49653]" /></Button>
        <Avatar className="w-9 h-9"><AvatarFallback>AR</AvatarFallback></Avatar>
        {action}
      </div>
    </div>
  );
}

function RevenueSpark({ data }: { data: { d: string; revenue: number }[] }) {
  const W = 600, H = 260, P = 24;
  const max = Math.max(...data.map(d => d.revenue));
  const min = Math.min(...data.map(d => d.revenue));
  const x = (i: number) => P + (i * (W - P * 2)) / (data.length - 1);
  const y = (v: number) => H - P - ((v - min) / (max - min || 1)) * (H - P * 2);
  const line = data.map((d, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y(d.revenue)}`).join(" ");
  const area = `${line} L ${x(data.length - 1)} ${H - P} L ${x(0)} ${H - P} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full">
      {[0.25, 0.5, 0.75, 1].map(p => <line key={`g-${p}`} x1={P} x2={W - P} y1={P + (H - P * 2) * p} y2={P + (H - P * 2) * p} stroke="#2C313C" strokeWidth={1} />)}
      <path d={area} fill="#D49653" fillOpacity={0.16} />
      <path d={line} fill="none" stroke="#D49653" strokeWidth={2.5} strokeLinejoin="round" />
      {data.map((d, i) => <circle key={`p-${i}`} cx={x(i)} cy={y(d.revenue)} r={2.5} fill="#D49653" />)}
      {data.filter((_, i) => i % 2 === 0).map((d, i) => <text key={`t-${d.d}`} x={x(i * 2)} y={H - 6} fill="#A5ADBA" fontSize={10} textAnchor="middle">{d.d}</text>)}
    </svg>
  );
}

function HoursBars({ data }: { data: { h: string; v: number }[] }) {
  const max = Math.max(...data.map(d => d.v));
  return (
    <div className="w-full h-full flex items-end gap-3 px-1">
      {data.map(d => (
        <div key={`h-${d.h}`} className="flex-1 flex flex-col items-center gap-2">
          <div className="w-full bg-[#D49653] rounded-t-md transition-all" style={{ height: `${(d.v / max) * 80}%` }} />
          <span className="text-[10px] text-[#A5ADBA]">{d.h}</span>
        </div>
      ))}
    </div>
  );
}

const REVENUE = Array.from({ length: 14 }).map((_, i) => ({ d: `Jun ${i + 1}`, revenue: 1200 + Math.round(Math.sin(i) * 400) + i * 60, bookings: 18 + Math.round(Math.cos(i) * 6) + Math.floor(i / 2) }));
const HOURS = [{ h: "5p", v: 4 }, { h: "6p", v: 12 }, { h: "7p", v: 28 }, { h: "8p", v: 34 }, { h: "9p", v: 22 }, { h: "10p", v: 9 }];
const SOURCE = [{ name: "Direct", value: 42 }, { name: "BookEat", value: 38 }, { name: "Google", value: 14 }, { name: "Other", value: 6 }];
const COLORS = ["#D49653", "#3B82F6", "#22C55E", "#A78BFA"];

function Dashboard() {
  const { t } = useLang();
  return (
    <div className="p-8 space-y-8">
      <div className="grid grid-cols-4 gap-5">
        <StatCard label={t("Today's covers", "Lượt khách hôm nay")} value="148" delta={12} icon={Users} />
        <StatCard label={t("Revenue (week)", "Doanh thu (tuần)")} value="€42,318" delta={8} icon={DollarSign} accent="bg-emerald-500/15 text-emerald-400" />
        <StatCard label={t("Occupancy", "Tỷ lệ lấp đầy")} value="86%" delta={-3} icon={TrendingUp} accent="bg-blue-500/15 text-blue-400" />
        <StatCard label={t("Avg. rating", "Đánh giá TB")} value="4.9" delta={1} icon={Star} accent="bg-amber-500/15 text-amber-400" />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <Card className="col-span-2 p-6 bg-[#1A1D24] border-[#2C313C]">
          <div className="flex items-center justify-between mb-4">
            <div><h3>Revenue & bookings</h3><p className="text-xs text-[#A5ADBA] mt-1">Last 14 days</p></div>
            <Tabs defaultValue="14d"><TabsList className="bg-[#20242D]"><TabsTrigger value="7d">7d</TabsTrigger><TabsTrigger value="14d">14d</TabsTrigger><TabsTrigger value="30d">30d</TabsTrigger></TabsList></Tabs>
          </div>
          <div className="h-72"><RevenueSpark data={REVENUE} /></div>
        </Card>

        <Card className="p-6 bg-[#1A1D24] border-[#2C313C]">
          <h3>Booking sources</h3>
          <div className="h-56 mt-2">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={SOURCE} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={3} isAnimationActive={false}>{SOURCE.map((s, i) => <Cell key={`src-${s.name}`} fill={COLORS[i]} />)}</Pie>
                <Tooltip contentStyle={{ background: "#1A1D24", border: "1px solid #2C313C" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2">{SOURCE.map((s, i) => <div key={s.name} className="flex items-center justify-between text-sm"><div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i] }} />{s.name}</div><span className="text-[#A5ADBA]">{s.value}%</span></div>)}</div>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <Card className="p-6 bg-[#1A1D24] border-[#2C313C]">
          <h3>Peak hours</h3>
          <div className="h-44 mt-3"><HoursBars data={HOURS} /></div>
        </Card>
        <Card className="col-span-2 p-6 bg-[#1A1D24] border-[#2C313C]">
          <div className="flex items-center justify-between"><h3>Today's reservations</h3><Button variant="ghost" className="text-[#D49653]">View all <ChevronRight className="w-4 h-4 ml-1" /></Button></div>
          <div className="mt-4 space-y-2">
            {[
              { t: "6:30 PM", n: "Marc Dubois", p: 2, n2: "Anniversary · Table 14", s: "Confirmed" as const },
              { t: "7:00 PM", n: "Aiko Tanaka", p: 4, n2: "Allergy: shellfish", s: "Seated" as const },
              { t: "7:30 PM", n: "Elena Costa", p: 2, n2: "Window seat", s: "Confirmed" as const },
              { t: "8:00 PM", n: "James O'Connor", p: 6, n2: "Business · Private room", s: "Pending" as const },
              { t: "8:30 PM", n: "Sofia Reyes", p: 2, n2: "Vegan tasting menu", s: "Confirmed" as const },
            ].map((b, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-lg hover:bg-[#20242D]">
                <div className="text-[#D49653] w-20 text-sm">{b.t}</div>
                <Avatar className="w-9 h-9"><AvatarFallback>{b.n[0]}</AvatarFallback></Avatar>
                <div className="flex-1"><p className="text-sm">{b.n}</p><p className="text-xs text-[#A5ADBA]">{b.n2}</p></div>
                <div className="text-sm text-[#A5ADBA]">{b.p} guests</div>
                <StatusBadge status={b.s} />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function Bookings() {
  const rows = [
    { id: "BK-29845", name: "Elena Costa", date: "Jun 5, 7:30 PM", party: 2, table: "T14", source: "Direct", deposit: "€60", s: "Confirmed" as const },
    { id: "BK-29844", name: "Marc Dubois", date: "Jun 5, 6:30 PM", party: 2, table: "T08", source: "BookEat", deposit: "€60", s: "Seated" as const },
    { id: "BK-29840", name: "Aiko Tanaka", date: "Jun 5, 7:00 PM", party: 4, table: "T22", source: "Google", deposit: "€120", s: "Confirmed" as const },
    { id: "BK-29838", name: "James O'Connor", date: "Jun 5, 8:00 PM", party: 6, table: "PR-2", source: "Direct", deposit: "€180", s: "Pending" as const },
    { id: "BK-29830", name: "Sofia Reyes", date: "Jun 5, 8:30 PM", party: 2, table: "T03", source: "BookEat", deposit: "€60", s: "Confirmed" as const },
    { id: "BK-29822", name: "Lina Bauer", date: "Jun 4, 9:00 PM", party: 3, table: "T11", source: "BookEat", deposit: "€90", s: "Completed" as const },
    { id: "BK-29812", name: "Hugo Martin", date: "Jun 4, 7:00 PM", party: 2, table: "T05", source: "Direct", deposit: "€60", s: "No-show" as const },
  ];
  return (
    <div className="p-8 space-y-6">
      <div className="flex gap-3">
        {["All", "Today", "Upcoming", "Past", "Cancelled"].map((t, i) => (
          <button key={t} className={cn("px-4 py-2 rounded-lg text-sm border", i === 0 ? "bg-[#D49653]/15 border-[#D49653]/40 text-[#D49653]" : "border-[#2C313C] text-[#A5ADBA] hover:text-white")}>{t}</button>
        ))}
        <div className="ml-auto flex gap-2"><Button variant="outline" className="border-[#2C313C]"><Filter className="w-4 h-4 mr-2" />Filters</Button><Button className="bg-[#D49653] hover:bg-[#E0A968] text-[#0F1115]"><Plus className="w-4 h-4 mr-2" />Add reservation</Button></div>
      </div>

      <Card className="bg-[#1A1D24] border-[#2C313C] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-[#2C313C] hover:bg-transparent">
              <TableHead>Booking</TableHead><TableHead>Guest</TableHead><TableHead>Date & time</TableHead><TableHead>Party</TableHead><TableHead>Table</TableHead><TableHead>Source</TableHead><TableHead>Deposit</TableHead><TableHead>Status</TableHead><TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map(r => (
              <TableRow key={r.id} className="border-[#2C313C]">
                <TableCell className="text-[#D49653]">#{r.id}</TableCell>
                <TableCell><div className="flex items-center gap-2"><Avatar className="w-7 h-7"><AvatarFallback>{r.name[0]}</AvatarFallback></Avatar>{r.name}</div></TableCell>
                <TableCell className="text-[#A5ADBA]">{r.date}</TableCell>
                <TableCell>{r.party}</TableCell>
                <TableCell>{r.table}</TableCell>
                <TableCell className="text-[#A5ADBA]">{r.source}</TableCell>
                <TableCell>{r.deposit}</TableCell>
                <TableCell><StatusBadge status={r.s} /></TableCell>
                <TableCell><Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

function MenuMgmt() {
  const dishes = [
    { n: "Heritage tomato tartare", c: "Entrées", p: "€24", st: "Active" },
    { n: "Hokkaido scallop carpaccio", c: "Entrées", p: "€38", st: "Active" },
    { n: "Wagyu A5 — 90 days", c: "Plats", p: "€96", st: "Active" },
    { n: "Bresse pigeon", c: "Plats", p: "€72", st: "Active" },
    { n: "Soufflé Grand Marnier", c: "Desserts", p: "€18", st: "Draft" },
  ];
  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between">
        <Tabs defaultValue="all"><TabsList className="bg-[#1A1D24] border border-[#2C313C]"><TabsTrigger value="all">All (42)</TabsTrigger><TabsTrigger value="ent">Entrées</TabsTrigger><TabsTrigger value="plat">Plats</TabsTrigger><TabsTrigger value="dess">Desserts</TabsTrigger><TabsTrigger value="boi">Wines</TabsTrigger></TabsList></Tabs>
        <Button className="bg-[#D49653] hover:bg-[#E0A968] text-[#0F1115]"><Plus className="w-4 h-4 mr-2" />Add dish</Button>
      </div>
      <div className="grid grid-cols-3 gap-5">
        {dishes.map(d => (
          <Card key={d.n} className="bg-[#1A1D24] border-[#2C313C] overflow-hidden">
            <div className="aspect-[4/3]"><ImageWithFallback src="https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600" alt="" className="w-full h-full object-cover" /></div>
            <div className="p-4">
              <div className="flex justify-between"><p>{d.n}</p><span className="text-[#D49653]">{d.p}</span></div>
              <p className="text-xs text-[#A5ADBA] mt-1">{d.c}</p>
              <div className="flex justify-between items-center mt-3">
                <Badge className={cn(d.st === "Active" ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : "bg-amber-500/15 text-amber-400 border-amber-500/30", "border")}>{d.st}</Badge>
                <Button variant="ghost" size="sm">Edit</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function TablesMgmt() {
  return (
    <div className="p-8 grid grid-cols-3 gap-6">
      <Card className="col-span-2 p-6 bg-[#1A1D24] border-[#2C313C]">
        <div className="flex justify-between mb-4"><h3>Floor plan · Main hall</h3><Button variant="outline" className="border-[#2C313C]"><Plus className="w-4 h-4 mr-2" />Add table</Button></div>
        <div className="aspect-[16/9] rounded-xl bg-[#0F1115] border border-[#2C313C] p-6 relative">
          <p className="absolute top-3 left-4 text-xs text-[#A5ADBA]">Drag tables to rearrange</p>
          <div className="grid grid-cols-6 grid-rows-3 gap-3 h-full pt-4">
            {Array.from({ length: 18 }).map((_, i) => {
              const occ = [2, 5, 9, 13].includes(i);
              const res = [0, 7, 11].includes(i);
              return <div key={i} className={cn("rounded-lg border grid place-items-center text-xs cursor-move", occ ? "bg-blue-500/20 border-blue-500/40 text-blue-300" : res ? "bg-[#D49653]/20 border-[#D49653]/40 text-[#D49653]" : "bg-[#20242D] border-[#2C313C] text-[#A5ADBA]")}>T{i + 1}</div>;
            })}
          </div>
        </div>
      </Card>
      <Card className="p-6 bg-[#1A1D24] border-[#2C313C] space-y-4">
        <h3>Table details · T07</h3>
        <div className="space-y-3 text-sm">
          <Row l="Capacity" v="4 guests" />
          <Row l="Section" v="Main hall" />
          <Row l="Min spend" v="€80" />
          <Row l="Status" v={<Badge className="bg-blue-500/15 text-blue-400 border-blue-500/30 border">Occupied</Badge>} />
          <Row l="Current guest" v="Marc Dubois" />
          <Row l="Seated at" v="6:32 PM" />
        </div>
        <Separator className="bg-[#2C313C]" />
        <div className="space-y-2">
          <Button className="w-full bg-[#D49653] hover:bg-[#E0A968] text-[#0F1115]">Mark as available</Button>
          <Button variant="outline" className="w-full border-[#2C313C]">Edit table</Button>
        </div>
      </Card>
    </div>
  );
}
function Row({ l, v }: { l: string; v: ReactNode }) { return <div className="flex justify-between"><span className="text-[#A5ADBA]">{l}</span><span>{v}</span></div>; }

function Reviews() {
  return (
    <div className="p-8 grid grid-cols-3 gap-6">
      <Card className="col-span-1 p-6 bg-[#1A1D24] border-[#2C313C]">
        <h3>Rating overview</h3>
        <div className="mt-4 text-center"><p className="text-5xl text-[#D49653]" style={{ fontFamily: "'Playfair Display', serif" }}>4.9</p>
          <div className="flex justify-center gap-0.5 mt-2">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className="w-4 h-4 fill-[#D49653] text-[#D49653]" />)}</div>
          <p className="text-xs text-[#A5ADBA] mt-2">From 1,284 reviews</p></div>
        <div className="mt-6 space-y-2">
          {[5, 4, 3, 2, 1].map(s => <div key={s} className="flex items-center gap-3 text-xs"><span className="w-3">{s}</span><div className="flex-1 h-1.5 bg-[#20242D] rounded-full overflow-hidden"><div className="h-full bg-[#D49653]" style={{ width: `${[82, 12, 4, 1, 1][5 - s]}%` }} /></div><span className="text-[#A5ADBA] w-8">{[82, 12, 4, 1, 1][5 - s]}%</span></div>)}
        </div>
      </Card>
      <Card className="col-span-2 p-6 bg-[#1A1D24] border-[#2C313C] space-y-4">
        <div className="flex justify-between"><h3>Recent reviews</h3><Button variant="outline" className="border-[#2C313C]">Export</Button></div>
        {[{ n: "Sophie L.", r: 5, b: "Magical evening, the sommelier pairing is a must.", reply: false }, { n: "Marc D.", r: 5, b: "Worth every euro. The pigeon is unforgettable.", reply: true }, { n: "Aiko T.", r: 4, b: "Beautiful but the room can get loud during peak hours.", reply: false }].map((rv, i) => (
          <Card key={i} className="p-4 bg-[#0F1115] border-[#2C313C]">
            <div className="flex items-center justify-between"><div className="flex items-center gap-3"><Avatar className="w-9 h-9"><AvatarFallback>{rv.n[0]}</AvatarFallback></Avatar><div><p className="text-sm">{rv.n}</p><div className="flex gap-0.5">{Array.from({ length: 5 }).map((_, j) => <Star key={j} className={cn("w-3 h-3", j < rv.r ? "fill-[#D49653] text-[#D49653]" : "text-[#2C313C]")} />)}</div></div></div>
              {rv.reply ? <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 border">Replied</Badge> : <Button size="sm" className="bg-[#D49653] hover:bg-[#E0A968] text-[#0F1115]">Reply</Button>}</div>
            <p className="mt-3 text-sm text-[#A5ADBA]">{rv.b}</p>
          </Card>
        ))}
      </Card>
    </div>
  );
}

function Wallet2() {
  return (
    <div className="p-8 space-y-6">
      <div className="grid grid-cols-4 gap-5">
        <StatCard label="Available balance" value="€12,840" icon={Wallet} />
        <StatCard label="Pending payouts" value="€3,210" icon={Receipt} accent="bg-amber-500/15 text-amber-400" />
        <StatCard label="Lifetime earnings" value="€482,920" icon={DollarSign} accent="bg-emerald-500/15 text-emerald-400" />
        <StatCard label="Withdrawals this mo." value="3" icon={TrendingUp} accent="bg-blue-500/15 text-blue-400" />
      </div>
      <Card className="p-6 bg-[#1A1D24] border-[#2C313C]">
        <div className="flex justify-between mb-4"><h3>Withdrawal history</h3><Button className="bg-[#D49653] hover:bg-[#E0A968] text-[#0F1115]"><Plus className="w-4 h-4 mr-2" />Request withdrawal</Button></div>
        <Table>
          <TableHeader><TableRow className="border-[#2C313C] hover:bg-transparent"><TableHead>Reference</TableHead><TableHead>Date</TableHead><TableHead>Method</TableHead><TableHead>Amount</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
          <TableBody>
            {[
              { r: "WD-1248", d: "Jun 1, 2026", m: "BNP Paribas •• 4821", a: "€8,420", s: "Paid" as const },
              { r: "WD-1240", d: "May 15, 2026", m: "BNP Paribas •• 4821", a: "€6,210", s: "Paid" as const },
              { r: "WD-1232", d: "May 1, 2026", m: "BNP Paribas •• 4821", a: "€3,210", s: "Pending" as const },
              { r: "WD-1225", d: "Apr 15, 2026", m: "Stripe Express", a: "€1,400", s: "Refunded" as const },
            ].map(w => <TableRow key={w.r} className="border-[#2C313C]"><TableCell className="text-[#D49653]">{w.r}</TableCell><TableCell className="text-[#A5ADBA]">{w.d}</TableCell><TableCell>{w.m}</TableCell><TableCell>{w.a}</TableCell><TableCell><StatusBadge status={w.s} /></TableCell></TableRow>)}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

function Restaurant() {
  return (
    <div className="p-8 grid grid-cols-3 gap-6">
      <Card className="col-span-2 p-6 bg-[#1A1D24] border-[#2C313C] space-y-5">
        <h3>Restaurant profile</h3>
        <div className="aspect-[16/8] rounded-xl overflow-hidden"><ImageWithFallback src={RESTAURANTS[0].img} alt="" className="w-full h-full object-cover" /></div>
        <div className="grid grid-cols-2 gap-4">
          <FormField l="Name" v="Maison Lumière" />
          <FormField l="Cuisine" v="French · Fine Dining" />
          <FormField l="Phone" v="+33 1 42 86 12 22" />
          <FormField l="Email" v="reservations@maisonlumiere.fr" />
          <FormField l="Address" v="42 rue de Rivoli, 75008 Paris" />
          <FormField l="Capacity" v="42 seats" />
        </div>
      </Card>
      <Card className="p-6 bg-[#1A1D24] border-[#2C313C] space-y-4">
        <h3>Operating hours</h3>
        {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d, i) => (
          <div key={d} className="flex justify-between text-sm"><span className="text-[#A5ADBA]">{d}</span><span>{i === 0 ? "Closed" : "6:00 PM – 11:00 PM"}</span></div>
        ))}
        <Separator className="bg-[#2C313C]" />
        <Button variant="outline" className="w-full border-[#2C313C]">Edit hours</Button>
      </Card>
    </div>
  );
}
function FormField({ l, v }: { l: string; v: string }) {
  return <div><label className="text-xs uppercase tracking-wider text-[#A5ADBA]">{l}</label><Input className="mt-2 bg-[#20242D] border-[#2C313C] h-11" defaultValue={v} /></div>;
}

function Vouchers() {
  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between"><div><p className="text-sm text-[#A5ADBA]">Boost repeat visits with targeted offers.</p></div><Button className="bg-[#D49653] hover:bg-[#E0A968] text-[#0F1115]"><Plus className="w-4 h-4 mr-2" />New voucher</Button></div>
      <div className="grid grid-cols-3 gap-5">
        {[{ n: "Anniversary champagne", c: "ANV2026", u: "82 / 250", v: "Complimentary glass", s: "Active" }, { n: "Tasting Tuesday", c: "TASTE10", u: "240 / 500", v: "10% off tasting menu", s: "Active" }, { n: "First-time guest", c: "WELCOME20", u: "Expired", v: "€20 off", s: "Ended" }].map(v => (
          <Card key={v.c} className="p-5 bg-[#1A1D24] border-[#2C313C]">
            <div className="flex justify-between"><div><p>{v.n}</p><p className="text-xs text-[#A5ADBA] mt-1">Code · {v.c}</p></div><Badge className={cn("border", v.s === "Active" ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : "bg-zinc-500/15 text-zinc-400 border-zinc-500/30")}>{v.s}</Badge></div>
            <p className="mt-4 text-sm text-[#D49653]">{v.v}</p>
            <p className="mt-2 text-xs text-[#A5ADBA]">Used: {v.u}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function OwnerApp() {
  const [active, setActive] = useState("dash");
  const { t } = useLang();
  const titles: Record<string, [string, string]> = {
    dash: [t("Dashboard", "Tổng quan"), t("Overview of operations today", "Tổng quan vận hành hôm nay")],
    bookings: [t("Bookings", "Đặt bàn"), t("Manage all reservations", "Quản lý mọi đặt bàn")],
    restaurant: [t("Restaurant profile", "Hồ sơ nhà hàng"), t("Public-facing details", "Thông tin hiển thị công khai")],
    menu: [t("Menu management", "Quản lý thực đơn"), t("Curate your dishes", "Sắp xếp món ăn")],
    tables: [t("Tables & Floor plan", "Bàn & Sơ đồ sàn"), t("Real-time table status", "Trạng thái bàn theo thời gian thực")],
    vouchers: [t("Vouchers & promos", "Voucher & ưu đãi"), t("Drive repeat business", "Tăng khách hàng quay lại")],
    reviews: [t("Reviews", "Đánh giá"), t("Guest feedback", "Phản hồi từ khách")],
    wallet: [t("Withdrawals", "Rút tiền"), t("Payouts and history", "Thanh toán & lịch sử")],
    chat: [t("Messages", "Tin nhắn"), t("Conversations with guests", "Trò chuyện với khách")],
    settings: [t("Settings", "Cài đặt"), t("Workspace preferences", "Tuỳ chọn không gian")],
  };
  return (
    <div className="min-h-screen bg-[#0F1115] flex">
      <Sidebar active={active} setActive={setActive} />
      <main className="flex-1 overflow-x-hidden">
        <TopBar title={titles[active][0]} subtitle={titles[active][1]} />
        {active === "dash" && <Dashboard />}
        {active === "bookings" && <Bookings />}
        {active === "restaurant" && <Restaurant />}
        {active === "menu" && <MenuMgmt />}
        {active === "tables" && <TablesMgmt />}
        {active === "vouchers" && <Vouchers />}
        {active === "reviews" && <Reviews />}
        {active === "wallet" && <Wallet2 />}
        {active === "chat" && <div className="p-8 text-[#A5ADBA]">Guest messages workspace</div>}
        {active === "settings" && <div className="p-8 text-[#A5ADBA]">Workspace settings</div>}
      </main>
    </div>
  );
}
