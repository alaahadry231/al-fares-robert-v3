"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Trophy, LogOut, Users, Copy, Eye, BarChart3, Wrench } from "lucide-react";

type Analytics = {
  visitors: { unique: number; total_visits: number };
  copies: number;
  top_pages: { name: string; copy_count: number }[];
  total_pages: number;
};

export default function AdminDashboard() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("admin_logged_in");
    if (!isLoggedIn) {
      router.push("/admin");
      return;
    }

    const fetchAnalytics = async () => {
      try {
        const res = await fetch("/api/admin/analytics");
        const json = await res.json();
        if (!json.error) setAnalytics(json);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingStats(false);
        setIsChecking(false);
      }
    };

    fetchAnalytics();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("admin_logged_in");
    router.push("/admin");
  };

  if (isChecking) {
    return <div className="text-slate-500 text-center py-20">جاري التحقق...</div>;
  }

  const menuItems = [
    { 
      href: "/admin/pages", 
      label: "إدارة البكجات", 
      desc: "إضافة، تعديل، وحذف البكجات",
      icon: Trophy, 
      color: "text-sky-400", 
      bg: "bg-sky-500/10", 
      border: "border-sky-500/20" 
    },
    { 
      href: "/admin/maintenance", 
      label: "وضع الصيانة", 
      desc: "التحكم بإغلاق الصفحات للصيانة",
      icon: Wrench, 
      color: "text-yellow-400", 
      bg: "bg-yellow-500/10", 
      border: "border-yellow-500/20" 
    },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden p-4">
      <div className="absolute top-0 left-1/2 w-96 h-96 bg-sky-500/10 rounded-full blur-[120px] -z-10" />

      <div className="max-w-6xl mx-auto">
        {/* الهيدر */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-12 pt-8"
        >
          <div>
            <h1 className="text-4xl font-bold font-heading">لوحة الإدارة</h1>
            <p className="text-slate-400 mt-1">إدارة موقع Al Fares Robert</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-bold transition"
          >
            <LogOut size={18} />
            خروج
          </button>
        </motion.div>

        {/* الإحصائيات */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        >
          <div className="glass-card rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
                <Users size={24} className="text-sky-400" />
              </div>
              <div className="text-sm text-slate-400">زوار فريدين</div>
            </div>
            <div className="text-4xl font-bold text-sky-400">
              {loadingStats ? "..." : analytics?.visitors.unique.toLocaleString("en-US")}
            </div>
          </div>

          <div className="glass-card rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                <Eye size={24} className="text-purple-400" />
              </div>
              <div className="text-sm text-slate-400">إجمالي الزيارات</div>
            </div>
            <div className="text-4xl font-bold text-purple-400">
              {loadingStats ? "..." : analytics?.visitors.total_visits.toLocaleString("en-US")}
            </div>
          </div>

          <div className="glass-card rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Copy size={24} className="text-emerald-400" />
              </div>
              <div className="text-sm text-slate-400">مرات نسخ الأكواد</div>
            </div>
            <div className="text-4xl font-bold text-emerald-400">
              {loadingStats ? "..." : analytics?.copies.toLocaleString("en-US")}
            </div>
          </div>

          <div className="glass-card rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
                <Trophy size={24} className="text-yellow-400" />
              </div>
              <div className="text-sm text-slate-400">عدد البكجات</div>
            </div>
            <div className="text-4xl font-bold text-yellow-400">
              {loadingStats ? "..." : analytics?.total_pages.toLocaleString("en-US")}
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* أكثر البكجات نسخاً */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-panel rounded-3xl p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <BarChart3 size={20} className="text-emerald-400" />
              </div>
              <h2 className="text-xl font-bold">أكثر 5 بكجات تم نسخها</h2>
            </div>

            {loadingStats ? (
              <div className="text-slate-500 text-center py-8">جاري التحميل...</div>
            ) : analytics?.top_pages.length === 0 ? (
              <div className="text-slate-500 text-center py-8">لا توجد بيانات بعد</div>
            ) : (
              <div className="space-y-3">
                {analytics?.top_pages.map((page, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-3 bg-slate-950/50 rounded-xl border border-white/5"
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                      index === 0 ? "bg-yellow-500 text-slate-900" :
                      index === 1 ? "bg-slate-400 text-slate-900" :
                      index === 2 ? "bg-orange-600 text-white" :
                      "bg-slate-800 text-slate-300"
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1 font-bold truncate">{page.name}</div>
                    <div className="text-emerald-400 font-bold text-sm">
                      {page.copy_count} <span className="text-xs text-slate-500">نسخة</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* روابط الإدارة */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 gap-4"
          >
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block glass-card rounded-3xl p-6 hover:scale-[1.02] transition-all group flex items-center gap-4"
                >
                  <div className={`w-16 h-16 rounded-2xl ${item.bg} border ${item.border} flex items-center justify-center shrink-0`}>
                    <Icon size={32} className={item.color} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-1 group-hover:text-sky-400 transition">{item.label}</h3>
                    <p className="text-slate-500 text-sm">{item.desc}</p>
                  </div>
                </Link>
              );
            })}
          </motion.div>
        </div>
      </div>
    </div>
  );
}