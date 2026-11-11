"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, TrendingUp, Target, ChevronDown } from "lucide-react";
import Link from "next/link";

type Prediction = {
  team1_ar: string;
  team2_ar: string;
  match_date: string;
  match_time: string;
  analysis: string;
  win1: number;
  draw: number;
  win2: number;
  expected_goals: string;
  top_scores: { score: string; probability: number }[];
};

type Match = {
  id: number;
  home_team: string;
  away_team: string;
  league: string;
  kickoff: string;
};

export default function OctopusPage() {
  const [team1, setTeam1] = useState("");
  const [team2, setTeam2] = useState("");
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [error, setError] = useState("");

  const [todayMatches, setTodayMatches] = useState<Match[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(true);
  const [selectedMatchId, setSelectedMatchId] = useState<string>("");

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const res = await fetch("/api/matches");
        const data = await res.json();
        setTodayMatches(data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingMatches(false);
      }
    };
    fetchMatches();
  }, []);

  const handleSelectMatch = (matchId: string) => {
    setSelectedMatchId(matchId);
    if (!matchId) {
      setTeam1("");
      setTeam2("");
      return;
    }
    const match = todayMatches.find((m) => m.id.toString() === matchId);
    if (match) {
      setTeam1(match.home_team);
      setTeam2(match.away_team);
    }
  };

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setPrediction(null);

    try {
      const res = await fetch("/api/octopus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ team1, team2 }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "فشل التحليل");
        return;
      }

      setPrediction(data.prediction);
    } catch {
      setError("تعذر الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  };

  const formatKickoff = (iso: string) => {
    if (!iso) return "";
    try {
      return new Date(iso).toLocaleTimeString("ar-SY", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col font-sans bg-slate-950">
      <div className="fixed inset-0 z-0 bg-cover bg-center" style={{ backgroundImage: "url('/stadium-bg.jpg')" }}>
        <div className="absolute inset-0 bg-slate-950/70" />
      </div>

      {/* 👇 الهيدر المشترك */}
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-slate-950/80 backdrop-blur-sm">
        <div className="container mx-auto px-3 md:px-4 h-16 md:h-20 flex items-center justify-between">
          <Link href="/pages" className="flex items-center gap-2 md:gap-3">
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
          </Link>
          
          <div className="flex items-center gap-3">
            <Link
              href="/pages"
              className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-full bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/20 text-sky-400 font-bold text-sm md:text-base transition"
            >
              🏆 البكجات
            </Link>
            <Link
              href="/octopus"
              className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-full bg-sky-500 text-slate-900 font-bold text-sm md:text-base transition"
            >
              🐙 الأخطبوط
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-3 md:px-4 py-8 md:py-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 md:mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-sm font-bold mb-4">
            <Sparkles size={16} />
            مدعوم بالذكاء الاصطناعي
          </div>
          <h1 className="text-4xl md:text-6xl font-bold font-heading mb-4 text-white">
            🐙 أخطبوط <span className="text-sky-400">التوقعات</span>
          </h1>
          <p className="text-slate-300 text-sm md:text-lg max-w-2xl mx-auto">
            اختر مباراة من مباريات اليوم، أو اكتب أسماء الفرق يدوياً
          </p>
        </motion.div>

        <div className="max-w-2xl mx-auto">
          <form onSubmit={handlePredict} className="glass-panel rounded-3xl p-6 md:p-8 mb-8">
            
            {/* قائمة مباريات اليوم */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm text-slate-400">
                  اختر مباراة من مباريات اليوم (اختياري)
                </label>
                {selectedMatchId && (
                  <button
                    type="button"
                    onClick={() => handleSelectMatch("")}
                    className="text-xs text-red-400 hover:text-red-300 transition"
                  >
                    مسح الاختيار
                  </button>
                )}
              </div>
              {loadingMatches ? (
                <div className="text-slate-500 text-sm">جاري تحميل المباريات...</div>
              ) : todayMatches.length === 0 ? (
                <div className="text-slate-500 text-sm">لا توجد مباريات اليوم (يمكنك الكتابة يدوياً بالأسفل)</div>
              ) : (
                <div className="relative">
                  <select
                    value={selectedMatchId}
                    onChange={(e) => handleSelectMatch(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950/50 border border-white/10 focus:border-sky-500 focus:outline-none text-white transition appearance-none"
                  >
                    <option value="">-- اختر مباراة --</option>
                    {todayMatches.map((match) => (
                      <option key={match.id} value={match.id}>
                        {match.home_team} vs {match.away_team} ({formatKickoff(match.kickoff)})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm text-slate-400 mb-2">الفريق الأول</label>
                <input
                  type="text"
                  value={team1}
                  onChange={(e) => setTeam1(e.target.value)}
                  placeholder="France"
                  className="w-full px-4 py-3 rounded-xl bg-slate-950/50 border border-white/10 focus:border-sky-500 focus:outline-none text-white transition"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">الفريق الثاني</label>
                <input
                  type="text"
                  value={team2}
                  onChange={(e) => setTeam2(e.target.value)}
                  placeholder="Italy"
                  className="w-full px-4 py-3 rounded-xl bg-slate-950/50 border border-white/10 focus:border-sky-500 focus:outline-none text-white transition"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center mb-4">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-lg transition-all shadow-[0_0_30px_-5px_rgba(14,165,233,0.5)] disabled:opacity-50"
            >
              <Sparkles size={20} />
              {loading ? "جاري التحليل..." : "حلّل المباراة"}
            </button>
          </form>

          {prediction && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* نص التحليل */}
              {prediction.analysis && (
                <div className="glass-card rounded-3xl p-6 border-l-4 border-sky-500">
                  <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
                    <span className="text-sky-400">🤖</span> تحليل الأخطبوط
                  </h2>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    {prediction.analysis}
                  </p>
                </div>
              )}

              {/* احتمالات الفوز */}
              <div className="glass-card rounded-3xl p-6">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <TrendingUp size={18} className="text-sky-400" />
                  احتمالات المباراة
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                    <span className="text-white font-bold">{prediction.team1_ar}</span>
                    <span className="text-emerald-400 font-bold text-xl">{prediction.win1}%</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-500/10 rounded-xl border border-slate-500/20">
                    <span className="text-white font-bold">تعادل</span>
                    <span className="text-slate-300 font-bold text-xl">{prediction.draw}%</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-red-500/10 rounded-xl border border-red-500/20">
                    <span className="text-white font-bold">{prediction.team2_ar}</span>
                    <span className="text-red-400 font-bold text-xl">{prediction.win2}%</span>
                  </div>
                </div>
              </div>

              {/* عدد الأهداف المتوقع */}
              <div className="glass-card rounded-3xl p-6 text-center">
                <h2 className="text-lg font-bold mb-2 flex items-center justify-center gap-2">
                  <Target size={18} className="text-yellow-400" />
                  عدد الأهداف المتوقع
                </h2>
                <div className="text-5xl font-bold text-yellow-400">
                  {Math.ceil(parseFloat(prediction.expected_goals))}
                </div>
                <p className="text-slate-400 text-sm mt-2">هدف</p>
              </div>

              {/* أفضل النتائج */}
              <div className="glass-card rounded-3xl p-6">
                <h2 className="text-lg font-bold mb-4">أكثر النتائج ترجيحاً</h2>
                <div className="space-y-2">
                  {prediction.top_scores.map((score, i) => {
                    const [s1, s2] = score.score.split("-").map(s => s.trim());
                    return (
                      <div
                        key={i}
                        className={`flex items-center justify-between p-3 rounded-xl ${
                          i === 0 ? "bg-sky-500/20 border border-sky-500/30" : "bg-slate-950/50 border border-white/5"
                        }`}
                      >
                        <div className="flex items-center gap-2 font-bold text-white text-sm md:text-base">
                          <span>{prediction.team1_ar}</span>
                          <span className="text-sky-400 text-lg px-1">{s1}</span>
                        </div>
                        
                        <span className="text-slate-500 text-xs">-</span>
                        
                        <div className="flex items-center gap-2 font-bold text-white text-sm md:text-base">
                          <span className="text-sky-400 text-lg px-1">{s2}</span>
                          <span>{prediction.team2_ar}</span>
                        </div>

                        <div className="flex items-center gap-2 mr-4">
                          <div className="w-16 md:w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-sky-500 rounded-full"
                              style={{ width: `${score.probability * 3}%` }}
                            ></div>
                          </div>
                          <span className="text-sky-400 font-bold text-sm w-8 text-left">{score.probability}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}