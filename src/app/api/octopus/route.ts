import { NextRequest, NextResponse } from "next/server";

const API_KEY = process.env.API_FOOTBALL_KEY;
const API_BASE = "https://v3.football.api-sports.io";

// دالة مساعدة لإرسال الطلبات
async function fetchAPI(endpoint: string) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      "x-apisports-key": API_KEY!,
    },
    next: { revalidate: 3600 }, 
  });
  return res.json();
}

// 1. البحث عن ID الفريق بالاسم
async function getTeamId(teamName: string): Promise<number | null> {
  try {
    const data = await fetchAPI(`/teams?search=${encodeURIComponent(teamName)}`);
    
    if (data.response && data.response.length > 0) {
      const searchLower = teamName.toLowerCase();
      
      // نبحث عن تطابق شبه كامل
      const exactMatch = data.response.find((item: any) => 
        item.team.name.toLowerCase() === searchLower
      );
      
      if (exactMatch) return exactMatch.team.id;

      // إذا ما لقينا تطابق كامل، نرجع أول نتيجة
      return data.response[0].team.id;
    }
    return null;
  } catch (error) {
    console.error("getTeamId error:", error);
    return null;
  }
}

// 2. جلب إحصائيات الفريق الحقيقية
async function getTeamStats(teamId: number) {
  try {
    // نجيب آخر 20 مباراة للفريق في الموسم (2024)
    // ملاحظة: ممكن نغير الموسم حسب الحاجة (2023، 2025)
    const data = await fetchAPI(`/fixtures?team=${teamId}&season=2024&last=20`);
    
    if (!data.response || data.response.length === 0) {
      return { avgScored: 1.5, avgConceded: 1.2, matches: 0 };
    }
    
    let totalScored = 0;
    let totalConceded = 0;
    let count = 0;
    
    for (const fixture of data.response) {
      // نتأكد إنه المباراة خلصت (FT = Full Time)
      if (fixture.fixture.status.short !== 'FT') continue;
      
      const isHome = fixture.teams.home.id === teamId;
      const goalsFor = isHome ? (fixture.goals.home || 0) : (fixture.goals.away || 0);
      const goalsAgainst = isHome ? (fixture.goals.away || 0) : (fixture.goals.home || 0);
      
      totalScored += goalsFor;
      totalConceded += goalsAgainst;
      count++;
    }
    
    if (count === 0) {
      return { avgScored: 1.5, avgConceded: 1.2, matches: 0 };
    }
    
    return {
      avgScored: totalScored / count,
      avgConceded: totalConceded / count,
      matches: count,
    };
  } catch (error) {
    console.error("getTeamStats error:", error);
    return { avgScored: 1.5, avgConceded: 1.2, matches: 0 };
  }
}

// 3. دالة بواسون
function poisson(k: number, lambda: number): number {
  return Math.exp(-lambda) * Math.pow(lambda, k) / factorial(k);
}

function factorial(n: number): number {
  if (n === 0 || n === 1) return 1;
  let result = 1;
  for (let i = 2; i <= n; i++) result *= i;
  return result;
}

export async function POST(req: NextRequest) {
  try {
    const { team1, team2 } = await req.json();

    if (!team1 || !team2) {
      return NextResponse.json({ error: "اسم الفريقين مطلوبين" }, { status: 400 });
    }

    // البحث عن الفريقين
    const team1Id = await getTeamId(team1);
    const team2Id = await getTeamId(team2);

    if (!team1Id || !team2Id) {
      return NextResponse.json({ 
        error: `تعذر العثور على أحد الفريقين. تأكد من كتابة الاسم بالإنجليزي.` 
      }, { status: 404 });
    }

    // جلب الإحصائيات الحقيقية
    const stats1 = await getTeamStats(team1Id);
    const stats2 = await getTeamStats(team2Id);

    // حساب lambda (متوسط الأهداف المتوقع) لكل فريق
    const lambda1 = stats1.avgScored * stats2.avgConceded;
    const lambda2 = stats2.avgScored * stats1.avgConceded;

    // حساب احتمالات النتائج
    const results = [];
    for (let i = 0; i <= 6; i++) {
      for (let j = 0; j <= 6; j++) {
        const prob = poisson(i, lambda1) * poisson(j, lambda2);
        results.push({ score1: i, score2: j, probability: prob });
      }
    }

    results.sort((a, b) => b.probability - a.probability);

    let win1 = 0, draw = 0, win2 = 0;
    for (const r of results) {
      if (r.score1 > r.score2) win1 += r.probability;
      else if (r.score1 === r.score2) draw += r.probability;
      else win2 += r.probability;
    }

    return NextResponse.json({
      team1,
      team2,
      prediction: {
        win1: Math.round(win1 * 100),
        draw: Math.round(draw * 100),
        win2: Math.round(win2 * 100),
        expected_goals: (lambda1 + lambda2).toFixed(2),
        top_scores: results.slice(0, 5).map((r) => ({
          score: `${r.score1} - ${r.score2}`,
          probability: Math.round(r.probability * 100),
        })),
      },
      debug: {
        team1Id,
        team2Id,
        team1Matches: stats1.matches,
        team2Matches: stats2.matches,
        team1AvgScored: stats1.avgScored.toFixed(2),
        team2AvgScored: stats2.avgScored.toFixed(2),
      }
    });

  } catch (error) {
    console.error("Octopus error:", error);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}