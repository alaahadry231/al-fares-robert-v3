import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const path = searchParams.get("path");

    if (!path) {
      return NextResponse.json({ isUnderMaintenance: false });
    }

    const result = await sql`select * from site_settings where setting_key = 'maintenance_pages'`;
    const pages: string[] = result[0]?.setting_value ? JSON.parse(result[0].setting_value) : [];

    return NextResponse.json({ 
      isUnderMaintenance: pages.includes(path) 
    });
  } catch (error) {
    console.error("Check maintenance error:", error);
    return NextResponse.json({ isUnderMaintenance: false });
  }
}