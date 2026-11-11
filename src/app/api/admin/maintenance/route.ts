import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

// GET: جلب الصفحات اللي قيد الصيانة
export async function GET() {
  try {
    const result = await sql`select * from site_settings where setting_key = 'maintenance_pages'`;
    const pages = result[0]?.setting_value ? JSON.parse(result[0].setting_value) : [];
    return NextResponse.json({ pages });
  } catch (error) {
    console.error("Fetch maintenance error:", error);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}

// POST: تحديث حالة الصيانة لصفحة
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { path, isActive } = body;

    if (!path) {
      return NextResponse.json({ error: "المسار مطلوب" }, { status: 400 });
    }

    // 1. نجيب القائمة الحالية
    const result = await sql`select * from site_settings where setting_key = 'maintenance_pages'`;
    let pages: string[] = result[0]?.setting_value ? JSON.parse(result[0].setting_value) : [];

    // 2. نضيف أو نشيل الصفحة
    if (isActive) {
      if (!pages.includes(path)) pages.push(path);
    } else {
      pages = pages.filter((p) => p !== path);
    }

    // 3. نحفظ
    await sql`
      update site_settings 
      set setting_value = ${JSON.stringify(pages)}, updated_at = now()
      where setting_key = 'maintenance_pages'
    `;

    return NextResponse.json({ success: true, pages });
  } catch (error) {
    console.error("Update maintenance error:", error);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}