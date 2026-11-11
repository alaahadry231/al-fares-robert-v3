"use client";

import { useEffect, useState } from "react";
import { Wrench, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function MaintenanceGuard({ 
  path, 
  children 
}: { 
  path: string; 
  children: React.ReactNode;
}) {
  const [isUnderMaintenance, setIsUnderMaintenance] = useState<boolean | null>(null);

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch(`/api/maintenance?path=${encodeURIComponent(path)}`);
        const data = await res.json();
        setIsUnderMaintenance(data.isUnderMaintenance);
      } catch {
        setIsUnderMaintenance(false);
      }
    };
    check();
  }, [path]);

  if (isUnderMaintenance === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  if (isUnderMaintenance) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 relative overflow-hidden">
        {/* خلفية */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center opacity-20" 
          style={{ backgroundImage: "url('/stadium-bg.jpg')" }}
        />
        
        <div className="glass-panel rounded-3xl p-8 md:p-12 max-w-md w-full text-center relative z-10 shadow-2xl">
          <div className="w-24 h-24 rounded-full bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center mx-auto mb-8 shadow-[0_0_30px_rgba(234,179,8,0.2)]">
            <Wrench size={48} className="text-yellow-400" />
          </div>
          
          <h1 className="text-3xl font-bold font-heading mb-4 text-white">قيد الصيانة</h1>
          
          <p className="text-slate-300 text-sm leading-relaxed mb-8">
            نعمل حالياً على تحسين هذه الصفحة لتقديم تجربة أفضل لك. 
            يرجى العودة لاحقاً، أو تصفح البكجات المتاحة الآن.
          </p>

          {/* 👇 زر العودة */}
          <Link
            href="/pages"
            className="inline-flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-lg transition-all shadow-[0_0_20px_-5px_rgba(14,165,233,0.5)]"
          >
            <ArrowRight size={20} />
            العودة إلى البكجات
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}