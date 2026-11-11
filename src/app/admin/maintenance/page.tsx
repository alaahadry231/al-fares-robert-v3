"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Wrench, CheckCircle, XCircle } from "lucide-react";

const availablePages = [
  { path: "/pages", label: "صفحة البكجات" },
  { path: "/octopus", label: "صفحة الأخطبوط" },
];

export default function MaintenancePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [maintenancePages, setMaintenancePages] = useState<string[]>([]);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("admin_logged_in");
    if (!isLoggedIn) {
      router.push("/admin");
      return;
    }

    const fetchData = async () => {
      try {
        const res = await fetch("/api/admin/maintenance");
        const data = await res.json();
        setMaintenancePages(data.pages || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [router]);

  const toggleMaintenance = async (path: string) => {
    const isActive = maintenancePages.includes(path);
    
    try {
      const res = await fetch("/api/admin/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path, isActive: !isActive }),
      });

      if (!res.ok) {
        alert("فشل التحديث");
        return;
      }

      const data = await res.json();
      setMaintenancePages(data.pages);
    } catch {
      alert("تعذر الاتصال بالخادم");
    }
  };

  if (loading) {
    return <div className="text-slate-500 text-center py-20">جاري التحميل...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold font-heading">وضع الصيانة</h1>
          <p className="text-slate-400 text-sm mt-1">تحكم بالصفحات اللي بدك تسكرها للصيانة</p>
        </div>
        <Link
          href="/admin/dashboard"
          className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold transition"
        >
          ← رجوع
        </Link>
      </motion.div>

      <div className="space-y-3 max-w-2xl">
        {availablePages.map((page, index) => {
          const isActive = maintenancePages.includes(page.path);
          return (
            <motion.div
              key={page.path}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-card rounded-2xl p-5 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <Wrench size={24} className={isActive ? "text-yellow-400" : "text-slate-500"} />
                <div>
                  <h3 className="font-bold text-lg">{page.label}</h3>
                  <p className="text-sm text-slate-500" dir="ltr">{page.path}</p>
                </div>
              </div>

              <button
                onClick={() => toggleMaintenance(page.path)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition ${
                  isActive
                    ? "bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20"
                    : "bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/20"
                }`}
              >
                {isActive ? <CheckCircle size={18} /> : <XCircle size={18} />}
                {isActive ? "مفتوح (إيقاف الصيانة)" : "قيد الصيانة (تفعيل)"}
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}