import { NextRequest, NextResponse } from "next/server";

const API_KEY = process.env.FOOTBALL_API_KEY;

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

    // 👇 نجيب إحصائيات الفريقين من الـ API
    // (هاد كود مبدئي، لازم نعدله حسب توثيق 5DollarFootballAPI)
    // للأسف، الـ API ما بيرجع إحصائيات تفصيلية بسهولة،
    // فخلينا نستخدم قيم افتراضية مبنية على متوسطات الدوريات الكبرى
    // (ريال مدريد وبرشلونة مثلاً: هجوم قوي، دفاع متوسط)
    
    // هاد مجرد تقدير مبدئي (2.0 و 1.5)
    // لازم نعدله عشان نستخدم بيانات حقيقية
    const lambda1 = 1.8; // متوسط أهداف الفريق الأول
    const lambda2 = 1.2; // متوسط أهداف الفريق الثاني

    // نحسب احتمالات النتائج (0-0، 1-0، ...)
    const results = [];
    for (let i = 0; i <= 5; i++) {
      for (let j = 0; j <= 5; j++) {
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