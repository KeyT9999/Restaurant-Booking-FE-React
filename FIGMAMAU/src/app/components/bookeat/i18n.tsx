import { createContext, useContext, useState, ReactNode } from "react";

type Lang = "en" | "vi";
type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (en: string, vi: string) => string };

const LangCtx = createContext<Ctx>({ lang: "en", setLang: () => {}, t: (en) => en });

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");
  const t = (en: string, vi: string) => (lang === "vi" ? vi : en);
  return <LangCtx.Provider value={{ lang, setLang, t }}>{children}</LangCtx.Provider>;
}

export const useLang = () => useContext(LangCtx);
