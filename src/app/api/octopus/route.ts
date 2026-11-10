import { NextRequest, NextResponse } from "next/server";

const API_KEY = process.env.FOOTBALL_API_KEY;
const API_HOST = "https://api.5dollarfootballapi.com/v1";

// 👇 دالة لجلب إحصائيات الفريق
async function getTeamStats(teamName: string) {
  // هون رح نستخدم API لجلب آخر 10 مباريات للفريق
  // ونحسب متوسط الأهداف المسجلة والمستقبلة
  // (هاد كود تقريبي، الـ API الحقيقي بده توثيق)
  try {
    const res = await fetch(`${API_HOST}/teams/stats?name=${encodeURIComponent(teamName)}`, {
      headers: { "x-api-key": API_KEY! },
    });
    const data = await res.json();
    return data;
  } catch {
    return null;
  }
}

// 👇 دالة لحساب توزيع بواسون
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

    // 1. نجيب إحصائيات الفريقين
    const stats1 = await getTeamStats(team1);
    const stats2 = await getTeamStats(team2);

    if (!stats1 || !stats2) {
      return NextResponse.json({ error: "تعذر جلب بيانات الفريقين" }, { status: 500 });
    }

    // 2. نحسب متوسط الأهداف (هون بنفترض إنه الـ API بيرجع home_avg_goals و away_avg_goals)
    // هاد مثال، لازم تعدله حسب شكل الـ API الحقيقي
    const team1HomeAttack = stats1.home_avg_goals || 1.5;
    const team1HomeDefense = stats1.home_avg_conceded || 1.2;
    const team2AwayAttack = stats2.away_avg_goals || 1.2;
    const team2AwayDefense = stats2.away_avg_conceded || 1.5;

    // 3. نحسب lambda (متوسط الأهداف المتوقع) لكل فريق
    const lambda1 = team1HomeAttack * team2AwayDefense;
    const lambda2 = team2AwayAttack * team1HomeDefense;

    // 4. نحسب احتمالات النتائج (0-0، 1-0، 1-1، ... لحد 5-5)
    const results = [];
    for (let i = 0; i <= 5; i++) {
      for (let j = 0; j <= 5; j++) {
        const prob = poisson(i, lambda1) * poisson(j, lambda2);
        results.push({ score1: i, score2: j, probability: prob });
      }
    }

    // 5. نرتب النتائج حسب الاحتمالية
    results.sort((a, b) => b.probability - a.probability);

    // 6. نحسب احتمالات الفوز والتعادل والخسارة
    let win1 = 0, draw = 0, win2 = 0;
    for (const r of results) {
      if (r.score1 > r.score2) win1 += r.probability;
      else if (r.score1 === r.score2) draw += r.probability;
      else win2 += r.probability;
    }

    // 7. نرجع النتيجة
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
    });

  } catch (error) {
    console.error("Octopus error:", error);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}