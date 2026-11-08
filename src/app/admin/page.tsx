"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, LogIn } from "lucide-react";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "كلمة السر غير صحيحة");
        setLoading(false);
        return;
      }

      // 👇 نحفظ جلسة المدير
      localStorage.setItem("admin_logged_in", "true");
      router.push("/admin/dashboard");
    } catch {
      setError("تعذر الاتصال بالخادم");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] -z-10" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="glass-panel rounded-3xl p-8 md:p-12 max-w-md w-full text-center relative z-10"
      >
        <div className="w-20 h-20 rounded-full bg-sky-500/20 border border-sky-500/30 flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(14,165,233,0.2)]">
          <Lock size={40} className="text-sky-400" />
        </div>
        
        <h1 className="text-3xl font-bold font-heading mb-2">لوحة الإدارة</h1>
        <p className="text-slate-400 text-sm mb-8">أدخل كلمة السر للدخول</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="كلمة السر"
              className="w-full px-4 py-4 rounded-xl bg-slate-950/50 border border-white/10 focus:border-sky-500 focus:outline-none text-white text-center transition"
              required
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-900 font-bold transition"
          >
            <LogIn size={20} />
            {loading ? "جاري الدخول..." : "دخول"}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/10">
          <Link href="/" className="text-sm text-slate-500 hover:text-sky-400 transition">
            ← العودة للموقع
          </Link>
        </div>
      </motion.div>
    </div>
  );
}