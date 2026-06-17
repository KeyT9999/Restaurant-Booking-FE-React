import { useState } from "react";
import CustomerApp from "./components/bookeat/CustomerApp";
import OwnerApp from "./components/bookeat/OwnerApp";
import AdminApp from "./components/bookeat/AdminApp";
import { Utensils, ChefHat, Shield, Globe, Check } from "lucide-react";
import { cn } from "./components/ui/utils";
import { LangProvider, useLang } from "./components/bookeat/i18n";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "./components/ui/dropdown-menu";

function Shell() {
  const [role, setRole] = useState<"customer" | "owner" | "admin">("customer");
  const { lang, setLang, t } = useLang();

  const ROLES = [
    { k: "customer", l: t("Customer", "Khách hàng"), icon: Utensils },
    { k: "owner", l: t("Restaurant Owner", "Chủ nhà hàng"), icon: ChefHat },
    { k: "admin", l: t("Platform Admin", "Quản trị viên"), icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-[#0F1115] text-white">
      <div className="sticky top-0 z-50 bg-[#0B0D11]/90 backdrop-blur border-b border-[#2C313C]">
        <div className="max-w-[1600px] mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 hover:bg-[#14171D] px-2 py-1 rounded-md transition" title={t("Change language", "Đổi ngôn ngữ")}>
                  <div className="w-7 h-7 rounded-md bg-gradient-to-br from-[#D49653] to-[#A06B33] grid place-items-center">
                    <Utensils className="w-3.5 h-3.5 text-[#0F1115]" />
                  </div>
                  <span style={{ fontFamily: "'Playfair Display', serif" }} className="text-sm">BookEat</span>
                  <Globe className="w-3.5 h-3.5 text-[#A5ADBA]" />
                  <span className="text-[10px] text-[#D49653] uppercase tracking-wider">{lang}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="bg-[#14171D] border-[#2C313C] min-w-[200px]">
                <DropdownMenuItem onClick={() => setLang("en")} className="cursor-pointer">
                  <span className="mr-2">🇬🇧</span>English
                  {lang === "en" && <Check className="w-4 h-4 ml-auto text-[#D49653]" />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLang("vi")} className="cursor-pointer">
                  <span className="mr-2">🇻🇳</span>Tiếng Việt
                  {lang === "vi" && <Check className="w-4 h-4 ml-auto text-[#D49653]" />}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <span className="text-xs text-[#A5ADBA] px-2 py-0.5 rounded-full border border-[#2C313C]">{t("Multi-role demo", "Bản demo đa vai trò")}</span>
          </div>
          <div className="flex items-center gap-1 p-1 rounded-lg bg-[#14171D] border border-[#2C313C]">
            {ROLES.map(r => {
              const Icon = r.icon;
              const active = role === r.k;
              return (
                <button
                  key={r.k}
                  onClick={() => setRole(r.k as any)}
                  className={cn("flex items-center gap-2 px-3 py-1.5 rounded-md text-xs transition", active ? "bg-[#D49653] text-[#0F1115]" : "text-[#A5ADBA] hover:text-white")}
                >
                  <Icon className="w-3.5 h-3.5" />{r.l}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {role === "customer" && <CustomerApp />}
      {role === "owner" && <OwnerApp />}
      {role === "admin" && <AdminApp />}
    </div>
  );
}

export default function App() {
  return (
    <LangProvider>
      <Shell />
    </LangProvider>
  );
}
