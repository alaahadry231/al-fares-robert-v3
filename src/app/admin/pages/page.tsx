"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { Plus, Edit, Trash2, Star, Archive, CheckCircle, XCircle, Clock } from "lucide-react";

type SportsPage = {
  id: number;
  name: string;
  description: string;
  code: string;
  category: string;
  rate: string;
  matches_count: number;
  status: string;
  is_featured: boolean;
  is_archived: boolean;
};

const emptyForm = {
  name: "",
  description: "",
  code: "",
  category: "عام",
  rate: "×1",
  matches_count: 0,
};

export default function AdminPages() {
  const router = useRouter();
  const [pages, setPages] = useState<SportsPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchPages = async () => {
    try {
      const res = await fetch("/api/admin/pages");
      const json = await res.json();
      setPages(json.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("admin_logged_in");
    if (!isLoggedIn) {
      router.push("/admin");
      return;
    }
    fetchPages();
  }, [router]);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setShowModal(true);
  };

  const openEdit = (page: SportsPage) => {
    setEditingId(page.id);
    setForm({
      name: page.name,
      description: page.description,
      code: page.code,
      category: page.category,
      rate: page.rate,
      matches_count: page.matches_count,
    });
    setError("");
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const url = editingId ? `/api/admin/pages/${editingId}` : "/api/admin/pages";
    const method = editingId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "حدث خطأ");
        setSaving(false);
        return;
      }

      setShowModal(false);
      setForm(emptyForm);
      setEditingId(null);
      await fetchPages();
    } catch {
      setError("تعذر الاتصال بالخادم");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`هل أنت متأكد من حذف "${name}"؟`)) return;
    try {
      const res = await fetch(`/api/admin/pages/${id}`, { method: "DELETE" });
      if (!res.ok) {
        alert("فشل الحذف");
        return;
      }
      await fetchPages();
    } catch {
      alert("تعذر الاتصال بالخادم");
    }
  };

  const handleAction = async (id: number, action: string, value?: string) => {
    try {
      const body: any = { action };
      if (value) body.status = value;

      const res = await fetch(`/api/admin/pages/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        alert("فشل التحديث");
        return;
      }

      await fetchPages();
    } catch {
      alert("تعذر الاتصال بالخادم");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "won":
        return <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 text-xs font-bold border border-green-500/20">✅ رابح</span>;
      case "lost":
        return <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 text-xs font-bold border border-red-500/20">❌ خاسر</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 text-xs font-bold border border-yellow-500/20">⏳ معلق</span>;
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
          <h1 className="text-3xl font-bold font-heading">إدارة البكجات</h1>
          <p className="text-slate-400 text-sm mt-1">إدارة جميع البكجات الرياضية</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/dashboard"
            className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold transition"
          >
            ← رجوع
          </Link>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-900 font-bold transition shadow-[0_0_20px_-5px_rgba(14,165,233,0.5)]"
          >
            <Plus size={18} />
            إضافة بكج
          </button>
        </div>
      </motion.div>

      {pages.length === 0 ? (
        <div className="text-center py-20 glass-panel rounded-3xl">
          <p className="text-slate-500 text-lg">لا توجد بكجات بعد</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pages.map((page, index) => (
            <motion.div
              key={page.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`glass-card rounded-2xl p-5 ${page.is_archived ? "opacity-60" : ""}`}
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <h3 className="font-bold text-lg">{page.name}</h3>
                    {page.is_featured && <span className="text-xs text-yellow-400">⭐ مميز</span>}
                    {page.is_archived && <span className="text-xs text-slate-500">📦 مؤرشف</span>}
                  </div>
                  <p className="text-slate-400 text-sm mb-2">{page.description}</p>
                  <div className="flex items-center gap-3 flex-wrap text-xs">
                    <span className="text-sky-400 font-mono" dir="ltr">{page.code}</span>
                    <span className="text-slate-500">⚽ {page.matches_count} مباراة</span>
                    <span className="text-slate-500">{page.category}</span>
                    <span className="text-slate-500">{page.rate}</span>
                    {getStatusBadge(page.status)}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => openEdit(page)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs border border-white/10 transition"
                >
                  <Edit size={14} /> تعديل
                </button>
                <button
                  onClick={() => handleAction(page.id, "change_status", page.status === "won" ? "lost" : page.status === "lost" ? "pending" : "won")}
                  className="px-3 py-1.5 rounded-lg bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 text-xs border border-yellow-500/20 transition"
                >
                  تغيير الحالة
                </button>
                <button
                  onClick={() => handleAction(page.id, "toggle_featured")}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 text-xs border border-yellow-500/20 transition"
                >
                  <Star size={14} /> {page.is_featured ? "إلغاء التمييز" : "تمييز"}
                </button>
                <button
                  onClick={() => handleAction(page.id, "toggle_archive")}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-500/10 hover:bg-slate-500/20 text-slate-300 text-xs border border-slate-500/20 transition"
                >
                  <Archive size={14} /> {page.is_archived ? "استعادة" : "أرشفة"}
                </button>
                <button
                  onClick={() => handleDelete(page.id, page.name)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs border border-red-500/20 transition"
                >
                  <Trash2 size={14} /> حذف
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="glass-panel rounded-2xl w-full max-w-lg my-8">
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <h3 className="text-xl font-bold">{editingId ? "تعديل بكج" : "إضافة بكج جديد"}</h3>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white transition">✕</button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4">
              {error && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}

              <div>
                <label className="block text-sm text-slate-400 mb-2">الاسم *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950/50 border border-white/10 focus:border-sky-500 focus:outline-none text-white transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">الوصف</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950/50 border border-white/10 focus:border-sky-500 focus:outline-none text-white transition"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">الكود *</label>
                <input
                  type="text"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950/50 border border-white/10 focus:border-sky-500 focus:outline-none text-white font-mono transition"
                  required
                  dir="ltr"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">التصنيف</label>
                  <input
                    type="text"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950/50 border border-white/10 focus:border-sky-500 focus:outline-none text-white transition"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">الريت</label>
                  <input
                    type="text"
                    value={form.rate}
                    onChange={(e) => setForm({ ...form, rate: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950/50 border border-white/10 focus:border-sky-500 focus:outline-none text-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">عدد المباريات</label>
                <input
                  type="number"
                  value={form.matches_count}
                  onChange={(e) => setForm({ ...form, matches_count: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950/50 border border-white/10 focus:border-sky-500 focus:outline-none text-white transition"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-900 font-bold transition"
                >
                  {saving ? "جاري الحفظ..." : editingId ? "حفظ التعديلات" : "إضافة البكج"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white transition"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}