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

// 👇 دالة البحث الذكية (بتحاول تدور بالاسم، وبعدين تفلتر النتائج)
async function getTeamId(teamName: string): Promise<number | null> {
  try {
    // 1. البحث بالاسم
    const data = await fetchAPI(`/teams?search=${encodeURIComponent(teamName)}`);
    
    if (data.response && data.response.length > 0) {
      // الـ API بيرجع كذا نتيجة (مثلاً "Real Madrid" و "Real Madrid Castilla")
      // بنحاول نلاقي التطابق الأقرب للاسم اللي كتبه المستخدم
      const searchLower = teamName.toLowerCase();
      
      // نبحث عن تطابق شبه كامل
      const exactMatch = data.response.find((item: any) => 
        item.team.name.toLowerCase() === searchLower
      );
      
      if (exactMatch) {
        return exactMatch.team.id;
      }

      // إذا ما لقينا تطابق كامل، نرجع أول نتيجة (غالباً بتكون الأقرب)
      return data.response[0].team.id;
    }
    return null;
  } catch (error) {
    console.error("getTeamId error:", error);
    return null;
  }
}

// جلب إحصائيات الفريق (لسا تقديرية، رح نطورها بعدين)
async function getTeamStats(teamId: number) {
  try {
    return { avgScored: 1.5, avgConceded: 1.2 };
  } catch (error) {
    return { avgScored: 1.5, avgConceded: 1.2 };
  }
}

// دالة بواسون
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

    const team1Id = await getTeamId(team1);
    const team2Id = await getTeamId(team2);

    if (!team1Id || !team2Id) {
      return NextResponse.json({ 
        error: `تعذر العثور على أحد الفريقين. تأكد من كتابة الاسم بالإنجليزي.` 
      }, { status: 404 });
    }

    const stats1 = await getTeamStats(team1Id);
    const stats2 = await getTeamStats(team2Id);

    const lambda1 = stats1.avgScored * stats2.avgConceded;
    const lambda2 = stats2.avgScored * stats1.avgConceded;

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
      }
    });

  } catch (error) {
    console.error("Octopus error:", error);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}