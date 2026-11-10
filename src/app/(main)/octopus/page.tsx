"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, TrendingUp, Target } from "lucide-react";

type Prediction = {
  win1: number;
  draw: number;
  win2: number;
  expected_goals: string;
  top_scores: { score: string; probability: number }[];
};

export default function OctopusPage() {
  const [team1, setTeam1] = useState("");
  const [team2, setTeam2] = useState("");
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [error, setError] = useState("");

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

  return (
    <div className="min-h-screen relative flex flex-col font-sans bg-slate-950">
      <div className="fixed inset-0 z-0 bg-cover bg-center" style={{ backgroundImage: "url('/stadium-bg.jpg')" }}>
        <div className="absolute inset-0 bg-slate-950/70" />
      </div>

      <main className="flex-1 container mx-auto px-3 md:px-4 py-8 md:py-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 md:mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-sm font-bold mb-4">
            <Sparkles size={16} />
            مدعوم بالذكاء الإحصائي
          </div>
          <h1 className="text-4xl md:text-6xl font-bold font-heading mb-4 text-white">
            🐙 أخطبوط <span className="text-sky-400">التوقعات</span>
          </h1>
          <p className="text-slate-300 text-sm md:text-lg max-w-2xl mx-auto">
            أدخل اسم الفريقين، وسيقوم الأخطبوط بتحليل المباراة وتوقع النتيجة وعدد الأهداف
          </p>
        </motion.div>

        <div className="max-w-2xl mx-auto">
          <form onSubmit={handlePredict} className="glass-panel rounded-3xl p-6 md:p-8 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm text-slate-400 mb-2">الفريق الأول</label>
                <input
                  type="text"
                  value={team1}
                  onChange={(e) => setTeam1(e.target.value)}
                  placeholder="ريال مدريد"
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
                  placeholder="برشلونة"
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
              {/* احتمالات الفوز */}
              <div className="glass-card rounded-3xl p-6">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <TrendingUp size={18} className="text-sky-400" />
                  احتمالات المباراة
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                    <span className="text-white font-bold">{team1}</span>
                    <span className="text-emerald-400 font-bold text-xl">{prediction.win1}%</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-500/10 rounded-xl border border-slate-500/20">
                    <span className="text-white font-bold">تعادل</span>
                    <span className="text-slate-300 font-bold text-xl">{prediction.draw}%</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-red-500/10 rounded-xl border border-red-500/20">
                    <span className="text-white font-bold">{team2}</span>
                    <span className="text-red-400 font-bold text-xl">{prediction.win2}%</span>
                  </div>
                </div>
              </div>

              {/* الأهداف المتوقعة */}
              <div className="glass-card rounded-3xl p-6 text-center">
                <h2 className="text-lg font-bold mb-2 flex items-center justify-center gap-2">
                  <Target size={18} className="text-yellow-400" />
                  عدد الأهداف المتوقع
                </h2>
                <div className="text-5xl font-bold text-yellow-400">
                  {prediction.expected_goals}
                </div>
                <p className="text-slate-400 text-sm mt-2">هدف</p>
              </div>

              {/* أفضل النتائج */}
              <div className="glass-card rounded-3xl p-6">
                <h2 className="text-lg font-bold mb-4">أكثر النتائج ترجيحاً</h2>
                <div className="space-y-2">
                  {prediction.top_scores.map((score, i) => (
                    <div
                      key={i}
                      className={`flex items-center justify-between p-3 rounded-xl ${
                        i === 0 ? "bg-sky-500/20 border border-sky-500/30" : "bg-slate-950/50 border border-white/5"
                      }`}
                    >
                      <span className="font-mono font-bold text-white text-lg">{score.score}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-sky-500 rounded-full"
                            style={{ width: `${score.probability * 3}%` }}
                          ></div>
                        </div>
                        <span className="text-sky-400 font-bold text-sm w-10 text-left">{score.probability}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}