import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET() {
  try {
    // 1. إجمالي الزوار الفريدين
    const uniqueVisitors = await sql`
      select count(distinct visitor_id)::int as count from site_visits
    `;

    // 2. إجمالي الزيارات
    const totalVisits = await sql`
      select count(*)::int as count from site_visits
    `;

    // 3. إجمالي نقرات النسخ
    const totalCopies = await sql`
      select count(*)::int as count from page_copies
    `;

    // 4. أكثر 5 بكجات تم نسخ كودها
    const topCopiedPages = await sql`
      select 
        sp.name,
        count(pc.id)::int as copy_count
      from sports_pages sp
      left join page_copies pc on sp.id = pc.page_id
      group by sp.id, sp.name
      order by copy_count desc
      limit 5
    `;

    // 5. عدد البكجات
    const totalPages = await sql`
      select count(*)::int as count from sports_pages
    `;

    return NextResponse.json({
      visitors: {
        unique: uniqueVisitors[0].count,
        total_visits: totalVisits[0].count,
      },
      copies: totalCopies[0].count,
      top_pages: topCopiedPages,
      total_pages: totalPages[0].count,
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}