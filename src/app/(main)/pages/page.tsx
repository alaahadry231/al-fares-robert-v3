"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check, CheckCircle, Clock, XCircle, Trophy } from "lucide-react";

type SportsPage = {
  id: number;
  name: string;
  description: string;
  code: string;
  category: string;
  rate: string;
  matches_count: number;
  status: string;
};

export default function PagesPage() {
  const [pages, setPages] = useState<SportsPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "won" | "lost" | "pending">("all");

  useEffect(() => {
    const fetchPages = async () => {
      try {
        const res = await fetch("/api/pages");
        const json = await res.json();
        setPages(json.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPages();
  }, []);

  const handleCopy = (code: string, id: number) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getStatusConfig = (status: string) => {
    if (status === "won") {
      return {
        label: "رابح",
        icon: <CheckCircle size={14} className="md:w-4 md:h-4" />,
        classes: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        btnClass: "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_30px_rgba(16,185,129,0.6)]",
        cardBorder: "border-emerald-500/30 hover:border-emerald-500/60",
        glow: "from-emerald-500/20",
      };
    }
    if (status === "lost") {
      return {
        label: "خاسر",
        icon: <XCircle size={14} className="md:w-4 md:h-4" />,
        classes: "bg-red-500/10 text-red-400 border-red-500/20",
        btnClass: "bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)] hover:shadow-[0_0_30px_rgba(239,68,68,0.6)]",
        cardBorder: "border-red-500/30 hover:border-red-500/60",
        glow: "from-red-500/20",
      };
    }
    return {
      label: "قيد",
      icon: <Clock size={14} className="md:w-4 md:h-4" />,
      classes: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      btnClass: "bg-gradient-to-r from-amber-400 to-yellow-600 text-slate-900 shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:shadow-[0_0_30px_rgba(245,158,11,0.6)]",
      cardBorder: "border-amber-500/30 hover:border-amber-500/60",
      glow: "from-amber-500/20",
    };
  };

  const filtered = pages.filter((p) => activeTab === "all" || p.status === activeTab);

  const counts = {
    all: pages.length,
    won: pages.filter(p => p.status === "won").length,
    lost: pages.filter(p => p.status === "lost").length,
    pending: pages.filter(p => p.status === "pending").length,
  };

  return (
    <div 
      className="min-h-screen relative overflow-hidden flex flex-col font-sans"
      style={{
        backgroundImage: "url('/stadium-bg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed"
      }}
    >
      <div className="absolute inset-0 bg-slate-950/60 z-0" />

      {/* هيدر متجاوب */}
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-slate-950/60 backdrop-blur-xl">
        <div className="container mx-auto px-3 md:px-4 h-16 md:h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-10 h-10 md:w-14 md:h-14 relative shrink-0">
              <img 
                src="/logo.png" 
                alt="Al Fares Robert" 
                className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(14,165,233,0.5)]"
              />
            </div>
            <span className="text-lg md:text-2xl font-bold font-heading text-white tracking-wide truncate">
              Al Fares <span className="text-sky-400">Robert</span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-2 text-sm text-sky-400 font-bold bg-sky-500/10 px-4 py-2 rounded-full border border-sky-500/20">
            <span>منصة البكجات الرياضية</span>
            <CheckCircle size={16} />
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-3 md:px-4 py-8 md:py-12 relative z-10">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 md:mb-16"
        >
          <h1 className="text-3xl md:text-7xl font-bold font-heading mb-3 md:mb-4 text-white drop-shadow-[0_5px_15px_rgba(14,165,233,0.3)]">
            البكجات <span className="text-sky-400">الرياضية</span>
          </h1>
          <p className="text-slate-300 text-sm md:text-xl max-w-2xl mx-auto">
            اختر البكج المناسب، واستمتع بمشاهدة رياضتك المفضلة
          </p>
        </motion.div>

        {/* التبويبات متجاوبة */}
        <div className="grid grid-cols-2 md:flex md:flex-wrap justify-center gap-2 md:gap-3 mb-8 md:mb-12">
          {[
            { key: "all", label: "الكل", count: counts.all, color: "from-sky-500 to-blue-600" },
            { key: "won", label: "رابح", count: counts.won, color: "from-emerald-500 to-teal-600" },
            { key: "lost", label: "خاسر", count: counts.lost, color: "from-red-500 to-rose-600" },
            { key: "pending", label: "قيد الاستخدام", count: counts.pending, color: "from-amber-400 to-yellow-500" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 md:px-8 py-2 md:py-3 rounded-full font-bold text-sm md:text-base transition-all duration-300 ${
                activeTab === tab.key
                  ? `bg-gradient-to-r ${tab.color} text-white shadow-[0_0_20px_rgba(14,165,233,0.3)] scale-[1.02] md:scale-105`
                  : "bg-slate-900/50 text-slate-300 border border-white/10 hover:bg-slate-800/80 hover:text-white"
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/50 rounded-3xl border border-white/10 backdrop-blur-md">
            <Trophy size={48} className="text-slate-600 mx-auto mb-4 md:w-16 md:h-16" />
            <p className="text-slate-400 text-base md:text-lg">لا توجد بكجات تطابق بحثك</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
            {filtered.map((page, idx) => {
              const config = getStatusConfig(page.status);
              return (
                <motion.div
                  key={page.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`relative rounded-2xl md:rounded-3xl overflow-hidden border ${config.cardBorder} bg-slate-950/80 backdrop-blur-md group transition-all duration-300 hover:scale-[1.02]`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${config.glow} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  
                  <div 
                    className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-500 mix-blend-luminosity"
                    style={{
                      backgroundImage: `url('/logo.png')`,
                      backgroundSize: "cover",
                      backgroundPosition: "center"
                    }}
                  />

                  <div className="relative p-4 md:p-8 z-10">
                    <div className="flex items-start justify-between mb-3 md:mb-4 gap-2">
                      <div className="flex-1">
                        <h3 className="text-lg md:text-2xl font-bold mb-1 md:mb-2 text-white truncate md:whitespace-normal">
                          {page.name}
                        </h3>
                        <p className="text-slate-300 text-xs md:text-sm line-clamp-2">
                          {page.description || "لا يوجد وصف"}
                        </p>
                      </div>
                      <div className={`px-2 md:px-4 py-1 md:py-1.5 rounded-full text-[10px] md:text-xs font-bold border flex items-center gap-1 shrink-0 backdrop-blur-md ${config.classes}`}>
                        {config.icon}
                        {config.label}
                      </div>
                    </div>

                    <div className="bg-black/50 rounded-xl md:rounded-2xl p-3 md:p-5 border border-white/10 mb-4 md:mb-8 backdrop-blur-md">
                      <div className="text-[10px] md:text-xs text-slate-400 mb-1 md:mb-2 text-right">الكود</div>
                      <div className="flex items-center justify-between">
                        <button 
                          onClick={() => handleCopy(page.code, page.id)}
                          className="text-slate-400 hover:text-white transition-colors"
                        >
                          {copiedId === page.id ? <Check size={16} className="text-sky-400 md:w-5 md:h-5"/> : <Copy size={16} className="md:w-5 md:h-5" />}
                        </button>
                        <div className="font-mono text-lg md:text-2xl font-bold text-white tracking-widest" dir="ltr">
                          {page.code}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleCopy(page.code, page.id)}
                      className={`w-full flex items-center justify-center gap-2 md:gap-3 py-3 md:py-4 rounded-xl md:rounded-2xl font-bold text-sm md:text-lg transition-all duration-300 ${config.btnClass}`}
                    >
                      {copiedId === page.id ? <Check size={18} className="md:w-5 md:h-5" /> : <Copy size={18} className="md:w-5 md:h-5" />}
                      {copiedId === page.id ? "تم النسخ بنجاح" : "نسخ الكود"}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}