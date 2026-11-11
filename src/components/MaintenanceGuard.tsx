"use client";

import { useEffect, useState } from "react";
import { Wrench } from "lucide-react";

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
      <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
        <div className="glass-panel rounded-3xl p-8 md:p-12 max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center mx-auto mb-6">
            <Wrench size={40} className="text-yellow-400" />
          </div>
          <h1 className="text-3xl font-bold font-heading mb-3">قيد الصيانة</h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            نعمل حالياً على تحسين هذه الصفحة لتقديم تجربة أفضل لك. 
            يرجى العودة لاحقاً.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}