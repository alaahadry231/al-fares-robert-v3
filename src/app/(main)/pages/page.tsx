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
        icon: <CheckCircle size={16} />,
        classes: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        btnClass: "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_30px_rgba(16,185,129,0.6)]",
        cardBorder: "border-emerald-500/30 hover:border-emerald-500/60",
        glow: "from-emerald-500/20",
      };
    }
    if (status === "lost") {
      return {
        label: "خاسر",
        icon: <XCircle size={16} />,
        classes: "bg-red-500/10 text-red-400 border-red-500/20",
        btnClass: "bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)] hover:shadow-[0_0_30px_rgba(239,68,68,0.6)]",
        cardBorder: "border-red-500/30 hover:border-red-500/60",
        glow: "from-red-500/20",
      };
    }
    // pending
    return {
      label: "قيد",
      icon: <Clock size={16} />,
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
        backgroundImage: "url('/stadium-bg.jpg')", // صورة الملعب الجديدة (الليلية)
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed"
      }}
    >
      {/* طبقة سوداء شفافة عشان النص يبان */}
      <div className="absolute inset-0 bg-slate-950/60 z-0" />

      {/* هيدر */}
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-slate-950/60 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 relative">
              <img 
                src="/logo.png" 
                alt="Al Fares Robert" 
                className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(14,165,233,0.5)]"
              />
            </div>
            <span className="text-2xl font-bold font-heading text-white tracking-wide">
              Al Fares <span className="text-sky-400">Robert</span>
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-sky-400 font-bold bg-sky-500/10 px-4 py-2 rounded-full border border-sky-500/20">
            <span>منصة البكجات الرياضية</span>
            <CheckCircle size={16} />
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-12 relative z-10">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-7xl font-bold font-heading mb-4 text-white drop-shadow-[0_5px_15px_rgba(14,165,233,0.3)]">
            البكجات <span className="text-sky-400">الرياضية</span>
          </h1>
          <p className="text-slate-300 text-lg md:text-xl max-w-2xl mx-auto">
            اختر البكج المناسب، واستمتع بمشاهدة رياضتك المفضلة
          </p>
        </motion.div>

        {/* التبويبات */}
        <div className="flex justify-center gap-3 mb-12 flex-wrap">
          {[
            { key: "all", label: "الكل", count: counts.all, color: "from-sky-500 to-blue-600" },
            { key: "won", label: "رابح", count: counts.won, color: "from-emerald-500 to-teal-600" },
            { key: "lost", label: "خاسر", count: counts.lost, color: "from-red-500 to-rose-600" },
            { key: "pending", label: "قيد الاستخدام", count: counts.pending, color: "from-amber-400 to-yellow-500" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-8 py-3 rounded-full font-bold transition-all duration-300 ${
                activeTab === tab.key
                  ? `bg-gradient-to-r ${tab.color} text-white shadow-[0_0_20px_rgba(14,165,233,0.3)] scale-105`
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
            <Trophy size={64} className="text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">لا توجد بكجات تطابق بحثك</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((page, idx) => {
              const config = getStatusConfig(page.status);
              return (
                <motion.div
                  key={page.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`relative rounded-3xl overflow-hidden border ${config.cardBorder} bg-slate-950/80 backdrop-blur-md group transition-all duration-300 hover:scale-[1.02]`}
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

                  <div className="relative p-8 z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold mb-2 text-white">
                          {page.name}
                        </h3>
                        <p className="text-slate-300 text-sm">
                          {page.description || "لا يوجد وصف"}
                        </p>
                      </div>
                      <div className={`px-4 py-1.5 rounded-full text-xs font-bold border flex items-center gap-1.5 shrink-0 backdrop-blur-md ${config.classes}`}>
                        {config.icon}
                        {config.label}
                      </div>
                    </div>

                    <div className="bg-black/50 rounded-2xl p-5 border border-white/10 mb-8 backdrop-blur-md">
                      <div className="text-xs text-slate-400 mb-2 text-right">الكود</div>
                      <div className="flex items-center justify-between">
                        <button 
                          onClick={() => handleCopy(page.code, page.id)}
                          className="text-slate-400 hover:text-white transition-colors"
                        >
                          {copiedId === page.id ? <Check size={20} className="text-sky-400"/> : <Copy size={20} />}
                        </button>
                        <div className="font-mono text-2xl font-bold text-white tracking-widest" dir="ltr">
                          {page.code}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleCopy(page.code, page.id)}
                      className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-bold text-lg transition-all duration-300 ${config.btnClass}`}
                    >
                      {copiedId === page.id ? <Check size={22} /> : <Copy size={22} />}
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