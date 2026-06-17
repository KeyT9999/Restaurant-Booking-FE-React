import { useState } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import { Separator } from "../ui/separator";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { RESTAURANTS, StatusBadge, Section, PhaseLabel } from "./shared";
import { Search, MapPin, Calendar, Users, Star, Heart, ChevronRight, Clock, CreditCard, Check, Utensils, Sparkles, Bell, MessageSquare, Filter, ChevronLeft, Award, QrCode } from "lucide-react";
import { cn } from "../ui/utils";
import { useLang } from "./i18n";

function Navbar({ tab, setTab }: { tab: string; setTab: (t: string) => void }) {
  const { t } = useLang();
  const items = [
    { k: "Discover", l: t("Discover", "Khám phá") },
    { k: "Bookings", l: t("Bookings", "Đặt bàn") },
    { k: "Favorites", l: t("Favorites", "Yêu thích") },
    { k: "Chat", l: t("Chat", "Tin nhắn") },
    { k: "Profile", l: t("Profile", "Hồ sơ") },
  ];
  return (
    <header className="sticky top-0 z-30 bg-[#0F1115]/85 backdrop-blur border-b border-[#2C313C]">
      <div className="max-w-[1280px] mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#D49653] to-[#A06B33] grid place-items-center">
              <Utensils className="w-4 h-4 text-[#0F1115]" />
            </div>
            <span style={{ fontFamily: "'Playfair Display', serif" }} className="text-lg">BookEat</span>
          </div>
          <nav className="hidden md:flex items-center gap-1">
            {items.map(i => (
              <button key={i.k} onClick={() => setTab(i.k)} className={cn("px-3 py-2 rounded-md text-sm transition", tab === i.k ? "text-white bg-[#20242D]" : "text-[#A5ADBA] hover:text-white")}>{i.l}</button>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="text-[#A5ADBA]"><Bell className="w-4 h-4" /></Button>
          <Avatar className="w-9 h-9 ring-2 ring-[#D49653]/30">
            <AvatarImage src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200" />
            <AvatarFallback>EC</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}

function Home({ goDetail }: { goDetail: (id: string) => void }) {
  const { t } = useLang();
  const cuisines = [
    [t("French", "Pháp")], [t("Japanese", "Nhật")], [t("Italian", "Ý")], [t("Steakhouse", "Bít tết")], [t("Vegan", "Thuần chay")], [t("Seafood", "Hải sản")]
  ];
  return (
    <div className="space-y-16 pb-20">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <ImageWithFallback src="https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=1800&q=80" alt="" className="w-full h-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0F1115]/40 via-[#0F1115]/70 to-[#0F1115]" />
        </div>
        <div className="relative max-w-[1280px] mx-auto px-6 pt-20 pb-28">
          <PhaseLabel>{t("The art of dining · since 2024", "Nghệ thuật ẩm thực · từ 2024")}</PhaseLabel>
          <h1 className="mt-6 max-w-3xl" style={{ fontFamily: "'Playfair Display', serif", fontSize: "3.5rem", lineHeight: 1.05 }}>
            {t("Reserve a table at the world's most ", "Đặt bàn tại những nhà hàng ")}<em className="text-[#D49653] not-italic">{t("remarkable", "đẳng cấp")}</em>{t(" restaurants.", " nhất thế giới.")}
          </h1>
          <p className="mt-5 max-w-xl text-[#A5ADBA]">{t("From Michelin-starred kitchens to neighborhood gems — secure your seat in seconds with instant confirmation.", "Từ nhà hàng sao Michelin đến quán quen địa phương — giữ chỗ chỉ trong vài giây với xác nhận tức thì.")}</p>

          <Card className="mt-10 p-2 bg-[#1A1D24]/90 border-[#2C313C] backdrop-blur-md max-w-4xl">
            <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr_1fr_0.8fr_auto] gap-2">
              <SearchField icon={<Search className="w-4 h-4" />} label={t("Where", "Địa điểm")} value={t("Paris, France", "Paris, Pháp")} />
              <SearchField icon={<Calendar className="w-4 h-4" />} label={t("Date", "Ngày")} value={t("Fri, Jun 5", "Th6, 5 Jun")} />
              <SearchField icon={<Clock className="w-4 h-4" />} label={t("Time", "Giờ")} value="7:30 PM" />
              <SearchField icon={<Users className="w-4 h-4" />} label={t("Guests", "Khách")} value={t("2 guests", "2 khách")} />
              <Button className="bg-[#D49653] hover:bg-[#E0A968] text-[#0F1115] h-12 px-6">{t("Find a table", "Tìm bàn")}</Button>
            </div>
          </Card>

          <div className="mt-6 flex flex-wrap gap-2">
            {[t("Tonight, 8 PM", "Tối nay, 8h"), t("Anniversary", "Kỷ niệm"), t("Outdoor", "Ngoài trời"), t("Tasting menu", "Thực đơn nếm"), t("Vegan-friendly", "Thân thiện chay"), t("Wine pairing", "Kết hợp rượu")].map(c => (
              <button key={c} className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-[#A5ADBA] hover:text-white transition">{c}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-6 space-y-16">
        <Section title={t("Featured this week", "Nổi bật tuần này")} subtitle={t("Curated by our editors", "Tuyển chọn bởi đội ngũ biên tập")} action={<Button variant="ghost" className="text-[#D49653]">{t("See all", "Xem tất cả")} <ChevronRight className="w-4 h-4 ml-1" /></Button>}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {RESTAURANTS.slice(0, 3).map(r => <RestaurantCard key={r.id} r={r} onClick={() => goDetail(r.id)} large />)}
          </div>
        </Section>

        <Section title={t("Tonight at 8", "Tối nay lúc 8h")} subtitle={t("Available right now near you", "Còn chỗ ngay gần bạn")}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {RESTAURANTS.slice(2, 6).map(r => <RestaurantCard key={r.id} r={r} onClick={() => goDetail(r.id)} />)}
          </div>
        </Section>

        <Section title={t("Browse by cuisine", "Khám phá theo ẩm thực")}>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {cuisines.map(([c]) => (
              <Card key={c} className="p-5 bg-[#1A1D24] border-[#2C313C] hover:border-[#D49653]/50 transition cursor-pointer text-center">
                <div className="w-10 h-10 mx-auto rounded-full bg-[#D49653]/15 grid place-items-center mb-2"><Utensils className="w-4 h-4 text-[#D49653]" /></div>
                <p className="text-sm">{c}</p>
              </Card>
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
}

function SearchField({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 px-4 h-12 rounded-lg hover:bg-white/5 cursor-pointer">
      <div className="text-[#D49653]">{icon}</div>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wider text-[#A5ADBA]">{label}</p>
        <p className="text-sm truncate">{value}</p>
      </div>
    </div>
  );
}

function RestaurantCard({ r, onClick, large }: { r: typeof RESTAURANTS[number]; onClick: () => void; large?: boolean }) {
  return (
    <Card onClick={onClick} className="overflow-hidden bg-[#1A1D24] border-[#2C313C] hover:border-[#D49653]/40 transition cursor-pointer group">
      <div className={cn("relative overflow-hidden", large ? "aspect-[5/4]" : "aspect-[4/3]")}>
        <ImageWithFallback src={r.img} alt={r.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
        <button className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/40 backdrop-blur grid place-items-center text-white hover:text-[#D49653]"><Heart className="w-4 h-4" /></button>
        {r.featured && <Badge className="absolute top-3 left-3 bg-[#D49653] text-[#0F1115] border-0"><Sparkles className="w-3 h-3 mr-1" />Editor's pick</Badge>}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h4 style={{ fontFamily: "'Playfair Display', serif" }}>{r.name}</h4>
            <p className="text-xs text-[#A5ADBA] mt-0.5">{r.cuisine} · {r.price}</p>
          </div>
          <div className="flex items-center gap-1 text-sm shrink-0">
            <Star className="w-3.5 h-3.5 fill-[#D49653] text-[#D49653]" />
            <span>{r.rating}</span>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-1 text-xs text-[#A5ADBA]"><MapPin className="w-3 h-3" />{r.city}</div>
        <div className="mt-3 flex gap-1.5">
          {["6:30", "7:00", "7:30", "8:00"].map(t => (
            <button key={t} className="flex-1 py-1.5 rounded-md bg-[#D49653]/10 hover:bg-[#D49653] hover:text-[#0F1115] text-[#D49653] text-xs transition">{t}</button>
          ))}
        </div>
      </div>
    </Card>
  );
}

function Listing({ goDetail }: { goDetail: (id: string) => void }) {
  return (
    <div className="max-w-[1280px] mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
      <aside className="space-y-5">
        <h3>Filters</h3>
        <FilterGroup title="Price">
          {["$", "$$", "$$$", "$$$$"].map(p => <Pill key={p}>{p}</Pill>)}
        </FilterGroup>
        <FilterGroup title="Cuisine">
          {["French", "Japanese", "Italian", "Mediterranean", "Steakhouse", "Vegan", "Seafood", "Asian Fusion"].map(c => <Pill key={c}>{c}</Pill>)}
        </FilterGroup>
        <FilterGroup title="Dining experience">
          {["Outdoor", "Romantic", "Business", "Group friendly", "Bar seating", "Chef's table"].map(c => <Pill key={c}>{c}</Pill>)}
        </FilterGroup>
        <FilterGroup title="Rating">
          {["4.5+", "4.0+", "3.5+"].map(c => <Pill key={c}>{c}</Pill>)}
        </FilterGroup>
      </aside>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 style={{ fontFamily: "'Playfair Display', serif" }}>148 restaurants in Paris</h2>
            <p className="text-sm text-[#A5ADBA] mt-1">For 2 guests · Fri Jun 5 · 7:30 PM</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="border-[#2C313C]"><Filter className="w-4 h-4 mr-2" />Sort: Recommended</Button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {[...RESTAURANTS, ...RESTAURANTS].map((r, i) => <RestaurantCard key={i} r={r} onClick={() => goDetail(r.id)} />)}
        </div>
      </div>
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return <button className="px-3 py-1.5 rounded-full border border-[#2C313C] text-xs text-[#A5ADBA] hover:border-[#D49653] hover:text-[#D49653] transition mr-1.5 mb-1.5">{children}</button>;
}
function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="space-y-2"><p className="text-xs uppercase tracking-wider text-[#A5ADBA]">{title}</p><div className="flex flex-wrap">{children}</div></div>;
}

function Detail({ id, goBack, goBook }: { id: string; goBack: () => void; goBook: () => void }) {
  const r = RESTAURANTS.find(x => x.id === id) || RESTAURANTS[0];
  const gallery = [r.img, "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=900&q=80", "https://images.unsplash.com/photo-1547573854-74d2a71d0826?w=900&q=80", "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=900&q=80"];
  return (
    <div className="max-w-[1280px] mx-auto px-6 py-8 space-y-10">
      <button onClick={goBack} className="flex items-center gap-2 text-sm text-[#A5ADBA] hover:text-white"><ChevronLeft className="w-4 h-4" />Back to results</button>

      <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[480px]">
        <div className="col-span-2 row-span-2 rounded-2xl overflow-hidden"><ImageWithFallback src={gallery[0]} alt="" className="w-full h-full object-cover" /></div>
        {gallery.slice(1).map((g, i) => <div key={i} className="rounded-2xl overflow-hidden"><ImageWithFallback src={g} alt="" className="w-full h-full object-cover" /></div>)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-10">
        <div className="space-y-8">
          <div>
            <div className="flex items-center gap-2 text-sm text-[#D49653]"><Award className="w-4 h-4" />Michelin Guide · 1 Star</div>
            <h1 className="mt-2" style={{ fontFamily: "'Playfair Display', serif", fontSize: "2.75rem" }}>{r.name}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-[#A5ADBA]">
              <span className="flex items-center gap-1.5"><Star className="w-4 h-4 fill-[#D49653] text-[#D49653]" />{r.rating} ({r.reviews} reviews)</span>
              <span>·</span><span>{r.cuisine}</span><span>·</span><span>{r.price}</span><span>·</span>
              <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{r.city}</span>
            </div>
          </div>

          <Tabs defaultValue="overview">
            <TabsList className="bg-[#1A1D24] border border-[#2C313C]">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="menu">Menu</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="about">About</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="space-y-6 pt-6">
              <p className="text-[#A5ADBA] leading-relaxed">A refined ode to seasonal French gastronomy, {r.name} marries technique with terroir. {r.chef} composes a tasting journey across seven courses, paired with rare biodynamic wines selected by our sommelier team.</p>
              <div className="grid grid-cols-3 gap-4">
                {[{ l: "Dress code", v: "Smart elegant" }, { l: "Parking", v: "Valet available" }, { l: "Avg. stay", v: "2h 15m" }].map(x => (
                  <Card key={x.l} className="p-4 bg-[#1A1D24] border-[#2C313C]">
                    <p className="text-xs uppercase tracking-wider text-[#A5ADBA]">{x.l}</p>
                    <p className="mt-1 text-sm">{x.v}</p>
                  </Card>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="menu" className="space-y-6 pt-6">
              {[{ s: "Entrées", items: [{ n: "Heritage tomato tartare", d: "Burrata, basil oil, sourdough crumble", p: "€24" }, { n: "Hokkaido scallop carpaccio", d: "Yuzu kosho, caviar, chive", p: "€38" }] }, { s: "Plats", items: [{ n: "Wagyu A5 — 90 days dry-aged", d: "Smoked bone marrow, pommes soufflées", p: "€96" }, { n: "Bresse pigeon", d: "Cherry, foie gras, jus corsé", p: "€72" }] }].map(sec => (
                <div key={sec.s}>
                  <h3 style={{ fontFamily: "'Playfair Display', serif" }} className="text-[#D49653]">{sec.s}</h3>
                  <div className="mt-3 divide-y divide-[#2C313C]">
                    {sec.items.map(i => (
                      <div key={i.n} className="py-4 flex items-start justify-between gap-6">
                        <div><p>{i.n}</p><p className="text-sm text-[#A5ADBA] mt-1">{i.d}</p></div>
                        <p className="text-[#D49653] shrink-0">{i.p}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </TabsContent>
            <TabsContent value="reviews" className="space-y-4 pt-6">
              {[{ n: "Sophie L.", r: 5, t: "Magical evening", b: "From the welcome glass to the petit fours, every moment was choreographed perfectly. The lamb was a revelation." }, { n: "Marc D.", r: 5, t: "Worth every euro", b: "Sommelier pairings elevated the tasting menu beyond expectations. Will absolutely return for our anniversary." }, { n: "Aiko T.", r: 4, t: "Beautiful but loud", b: "Food was sublime; the room can get noisy during peak. Request a booth if possible." }].map((rv, i) => (
                <Card key={i} className="p-5 bg-[#1A1D24] border-[#2C313C]">
                  <div className="flex items-center gap-3"><Avatar className="w-10 h-10"><AvatarFallback>{rv.n[0]}</AvatarFallback></Avatar>
                    <div><p className="text-sm">{rv.n}</p><div className="flex gap-0.5">{Array.from({ length: 5 }).map((_, j) => <Star key={j} className={cn("w-3 h-3", j < rv.r ? "fill-[#D49653] text-[#D49653]" : "text-[#2C313C]")} />)}</div></div></div>
                  <p className="mt-3 font-medium">{rv.t}</p><p className="mt-1 text-sm text-[#A5ADBA]">{rv.b}</p>
                </Card>
              ))}
            </TabsContent>
            <TabsContent value="about" className="pt-6">
              <p className="text-[#A5ADBA]">Founded in 2018 by {r.chef}, the kitchen draws from family traditions and modern technique. The 42-seat dining room overlooks a private garden.</p>
            </TabsContent>
          </Tabs>
        </div>

        {/* Booking widget */}
        <Card className="p-6 bg-[#1A1D24] border-[#2C313C] h-fit sticky top-24">
          <h3>Reserve your table</h3>
          <p className="text-xs text-[#A5ADBA] mt-1">Free cancellation up to 24h before</p>
          <div className="mt-5 space-y-3">
            <SelectMock icon={<Calendar className="w-4 h-4" />} label="Fri, Jun 5" />
            <SelectMock icon={<Users className="w-4 h-4" />} label="2 guests" />
          </div>
          <div className="mt-5">
            <p className="text-xs uppercase tracking-wider text-[#A5ADBA] mb-2">Available times</p>
            <div className="grid grid-cols-4 gap-2">
              {["6:00", "6:30", "7:00", "7:30", "8:00", "8:30", "9:00", "9:30"].map((t, i) => (
                <button key={t} className={cn("py-2 rounded-md text-sm transition", i === 3 ? "bg-[#D49653] text-[#0F1115]" : "bg-[#20242D] hover:bg-[#2C313C]")}>{t}</button>
              ))}
            </div>
          </div>
          <Button onClick={goBook} className="w-full mt-5 bg-[#D49653] hover:bg-[#E0A968] text-[#0F1115] h-12">Continue to booking</Button>
          <p className="text-xs text-[#A5ADBA] text-center mt-3">€60 deposit required · refundable</p>
        </Card>
      </div>
    </div>
  );
}

function SelectMock({ icon, label }: { icon: React.ReactNode; label: string }) {
  return <button className="w-full h-11 px-3 rounded-lg bg-[#20242D] border border-[#2C313C] hover:border-[#D49653]/50 flex items-center gap-2 text-sm"><span className="text-[#D49653]">{icon}</span>{label}</button>;
}

function BookingWizard({ goBack, goConfirmed }: { goBack: () => void; goConfirmed: () => void }) {
  const [step, setStep] = useState(0);
  const steps = ["Date & guests", "Choose table", "Your details", "Payment", "Confirmation"];

  return (
    <div className="max-w-[920px] mx-auto px-6 py-10">
      <button onClick={goBack} className="flex items-center gap-2 text-sm text-[#A5ADBA] hover:text-white mb-6"><ChevronLeft className="w-4 h-4" />Back</button>
      <div className="flex items-center gap-2 mb-10">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={cn("w-8 h-8 rounded-full grid place-items-center text-xs", i < step ? "bg-emerald-500 text-white" : i === step ? "bg-[#D49653] text-[#0F1115]" : "bg-[#20242D] text-[#A5ADBA]")}>
              {i < step ? <Check className="w-4 h-4" /> : i + 1}
            </div>
            <div className="flex-1">
              <p className={cn("text-xs", i <= step ? "text-white" : "text-[#A5ADBA]")}>{s}</p>
              {i < steps.length - 1 && <div className={cn("h-px mt-2", i < step ? "bg-emerald-500" : "bg-[#2C313C]")} />}
            </div>
          </div>
        ))}
      </div>

      <Card className="p-8 bg-[#1A1D24] border-[#2C313C]">
        {step === 0 && (
          <div className="space-y-6">
            <h2 style={{ fontFamily: "'Playfair Display', serif" }}>When are you joining us?</h2>
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 14 }).map((_, i) => (
                <button key={i} className={cn("p-3 rounded-lg border text-center transition", i === 4 ? "border-[#D49653] bg-[#D49653]/10" : "border-[#2C313C] hover:border-[#D49653]/40")}>
                  <p className="text-[10px] text-[#A5ADBA] uppercase">{["Mon","Tue","Wed","Thu","Fri","Sat","Sun"][i % 7]}</p>
                  <p className="mt-1">{1 + i}</p>
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-xs uppercase tracking-wider text-[#A5ADBA]">Time</label>
                <div className="mt-2 grid grid-cols-4 gap-2">{["7:00","7:30","8:00","8:30"].map((t,i)=><button key={t} className={cn("py-2 rounded-md text-sm", i===1?"bg-[#D49653] text-[#0F1115]":"bg-[#20242D]")}>{t}</button>)}</div></div>
              <div><label className="text-xs uppercase tracking-wider text-[#A5ADBA]">Guests</label>
                <div className="mt-2 grid grid-cols-4 gap-2">{[1,2,3,4].map((n,i)=><button key={n} className={cn("py-2 rounded-md text-sm", i===1?"bg-[#D49653] text-[#0F1115]":"bg-[#20242D]")}>{n}</button>)}</div></div>
            </div>
          </div>
        )}
        {step === 1 && (
          <div className="space-y-6">
            <h2 style={{ fontFamily: "'Playfair Display', serif" }}>Pick your table</h2>
            <div className="relative aspect-[2/1] rounded-xl bg-[#0F1115] border border-[#2C313C] p-6">
              <p className="absolute top-3 left-4 text-xs text-[#A5ADBA]">Floor plan · Main hall</p>
              <div className="grid grid-cols-6 grid-rows-3 gap-3 h-full pt-4">
                {Array.from({ length: 18 }).map((_, i) => {
                  const taken = [0, 3, 7, 11, 14].includes(i);
                  const chosen = i === 5;
                  return <button key={i} disabled={taken} className={cn("rounded-lg grid place-items-center text-xs", taken ? "bg-rose-500/20 text-rose-400 cursor-not-allowed" : chosen ? "bg-[#D49653] text-[#0F1115]" : "bg-[#20242D] hover:bg-[#2C313C] text-[#A5ADBA]")}>T{i + 1}</button>;
                })}
              </div>
            </div>
            <div className="flex gap-6 text-xs text-[#A5ADBA]">
              <span className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-[#20242D]" />Available</span>
              <span className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-[#D49653]" />Selected</span>
              <span className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-rose-500/40" />Taken</span>
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="space-y-5">
            <h2 style={{ fontFamily: "'Playfair Display', serif" }}>Your details</h2>
            <div className="grid grid-cols-2 gap-4">
              <Field label="First name" placeholder="Elena" />
              <Field label="Last name" placeholder="Costa" />
              <Field label="Email" placeholder="elena@mail.com" />
              <Field label="Phone" placeholder="+33 6 12 34 56 78" />
            </div>
            <Field label="Occasion (optional)" placeholder="Anniversary, birthday…" />
            <div><label className="text-xs uppercase tracking-wider text-[#A5ADBA]">Special requests</label>
              <textarea className="mt-2 w-full h-24 rounded-lg bg-[#20242D] border border-[#2C313C] p-3 text-sm" placeholder="Dietary needs, seating preference…" /></div>
          </div>
        )}
        {step === 3 && (
          <div className="space-y-6">
            <h2 style={{ fontFamily: "'Playfair Display', serif" }}>Secure your table with a deposit</h2>
            <p className="text-sm text-[#A5ADBA]">€60 will be held on your card. Fully refundable if cancelled 24h ahead.</p>
            <Card className="p-5 bg-[#0F1115] border-[#2C313C]">
              <div className="flex items-center gap-3"><CreditCard className="w-5 h-5 text-[#D49653]" /><p className="text-sm">Visa ending 4242</p><Badge className="ml-auto bg-[#20242D]">Default</Badge></div>
            </Card>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Card number" placeholder="4242 4242 4242 4242" />
              <Field label="Name on card" placeholder="Elena Costa" />
              <Field label="Expiry" placeholder="06 / 28" />
              <Field label="CVC" placeholder="123" />
            </div>
            <div className="rounded-lg p-4 bg-[#0F1115] border border-[#2C313C] text-sm space-y-2">
              <div className="flex justify-between"><span className="text-[#A5ADBA]">Deposit</span><span>€60.00</span></div>
              <div className="flex justify-between"><span className="text-[#A5ADBA]">Service fee</span><span>€0.00</span></div>
              <Separator className="my-2 bg-[#2C313C]" />
              <div className="flex justify-between"><span>Total</span><span className="text-[#D49653]">€60.00</span></div>
            </div>
          </div>
        )}
        {step === 4 && (
          <div className="text-center py-10">
            <div className="w-20 h-20 rounded-full bg-emerald-500/15 grid place-items-center mx-auto">
              <Check className="w-10 h-10 text-emerald-400" />
            </div>
            <h2 className="mt-6" style={{ fontFamily: "'Playfair Display', serif" }}>Your table is booked</h2>
            <p className="mt-2 text-[#A5ADBA]">Confirmation #BK-29845 · Fri Jun 5, 7:30 PM · 2 guests</p>
            <div className="mt-6 mx-auto w-44 h-44 grid place-items-center rounded-xl bg-white p-3">
              <QrCode className="w-32 h-32 text-[#0F1115]" />
            </div>
            <p className="mt-4 text-xs text-[#A5ADBA]">Present this QR code at check-in</p>
            <div className="mt-8 flex justify-center gap-3">
              <Button variant="outline" className="border-[#2C313C]">Add to calendar</Button>
              <Button onClick={goConfirmed} className="bg-[#D49653] hover:bg-[#E0A968] text-[#0F1115]">View my bookings</Button>
            </div>
          </div>
        )}

        {step < 4 && (
          <div className="mt-8 flex justify-between border-t border-[#2C313C] pt-6">
            <Button variant="ghost" disabled={step === 0} onClick={() => setStep(s => s - 1)}>Back</Button>
            <Button onClick={() => setStep(s => s + 1)} className="bg-[#D49653] hover:bg-[#E0A968] text-[#0F1115] px-8">{step === 3 ? "Pay & confirm" : "Continue"}</Button>
          </div>
        )}
      </Card>
    </div>
  );
}

function Field({ label, placeholder }: { label: string; placeholder: string }) {
  return <div><label className="text-xs uppercase tracking-wider text-[#A5ADBA]">{label}</label><Input className="mt-2 bg-[#20242D] border-[#2C313C] h-11" placeholder={placeholder} /></div>;
}

function MyBookings() {
  const { t } = useLang();
  const bookings = [
    { id: "BK-29845", name: "Maison Lumière", date: "Fri, Jun 5 · 7:30 PM", guests: 2, status: "Confirmed" as const, img: RESTAURANTS[0].img },
    { id: "BK-29721", name: "Kaiseki Hinoki", date: "Sat, Jun 13 · 6:00 PM", guests: 4, status: "Pending" as const, img: RESTAURANTS[1].img },
    { id: "BK-29402", name: "Cinta Roja", date: "Sun, May 24 · 8:30 PM", guests: 2, status: "Completed" as const, img: RESTAURANTS[3].img },
    { id: "BK-29301", name: "Aurora Steakhouse", date: "Wed, May 14 · 7:00 PM", guests: 6, status: "Cancelled" as const, img: RESTAURANTS[5].img },
  ];
  return (
    <div className="max-w-[1100px] mx-auto px-6 py-10 space-y-8">
      <div><h1 style={{ fontFamily: "'Playfair Display', serif" }}>{t("My bookings", "Đặt chỗ của tôi")}</h1><p className="text-[#A5ADBA] mt-1">{t("Upcoming and past reservations", "Đặt bàn sắp tới và đã qua")}</p></div>
      <Tabs defaultValue="upcoming">
        <TabsList className="bg-[#1A1D24] border border-[#2C313C]"><TabsTrigger value="upcoming">{t("Upcoming", "Sắp tới")} (2)</TabsTrigger><TabsTrigger value="past">{t("Past", "Đã qua")} (12)</TabsTrigger><TabsTrigger value="cancelled">{t("Cancelled", "Đã hủy")}</TabsTrigger></TabsList>
        <TabsContent value="upcoming" className="space-y-4 mt-6">
          {bookings.map(b => (
            <Card key={b.id} className="p-4 bg-[#1A1D24] border-[#2C313C] flex items-center gap-5">
              <div className="w-24 h-24 rounded-lg overflow-hidden shrink-0"><ImageWithFallback src={b.img} alt="" className="w-full h-full object-cover" /></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3"><h3 style={{ fontFamily: "'Playfair Display', serif" }}>{b.name}</h3><StatusBadge status={b.status} /></div>
                <div className="mt-2 flex items-center gap-4 text-sm text-[#A5ADBA]">
                  <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{b.date}</span>
                  <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" />{b.guests} {t("guests", "khách")}</span>
                  <span>#{b.id}</span>
                </div>
              </div>
              <div className="flex gap-2"><Button variant="outline" className="border-[#2C313C]">{t("Modify", "Sửa")}</Button><Button className="bg-[#D49653] hover:bg-[#E0A968] text-[#0F1115]"><QrCode className="w-4 h-4 mr-2" />{t("Check-in", "Nhận bàn")}</Button></div>
            </Card>
          ))}
        </TabsContent>
        <TabsContent value="past">
          <div className="py-20 text-center text-[#A5ADBA]"><Utensils className="w-10 h-10 mx-auto opacity-30 mb-3" />Past reservations appear here</div>
        </TabsContent>
        <TabsContent value="cancelled"><div className="py-20 text-center text-[#A5ADBA]">No cancellations recently</div></TabsContent>
      </Tabs>
    </div>
  );
}

function Favorites({ goDetail }: { goDetail: (id: string) => void }) {
  return (
    <div className="max-w-[1280px] mx-auto px-6 py-10 space-y-6">
      <div><h1 style={{ fontFamily: "'Playfair Display', serif" }}>Saved restaurants</h1><p className="text-[#A5ADBA] mt-1">Your hand-picked dining list</p></div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {RESTAURANTS.slice(0, 4).map(r => <RestaurantCard key={r.id} r={r} onClick={() => goDetail(r.id)} />)}
      </div>
    </div>
  );
}

function Chat() {
  const threads = [
    { n: "Maison Lumière", l: "We've prepared the chef's window for…", u: 2, t: "2m" },
    { n: "Kaiseki Hinoki", l: "Your dietary preference is noted.", u: 0, t: "1h" },
    { n: "Aurora Steakhouse", l: "See you Wednesday Elena!", u: 0, t: "Yest" },
  ];
  return (
    <div className="max-w-[1280px] mx-auto px-6 py-8">
      <Card className="grid grid-cols-1 lg:grid-cols-[320px_1fr] bg-[#1A1D24] border-[#2C313C] overflow-hidden h-[640px]">
        <div className="border-r border-[#2C313C] flex flex-col">
          <div className="p-4 border-b border-[#2C313C]"><Input placeholder="Search conversations" className="bg-[#20242D] border-[#2C313C]" /></div>
          <div className="flex-1 overflow-auto">
            {threads.map((t, i) => (
              <button key={t.n} className={cn("w-full p-4 flex gap-3 text-left border-b border-[#2C313C] hover:bg-[#20242D]", i === 0 && "bg-[#20242D]")}>
                <Avatar className="w-10 h-10"><AvatarFallback>{t.n[0]}</AvatarFallback></Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between"><p className="text-sm truncate">{t.n}</p><p className="text-xs text-[#A5ADBA]">{t.t}</p></div>
                  <p className="text-xs text-[#A5ADBA] truncate mt-0.5">{t.l}</p>
                </div>
                {t.u > 0 && <span className="w-5 h-5 rounded-full bg-[#D49653] text-[#0F1115] text-xs grid place-items-center self-center">{t.u}</span>}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col">
          <div className="p-4 border-b border-[#2C313C] flex items-center gap-3">
            <Avatar className="w-10 h-10"><AvatarFallback>M</AvatarFallback></Avatar>
            <div><p className="text-sm">Maison Lumière</p><p className="text-xs text-emerald-400">Active now</p></div>
          </div>
          <div className="flex-1 overflow-auto p-6 space-y-4">
            <Bubble from="them">Hello Elena, looking forward to welcoming you Friday for your anniversary 🥂</Bubble>
            <Bubble from="me">Thank you! Would a window table be possible?</Bubble>
            <Bubble from="them">Of course — table 14 by the garden is yours. We've also added a complimentary amuse-bouche for the occasion.</Bubble>
            <Bubble from="me">Wonderful, see you soon.</Bubble>
          </div>
          <div className="p-4 border-t border-[#2C313C] flex gap-2"><Input className="bg-[#20242D] border-[#2C313C]" placeholder="Write a message…" /><Button className="bg-[#D49653] hover:bg-[#E0A968] text-[#0F1115]">Send</Button></div>
        </div>
      </Card>
    </div>
  );
}

function Bubble({ from, children }: { from: "me" | "them"; children: React.ReactNode }) {
  return (
    <div className={cn("flex", from === "me" ? "justify-end" : "justify-start")}>
      <div className={cn("max-w-[70%] px-4 py-2.5 rounded-2xl text-sm", from === "me" ? "bg-[#D49653] text-[#0F1115] rounded-br-sm" : "bg-[#20242D] rounded-bl-sm")}>{children}</div>
    </div>
  );
}

function Profile() {
  return (
    <div className="max-w-[1100px] mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">
      <aside className="space-y-1">
        {["Profile", "Notifications", "Payment methods", "Preferences", "Privacy", "Settings"].map((s, i) => (
          <button key={s} className={cn("w-full text-left px-4 py-2.5 rounded-lg text-sm", i === 0 ? "bg-[#20242D] text-white" : "text-[#A5ADBA] hover:text-white hover:bg-[#20242D]/50")}>{s}</button>
        ))}
      </aside>
      <div className="space-y-6">
        <Card className="p-6 bg-[#1A1D24] border-[#2C313C]">
          <div className="flex items-center gap-5">
            <Avatar className="w-20 h-20 ring-2 ring-[#D49653]/40"><AvatarImage src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200" /><AvatarFallback>EC</AvatarFallback></Avatar>
            <div className="flex-1"><h2 style={{ fontFamily: "'Playfair Display', serif" }}>Elena Costa</h2><p className="text-[#A5ADBA] text-sm">elena.costa@email.com · Member since 2024</p>
              <div className="mt-3 flex gap-2"><Badge className="bg-[#D49653]/15 text-[#D49653] border-[#D49653]/30 border">Gold member</Badge><Badge className="bg-[#20242D] border border-[#2C313C]">42 visits</Badge></div></div>
            <Button variant="outline" className="border-[#2C313C]">Edit profile</Button>
          </div>
        </Card>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Full name" placeholder="Elena Costa" />
          <Field label="Email" placeholder="elena@email.com" />
          <Field label="Phone" placeholder="+33 6 12 34 56 78" />
          <Field label="City" placeholder="Paris" />
        </div>
      </div>
    </div>
  );
}

export default function CustomerApp() {
  const [tab, setTab] = useState("Discover");
  const [view, setView] = useState<{ k: "home" | "list" | "detail" | "book"; id?: string }>({ k: "home" });

  let content: React.ReactNode;
  if (tab === "Bookings") content = <MyBookings />;
  else if (tab === "Favorites") content = <Favorites goDetail={id => { setTab("Discover"); setView({ k: "detail", id }); }} />;
  else if (tab === "Chat") content = <Chat />;
  else if (tab === "Profile") content = <Profile />;
  else {
    if (view.k === "home") content = <><Home goDetail={id => setView({ k: "detail", id })} /><div className="max-w-[1280px] mx-auto px-6 pb-16"><Listing goDetail={id => setView({ k: "detail", id })} /></div></>;
    else if (view.k === "detail") content = <Detail id={view.id!} goBack={() => setView({ k: "home" })} goBook={() => setView({ k: "book", id: view.id })} />;
    else if (view.k === "book") content = <BookingWizard goBack={() => setView({ k: "detail", id: view.id })} goConfirmed={() => { setTab("Bookings"); setView({ k: "home" }); }} />;
  }

  return (
    <div className="min-h-screen bg-[#0F1115]">
      <Navbar tab={tab} setTab={t => { setTab(t); setView({ k: "home" }); }} />
      {content}
    </div>
  );
}
