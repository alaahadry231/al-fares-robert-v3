import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET() {
  try {
    const data = await sql`
      select id, name, description, code, category, rate, matches_count, status, is_featured, image_url
      from sports_pages
      where is_archived = false
      order by is_featured desc, created_at desc
    `;
    return NextResponse.json({ data });
  } catch (error) {
    console.error("Fetch pages error:", error);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}