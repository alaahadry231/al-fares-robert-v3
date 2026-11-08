import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, visitor_id, page_id } = body;

    if (!visitor_id) {
      return NextResponse.json({ error: "No visitor" }, { status: 400 });
    }

    if (type === "visit") {
      // عشان ما نسجل أكثر من زيارة لنفس الزائر بنفس اليوم
      const existing = await sql`
        select id from site_visits 
        where visitor_id = ${visitor_id} 
        and created_at > now() - interval '24 hours'
        limit 1
      `;

      if (existing.length === 0) {
        await sql`insert into site_visits (visitor_id) values (${visitor_id})`;
      }
    } else if (type === "copy" && page_id) {
      await sql`insert into page_copies (page_id, visitor_id) values (${page_id}, ${visitor_id})`;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Track error:", error);
    return NextResponse.json({ error: "Track failed" }, { status: 500 });
  }
}