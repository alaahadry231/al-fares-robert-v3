import { NextRequest, NextResponse } from "next/server";

const API_KEY = process.env.FOOTBALL_API_KEY;
const API_BASE = "https://api.5dollarfootballapi.com/v1";

// 👇 دالة لجلب ID الفريق بالبحث بالاسم
async function getTeamId(teamName: string): Promise<number | null> {
  try {
    // ملاحظة: الـ API ما فيه endpoint مباشر للبحث عن فريق بالاسم
    // بس فينا نجيب الفرق من الدوريات الكبرى وندور فيها
    // أو نستخدم endpoint الفرق إذا متاح
    // خلينا نجرب ندور في fixtures عشان نلاقي الفريق
    
    // طريقة مبدئية: نجيب مباريات اليوم/الأمس وندور على الفريق
    // هاد مش دقيق 100%، بس بيمشي كبداية
    const res = await fetch(`${API_BASE}/fixtures?per_page=100`, {
      headers: { Authorization: `Bearer ${API_KEY}` },
    });
    const data = await res.json();
    
    if (!data.data) return null;
    
    // ندور على الفريق في المباريات
    for (const fixture of data.data) {
      const homeName = fixture.teams?.home?.name?.toLowerCase() || "";
      const awayName = fixture.teams?.away?.name?.toLowerCase() || "";
      const searchName = teamName.toLowerCase();
      
      if (homeName.includes(searchName) || searchName.includes(homeName)) {
        return fixture.teams.home.id;
      }
      if (awayName.includes(searchName) || searchName.includes(awayName)) {
        return fixture.teams.away.id;
      }
    }
    
    return null;
  } catch (error) {
    console.error("getTeamId error:", error);
    return null;
  }
}

// 👇 دالة لجلب مباريات الفريق وحساب المتوسطات
async function getTeamStats(teamId: number) {
  try {
    const res = await fetch(`${API_BASE}/teams/${teamId}/fixtures?status=finished&per_page=20`, {
      headers: { Authorization: `Bearer ${API_KEY}` },
    });
    const data = await res.json();
    
    if (!data.data || data.data.length === 0) {
      return { avgScored: 1.5, avgConceded: 1.2 }; // قيم افتراضية
    }
    
    let totalScored = 0;
    let totalConceded = 0;
    let count = 0;
    
    for (const fixture of data.data) {
      const isHome = fixture.teams?.home?.id === teamId;
      const goalsFor = isHome ? (fixture.goals?.home || 0) : (fixture.goals?.away || 0);
      const goalsAgainst = isHome ? (fixture.goals?.away || 0) : (fixture.goals?.home || 0);
      
      totalScored += goalsFor;
      totalConceded += goalsAgainst;
      count++;
    }
    
    return {
      avgScored: count > 0 ? totalScored / count : 1.5,
      avgConceded: count > 0 ? totalConceded / count : 1.2,
    };
  } catch (error) {
    console.error("getTeamStats error:", error);
    return { avgScored: 1.5, avgConceded: 1.2 };
  }
}

// 👇 دالة بواسون
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

    // 1. نجيب ID الفريقين
    const team1Id = await getTeamId(team1);
    const team2Id = await getTeamId(team2);

    if (!team1Id || !team2Id) {
      return NextResponse.json({ 
        error: "تعذر العثور على أحد الفريقين. جرب الاسم بالإنجليزي (مثلاً: Real Madrid)" 
      }, { status: 404 });
    }

    // 2. نجيب إحصائيات الفريقين
    const stats1 = await getTeamStats(team1Id);
    const stats2 = await getTeamStats(team2Id);

    // 3. نحسب lambda (متوسط الأهداف المتوقع) لكل فريق
    // lambda1 = هجوم الفريق الأول × دفاع الفريق الثاني
    // lambda2 = هجوم الفريق الثاني × دفاع الفريق الأول
    const lambda1 = stats1.avgScored * stats2.avgConceded;
    const lambda2 = stats2.avgScored * stats1.avgConceded;

    // 4. نحسب احتمالات النتائج
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
    });

  } catch (error) {
    console.error("Octopus error:", error);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}