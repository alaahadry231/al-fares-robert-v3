import { NextRequest, NextResponse } from "next/server";

// 👇 المفتاح الجديد من API-Football
const API_KEY = process.env.API_FOOTBALL_KEY;
const API_BASE = "https://v3.football.api-sports.io";

// دالة مساعدة لإرسال الطلبات مع الهيدرز الصحيحة
async function fetchAPI(endpoint: string) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      "x-apisports-key": API_KEY!,
    },
    // نضيف cache بسيط عشان ما نستهلك الطلبات بسرعة
    next: { revalidate: 3600 }, 
  });
  return res.json();
}

// 1. البحث عن ID الفريق بالاسم (باستخدام الـ endpoint الصحيح)
async function getTeamId(teamName: string): Promise<number | null> {
  try {
    // البحث عن الفريق بالاسم (الـ API بيحتاج 3 أحرف على الأقل)
    const data = await fetchAPI(`/teams?search=${encodeURIComponent(teamName)}`);
    
    if (data.response && data.response.length > 0) {
      // نرجع أول نتيجة (الـ API بيرجع أقرب تطابق)
      return data.response[0].team.id;
    }
    return null;
  } catch (error) {
    console.error("getTeamId error:", error);
    return null;
  }
}

// 2. جلب إحصائيات الفريق
// ⚠️ ملاحظة: لسا ما جبنا إحصائيات حقيقية، عم نستخدم قيم تقديرية للاختبار
async function getTeamStats(teamId: number) {
  try {
    // TODO: هون لازم نجيب مباريات الفريق الفعلية من الـ API
    // ونحسب متوسط الأهداف المسجلة والمستقبلة
    // هالخطوة بتحتاج شغل إضافي (معرفة الدوري والموسم)
    
    // كحل مؤقت، نرجع قيم تقديرية
    return { avgScored: 1.5, avgConceded: 1.2 };
  } catch (error) {
    console.error("getTeamStats error:", error);
    return { avgScored: 1.5, avgConceded: 1.2 };
  }
}

// 3. دالة بواسون لحساب الاحتمالات
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
        error: "تعذر العثور على أحد الفريقين. جرب الاسم بالإنجليزي (مثلاً: Real Madrid)" 
      }, { status: 404 });
    }

    // جلب الإحصائيات (حالياً قيم افتراضية للاختبار)
    const stats1 = await getTeamStats(team1Id);
    const stats2 = await getTeamStats(team2Id);

    // حساب lambda (متوسط الأهداف المتوقع) لكل فريق
    // lambda1 = هجوم الفريق الأول × دفاع الفريق الثاني
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
      // معلومات إضافية للتشخيص (بتساعدنا نتأكد إنه البحث شغال)
      debug: {
        team1Id,
        team2Id,
        note: "الإحصائيات حالياً تقديرية، سيتم تطويرها لاحقاً"
      }
    });

  } catch (error) {
    console.error("Octopus error:", error);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}