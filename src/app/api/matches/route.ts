import { NextResponse } from "next/server";

const API_KEY = process.env.FOOTBALL_DATA_API_KEY;
const API_BASE = "https://footballdata.io/api/v1";

export async function GET() {
  try {
    // 👇 نجيب تاريخ اليوم بصيغة YYYY-MM-DD
    const today = new Date().toISOString().split("T")[0];

    // 👇 نطلب مباريات اليوم
    const res = await fetch(`${API_BASE}/fixtures?date=${today}`, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
      next: { revalidate: 300 }, // نحدث البيانات كل 5 دقائق
    });

    const data = await res.json();

    if (!data.success || !data.data) {
      return NextResponse.json({ error: "فشل جلب المباريات" }, { status: 500 });
    }

    // 👇 نرتب البيانات عشان تكون بسيطة للواجهة
    const matches = data.data.map((match: any) => ({
      id: match.id,
      home_team: match.home_team?.name || "غير معروف",
      away_team: match.away_team?.name || "غير معروف",
      league: match.league?.name || "",
      kickoff: match.match_date || match.date || "",
      status: match.status || "",
    }));

    return NextResponse.json({ data: matches });
  } catch (error) {
    console.error("Fetch matches error:", error);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}