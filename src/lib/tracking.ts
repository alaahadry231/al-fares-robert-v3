// 👇 الحصول على معرف الزائر (أو إنشاء واحد جديد)
export function getVisitorId(): string {
  if (typeof window === "undefined") return "";

  let id = localStorage.getItem("visitor_id");
  if (!id) {
    id = `v_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem("visitor_id", id);
  }
  return id;
}

// 👇 تسجيل زيارة
export async function trackVisit() {
  try {
    await fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "visit",
        visitor_id: getVisitorId(),
      }),
      keepalive: true,
    });
  } catch {
    // نتجاهل
  }
}

// 👇 تسجيل نسخ كود
export async function trackCopy(pageId: number) {
  try {
    await fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "copy",
        page_id: pageId,
        visitor_id: getVisitorId(),
      }),
      keepalive: true,
    });
  } catch {
    // نتجاهل
  }
}