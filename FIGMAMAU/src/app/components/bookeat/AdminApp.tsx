import { useState } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../ui/table";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { StatusBadge, StatCard, RESTAURANTS } from "./shared";
import { LayoutGrid, Users, Building2, DollarSign, ShieldCheck, FileText, BellRing, Settings, Search, Shield, AlertTriangle, CheckCircle2, XCircle, ChevronRight, Activity, Globe } from "lucide-react";
import { cn } from "../ui/utils";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { useLang } from "./i18n";

function Sidebar({ active, setActive }: { active: string; setActive: (k: string) => void }) {
  const { t } = useLang();
  const NAV = [
    { k: "dash", l: t("Overview", "Tổng quan"), i: LayoutGrid },
    { k: "users", l: t("Users", "Người dùng"), i: Users },
    { k: "approvals", l: t("Approval queue", "Hàng chờ duyệt"), i: ShieldCheck },
    { k: "restaurants", l: t("Restaurants", "Nhà hàng"), i: Building2 },
    { k: "bookings", l: t("Booking monitor", "Giám sát đặt bàn"), i: Activity },
    { k: "revenue", l: t("Revenue", "Doanh thu"), i: DollarSign },
    { k: "withdrawals", l: t("Withdrawals", "Rút tiền"), i: FileText },
    { k: "audit", l: t("Audit logs", "Nhật ký kiểm toán"), i: Shield },
    { k: "notifications", l: t("Notifications", "Thông báo"), i: BellRing },
    { k: "settings", l: t("Platform", "Nền tảng"), i: Settings },
  ];
  return (
    <aside className="w-64 shrink-0 bg-[#14171D] border-r border-[#2C313C] flex flex-col">
      <div className="p-5 border-b border-[#2C313C] flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#D49653] to-[#A06B33] grid place-items-center"><Shield className="w-5 h-5 text-[#0F1115]" /></div>
        <div><p className="text-sm">BookEat Admin</p><p className="text-[10px] text-[#A5ADBA]">{t("Platform control", "Điều khiển nền tảng")}</p></div>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {NAV.map(n => { const Icon = n.i; return (
          <button key={n.k} onClick={() => setActive(n.k)} className={cn("w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm", active === n.k ? "bg-[#D49653]/15 text-[#D49653]" : "text-[#A5ADBA] hover:text-white hover:bg-[#20242D]")}>
            <Icon className="w-4 h-4" />{n.l}
            {n.k === "approvals" && <Badge className="ml-auto bg-[#D49653] text-[#0F1115] border-0">12</Badge>}
          </button>
        );})}
      </nav>
    </aside>
  );
}

const PLATFORM_DATA = Array.from({ length: 30 }).map((_, i) => ({ d: i + 1, gmv: 80000 + Math.round(Math.sin(i / 3) * 12000) + i * 2400, bookings: 1200 + Math.round(Math.cos(i / 2) * 200) + i * 30 }));
const CITY = [{ c: "Paris", v: 4820 }, { c: "London", v: 3920 }, { c: "Tokyo", v: 3340 }, { c: "NYC", v: 2980 }, { c: "Dubai", v: 2210 }, { c: "BCN", v: 1840 }];

function Dashboard() {
  const { t } = useLang();
  return (
    <div className="p-8 space-y-8">
      <div className="grid grid-cols-4 gap-5">
        <StatCard label={t("GMV (30d)", "GMV (30 ngày)")} value="€3.42M" delta={14} icon={DollarSign} accent="bg-emerald-500/15 text-emerald-400" />
        <StatCard label={t("Active restaurants", "Nhà hàng đang hoạt động")} value="2,184" delta={6} icon={Building2} />
        <StatCard label={t("Bookings (30d)", "Đặt bàn (30 ngày)")} value="48,920" delta={9} icon={Activity} accent="bg-blue-500/15 text-blue-400" />
        <StatCard label={t("Active users", "Người dùng hoạt động")} value="184k" delta={11} icon={Users} accent="bg-violet-500/15 text-violet-400" />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <Card className="col-span-2 p-6 bg-[#1A1D24] border-[#2C313C]">
          <div className="flex justify-between mb-3"><h3>Platform GMV</h3><Tabs defaultValue="30d"><TabsList className="bg-[#20242D]"><TabsTrigger value="7d">7d</TabsTrigger><TabsTrigger value="30d">30d</TabsTrigger><TabsTrigger value="90d">90d</TabsTrigger></TabsList></Tabs></div>
          <div className="h-72">
            <ResponsiveContainer><LineChart data={PLATFORM_DATA}>
              <CartesianGrid stroke="#2C313C" vertical={false} />
              <XAxis dataKey="d" stroke="#A5ADBA" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#A5ADBA" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "#1A1D24", border: "1px solid #2C313C" }} />
              <Line type="monotone" dataKey="gmv" stroke="#D49653" strokeWidth={2.5} dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="bookings" stroke="#3B82F6" strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart></ResponsiveContainer>
          </div>
        </Card>
        <Card className="p-6 bg-[#1A1D24] border-[#2C313C]">
          <h3>Top cities</h3>
          <div className="h-72 mt-2"><ResponsiveContainer><BarChart data={CITY} layout="vertical"><XAxis type="number" hide /><YAxis type="category" dataKey="c" stroke="#A5ADBA" fontSize={11} tickLine={false} axisLine={false} /><Tooltip contentStyle={{ background: "#1A1D24", border: "1px solid #2C313C" }} /><Bar dataKey="v" fill="#D49653" radius={[0, 6, 6, 0]} isAnimationActive={false} /></BarChart></ResponsiveContainer></div>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card className="p-6 bg-[#1A1D24] border-[#2C313C]">
          <div className="flex justify-between"><h3>Pending approvals</h3><Button variant="ghost" className="text-[#D49653]">Open queue <ChevronRight className="w-4 h-4 ml-1" /></Button></div>
          <div className="mt-4 space-y-3">
            {RESTAURANTS.slice(0, 3).map(r => (
              <div key={r.id} className="flex items-center gap-3 p-3 rounded-lg bg-[#0F1115]">
                <div className="w-10 h-10 rounded-lg overflow-hidden"><ImageWithFallback src={r.img} alt="" className="w-full h-full object-cover" /></div>
                <div className="flex-1 min-w-0"><p className="text-sm truncate">{r.name}</p><p className="text-xs text-[#A5ADBA]">{r.city} · {r.cuisine}</p></div>
                <div className="flex gap-1"><Button size="sm" variant="outline" className="border-rose-500/40 text-rose-400 hover:bg-rose-500/10"><XCircle className="w-4 h-4" /></Button><Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white"><CheckCircle2 className="w-4 h-4" /></Button></div>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-6 bg-[#1A1D24] border-[#2C313C]">
          <div className="flex justify-between"><h3>System health</h3><Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 border">All systems normal</Badge></div>
          <div className="mt-4 space-y-3">
            {[{ n: "API uptime", v: "99.98%", ok: true }, { n: "Payment processor", v: "Operational", ok: true }, { n: "Email delivery", v: "Degraded · 12% delay", ok: false }, { n: "Search index", v: "Operational", ok: true }, { n: "Background jobs", v: "Operational", ok: true }].map(s => (
              <div key={s.n} className="flex items-center justify-between p-3 rounded-lg bg-[#0F1115]">
                <span className="text-sm">{s.n}</span>
                <span className={cn("text-sm flex items-center gap-2", s.ok ? "text-emerald-400" : "text-amber-400")}>{s.ok ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}{s.v}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function UsersScreen() {
  const users = [
    { n: "Elena Costa", e: "elena@email.com", r: "Customer", b: 42, s: "Active", j: "Jan 2024" },
    { n: "Antoine Reverdy", e: "antoine@maisonlumiere.fr", r: "Owner", b: 1284, s: "Active", j: "Sep 2023" },
    { n: "Haruto Ishii", e: "h.ishii@kaiseki.jp", r: "Owner", b: 832, s: "Active", j: "Nov 2023" },
    { n: "Marc Dubois", e: "marc@gmail.com", r: "Customer", b: 18, s: "Active", j: "Mar 2025" },
    { n: "James O'Connor", e: "j.oconnor@biz.com", r: "Customer", b: 6, s: "Suspended", j: "Apr 2025" },
    { n: "Lina Bauer", e: "lina@design.de", r: "Customer", b: 24, s: "Active", j: "Feb 2024" },
  ];
  return (
    <div className="p-8 space-y-6">
      <div className="flex gap-3">
        <div className="relative flex-1"><Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#A5ADBA]" /><Input placeholder="Search by name, email, or ID" className="pl-9 bg-[#20242D] border-[#2C313C]" /></div>
        <Tabs defaultValue="all"><TabsList className="bg-[#1A1D24] border border-[#2C313C]"><TabsTrigger value="all">All (184k)</TabsTrigger><TabsTrigger value="cust">Customers</TabsTrigger><TabsTrigger value="own">Owners</TabsTrigger><TabsTrigger value="sus">Suspended</TabsTrigger></TabsList></Tabs>
      </div>
      <Card className="bg-[#1A1D24] border-[#2C313C]">
        <Table>
          <TableHeader><TableRow className="border-[#2C313C] hover:bg-transparent"><TableHead>User</TableHead><TableHead>Email</TableHead><TableHead>Role</TableHead><TableHead>Bookings</TableHead><TableHead>Joined</TableHead><TableHead>Status</TableHead><TableHead></TableHead></TableRow></TableHeader>
          <TableBody>
            {users.map(u => (
              <TableRow key={u.e} className="border-[#2C313C]">
                <TableCell><div className="flex items-center gap-3"><Avatar className="w-8 h-8"><AvatarFallback>{u.n[0]}</AvatarFallback></Avatar>{u.n}</div></TableCell>
                <TableCell className="text-[#A5ADBA]">{u.e}</TableCell>
                <TableCell><Badge className={cn("border", u.r === "Owner" ? "bg-[#D49653]/15 text-[#D49653] border-[#D49653]/30" : "bg-blue-500/15 text-blue-400 border-blue-500/30")}>{u.r}</Badge></TableCell>
                <TableCell>{u.b}</TableCell>
                <TableCell className="text-[#A5ADBA]">{u.j}</TableCell>
                <TableCell><Badge className={cn("border", u.s === "Active" ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : "bg-rose-500/15 text-rose-400 border-rose-500/30")}>{u.s}</Badge></TableCell>
                <TableCell><Button variant="ghost" size="sm">View</Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

function Approvals() {
  return (
    <div className="p-8 grid grid-cols-3 gap-6">
      <div className="col-span-1 space-y-3">
        <div className="flex justify-between items-center"><h3>Queue · 12 pending</h3><Button variant="ghost" size="sm" className="text-[#A5ADBA]">Sort</Button></div>
        {RESTAURANTS.slice(0, 5).map((r, i) => (
          <Card key={r.id} className={cn("p-4 bg-[#1A1D24] border-[#2C313C] cursor-pointer", i === 0 && "border-[#D49653]")}>
            <div className="flex gap-3"><div className="w-14 h-14 rounded-lg overflow-hidden shrink-0"><ImageWithFallback src={r.img} alt="" className="w-full h-full object-cover" /></div>
              <div className="min-w-0"><p className="text-sm truncate">{r.name}</p><p className="text-xs text-[#A5ADBA] mt-0.5">{r.city}</p><Badge className="mt-2 bg-amber-500/15 text-amber-400 border-amber-500/30 border">Submitted 2h ago</Badge></div></div>
          </Card>
        ))}
      </div>
      <Card className="col-span-2 bg-[#1A1D24] border-[#2C313C] overflow-hidden">
        <div className="aspect-[16/8]"><ImageWithFallback src={RESTAURANTS[0].img} alt="" className="w-full h-full object-cover" /></div>
        <div className="p-6 space-y-5">
          <div className="flex justify-between items-start">
            <div><h2 style={{ fontFamily: "'Playfair Display', serif" }}>{RESTAURANTS[0].name}</h2><p className="text-[#A5ADBA] text-sm mt-1">Submitted by {RESTAURANTS[0].chef} · 42 rue de Rivoli, Paris 8e</p></div>
            <div className="flex gap-2"><Button variant="outline" className="border-rose-500/40 text-rose-400 hover:bg-rose-500/10"><XCircle className="w-4 h-4 mr-2" />Reject</Button><Button className="bg-emerald-500 hover:bg-emerald-600 text-white"><CheckCircle2 className="w-4 h-4 mr-2" />Approve</Button></div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[{ l: "License", v: "Verified", ok: true }, { l: "Tax ID", v: "Verified", ok: true }, { l: "Insurance", v: "Awaiting upload", ok: false }, { l: "Food safety cert.", v: "Verified", ok: true }, { l: "Bank account", v: "Verified", ok: true }, { l: "Owner ID", v: "Verified", ok: true }].map(c => (
              <Card key={c.l} className="p-3 bg-[#0F1115] border-[#2C313C]">
                <p className="text-xs text-[#A5ADBA]">{c.l}</p>
                <p className={cn("text-sm mt-1 flex items-center gap-2", c.ok ? "text-emerald-400" : "text-amber-400")}>{c.ok ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}{c.v}</p>
              </Card>
            ))}
          </div>
          <div><label className="text-xs uppercase tracking-wider text-[#A5ADBA]">Internal notes</label><textarea className="mt-2 w-full h-24 rounded-lg bg-[#20242D] border border-[#2C313C] p-3 text-sm" placeholder="Add a note for the audit log…" /></div>
        </div>
      </Card>
    </div>
  );
}

function Audit() {
  const logs = [
    { t: "11:42", a: "admin@bookeat.io", e: "Approved restaurant", o: "Maison Lumière #2104" },
    { t: "11:28", a: "system", e: "Auto-flagged review", o: "Review #R-8821 (spam)" },
    { t: "10:51", a: "admin@bookeat.io", e: "Suspended user", o: "james.oconnor (chargebacks)" },
    { t: "10:14", a: "system", e: "Released funds", o: "Withdrawal WD-1248 (€8,420)" },
    { t: "09:32", a: "ops@bookeat.io", e: "Updated commission", o: "Region: APAC → 14%" },
  ];
  return (
    <div className="p-8 space-y-4">
      <Card className="bg-[#1A1D24] border-[#2C313C]">
        <Table>
          <TableHeader><TableRow className="border-[#2C313C] hover:bg-transparent"><TableHead>Time</TableHead><TableHead>Actor</TableHead><TableHead>Event</TableHead><TableHead>Object</TableHead></TableRow></TableHeader>
          <TableBody>{logs.map((l, i) => <TableRow key={i} className="border-[#2C313C]"><TableCell className="text-[#A5ADBA]">{l.t}</TableCell><TableCell>{l.a}</TableCell><TableCell><Badge className="bg-[#20242D] border border-[#2C313C]">{l.e}</Badge></TableCell><TableCell className="text-[#A5ADBA]">{l.o}</TableCell></TableRow>)}</TableBody>
        </Table>
      </Card>
    </div>
  );
}

export default function AdminApp() {
  const [active, setActive] = useState("dash");
  const { t } = useLang();
  const titles: Record<string, [string, string]> = {
    dash: [t("Platform overview", "Tổng quan nền tảng"), t("Global health & metrics", "Sức khoẻ & chỉ số toàn cầu")],
    users: [t("User management", "Quản lý người dùng"), t("184,209 accounts", "184.209 tài khoản")],
    approvals: [t("Restaurant approvals", "Duyệt nhà hàng"), t("12 awaiting decision", "12 đang chờ duyệt")],
    restaurants: [t("Restaurants", "Nhà hàng"), t("All listings", "Tất cả danh sách")],
    bookings: [t("Booking monitor", "Giám sát đặt bàn"), t("Live cross-platform", "Trực tiếp đa nền tảng")],
    revenue: [t("Revenue analytics", "Phân tích doanh thu"), t("Commissions & GMV", "Hoa hồng & GMV")],
    withdrawals: [t("Withdrawals", "Rút tiền"), t("Owner payouts", "Thanh toán cho chủ")],
    audit: [t("Audit logs", "Nhật ký kiểm toán"), t("Immutable activity trail", "Dấu vết hoạt động bất biến")],
    notifications: [t("System notifications", "Thông báo hệ thống"), t("Broadcast & templates", "Phát đi & mẫu")],
    settings: [t("Platform settings", "Cài đặt nền tảng"), t("Roles, commissions, regions", "Vai trò, hoa hồng, khu vực")],
  };
  return (
    <div className="min-h-screen bg-[#0F1115] flex">
      <Sidebar active={active} setActive={setActive} />
      <main className="flex-1 overflow-x-hidden">
        <div className="px-8 py-6 border-b border-[#2C313C] flex items-center justify-between">
          <div><h1 style={{ fontFamily: "'Playfair Display', serif" }}>{titles[active][0]}</h1><p className="text-sm text-[#A5ADBA] mt-1">{titles[active][1]}</p></div>
          <div className="flex items-center gap-3"><Badge className="bg-[#20242D] border border-[#2C313C]"><Globe className="w-3 h-3 mr-1.5" />Global · EU-W3</Badge><Avatar className="w-9 h-9"><AvatarFallback>AD</AvatarFallback></Avatar></div>
        </div>
        {active === "dash" && <Dashboard />}
        {active === "users" && <UsersScreen />}
        {active === "approvals" && <Approvals />}
        {active === "audit" && <Audit />}
        {!["dash","users","approvals","audit"].includes(active) && <div className="p-8 text-[#A5ADBA]">Section: {titles[active][0]}</div>}
      </main>
    </div>
  );
}
