"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Trophy, LogOut, LayoutDashboard } from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("admin_logged_in");
    if (!isLoggedIn) {
      router.push("/admin");
    } else {
      setIsChecking(false);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("admin_logged_in");
    router.push("/admin");
  };

  if (isChecking) {
    return <div className="text-slate-500 text-center py-20">جاري التحقق...</div>;
  }

  return (
    <div className="min-h-screen relative overflow-hidden p-4 flex items-center justify-center">
      <div className="absolute top-0 left-1/2 w-96 h-96 bg-sky-500/10 rounded-full blur-[120px] -z-10" />

      <div className="max-w-lg w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-sky-500/20 border border-sky-500/30 mb-6">
            <LayoutDashboard size={40} className="text-sky-400" />
          </div>
          <h1 className="text-4xl font-bold font-heading mb-2">لوحة الإدارة</h1>
          <p className="text-slate-400">إدارة منصة Al Fares Robert</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Link
            href="/admin/pages"
            className="block glass-card rounded-3xl p-8 hover:scale-[1.02] hover:border-sky-500/30 hover:shadow-[0_0_30px_rgba(14,165,233,0.1)] transition-all group text-center"
          >
            <div className="w-20 h-20 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
              <Trophy size={40} className="text-sky-400" />
            </div>
            <h3 className="text-2xl font-bold mb-2 group-hover:text-sky-400 transition">إدارة البكجات</h3>
            <p className="text-slate-500 text-sm">إضافة، تعديل، وحذف البكجات</p>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 text-center"
        >
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-bold transition"
          >
            <LogOut size={18} />
            تسجيل الخروج
          </button>
        </motion.div>
      </div>
    </div>
  );
}