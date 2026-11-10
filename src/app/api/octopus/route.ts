import { NextRequest, NextResponse } from "next/server";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateObject } from "ai";
import { z } from "zod";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY!,
});

// 👇 تحديد شكل الـ JSON المطلوب بدقة
const predictionSchema = z.object({
  analysis: z.string().describe("نص التحليل (جملتين إلى ثلاث جمل)"),
  win1: z.number().min(0).max(100).describe("احتمالية فوز الفريق الأول"),
  draw: z.number().min(0).max(100).describe("احتمالية التعادل"),
  win2: z.number().min(0).max(100).describe("احتمالية فوز الفريق الثاني"),
  expected_goals: z.string().describe("عدد الأهداف المتوقع (مثلاً 2.5)"),
  top_scores: z.array(
    z.object({
      score: z.string().describe("النتيجة (مثلاً 1-0)"),
      probability: z.number().min(0).max(100).describe("احتمالية هالنتيجة"),
    })
  ).length(3).describe("أكثر 3 نتائج ترجيحاً"),
});

export async function POST(req: NextRequest) {
  try {
    const { team1, team2 } = await req.json();

    if (!team1 || !team2) {
      return NextResponse.json({ error: "اسم الفريقين مطلوبين" }, { status: 400 });
    }

    const prompt = `
      أنت خبير تحليل مباريات كرة قدم. حلل المباراة بين ${team1} و ${team2}.
      أعطني توقعك بناءً على معلوماتك العامة عن الفريقين (مستواهم، تاريخهم، وأدائهم الأخير إن أمكن).
      تأكد أن مجموع (win1 + draw + win2) يساوي 100 تقريباً.
    `;

    // 👇 نستخدم نموذج Llama 3.1 70B المجاني والمستقر
const { object } = await generateObject({
  // 👇 موديل مجاني يدعم structured output بشكل أصلي
  model: openrouter("liquid/lfm-2.5-2.6b:free", {
    plugins: [{ id: "response-healing" }],
  }),
  schema: predictionSchema,
  prompt: prompt,
  maxOutputTokens: 2000,
});

    return NextResponse.json({
      team1,
      team2,
      prediction: object,
    });

  } catch (error: any) {
    console.error("OpenRouter Octopus error:", error);
    
    return NextResponse.json({ 
      error: "تعذر تحليل المباراة حالياً. حاول مرة أخرى.",
      details: error.message || "خطأ غير معروف"
    }, { status: 500 });
  }
}