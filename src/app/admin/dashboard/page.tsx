"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Trophy, LogOut, LayoutDashboard, Wrench } from "lucide-react";

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
    <div className="min-h-screen relative overflow-hidden p-4 flex flex-col items-center justify-center">
      <div className="absolute top-0 left-1/2 w-96 h-96 bg-sky-500/10 rounded-full blur-[120px] -z-10" />

      <div className="max-w-4xl w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-12 pt-8"
        >
          <div>
            <h1 className="text-4xl font-bold font-heading">لوحة الإدارة</h1>
            <p className="text-slate-400 mt-1">إدارة منصة Al Fares Robert</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-bold transition"
          >
            <LogOut size={18} />
            خروج
          </button>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  href={item.href}
                  className="block glass-card rounded-3xl p-8 hover:scale-[1.02] hover:border-sky-500/30 hover:shadow-[0_0_30px_rgba(14,165,233,0.1)] transition-all group"
                >
                  <div className={`w-16 h-16 rounded-2xl ${item.bg} border ${item.border} flex items-center justify-center mb-6`}>
                    <Icon size={32} className={item.color} />
                  </div>
                  <h3 className="text-2xl font-bold mb-2 group-hover:text-sky-400 transition">{item.label}</h3>
                  <p className="text-slate-500 text-sm">{item.desc}</p>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}