import { NextRequest, NextResponse } from "next/server";
import { createGroq } from "@ai-sdk/groq";
import { generateObject } from "ai";
import { z } from "zod";

// 👇 تهيئة Groq
const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY!,
});

// 👇 تحديد شكل الـ JSON المطلوب بدقة (مع إضافة أسماء الفرق بالعربي)
const predictionSchema = z.object({
  team1_ar: z.string().describe("اسم الفريق الأول باللغة العربية"),
  team2_ar: z.string().describe("اسم الفريق الثاني باللغة العربية"),
  analysis: z.string().describe("نص التحليل باللغة العربية الفصحى حصراً (جملتين إلى ثلاث جمل)"),
  win1: z.number().min(0).max(100).describe("احتمالية فوز الفريق الأول (رقم فقط)"),
  draw: z.number().min(0).max(100).describe("احتمالية التعادل (رقم فقط)"),
  win2: z.number().min(0).max(100).describe("احتمالية فوز الفريق الثاني (رقم فقط)"),
  expected_goals: z.coerce.string().describe("عدد الأهداف المتوقع كرقم فقط (مثلاً 2.5) بدون أي كلام إضافي"),
  top_scores: z.array(
    z.object({
      score: z.string().describe("النتيجة (مثلاً 1-0)"),
      probability: z.number().min(0).max(100).describe("احتمالية هالنتيجة (رقم فقط)"),
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
      أنت خبير تحليل مباريات كرة قدم عربي. حلل المباراة بين ${team1} و ${team2}.
      
      قواعد صارمة جداً يجب اتباعها حرفياً:
      1. حقل "team1_ar": يجب أن يحتوي على اسم الفريق الأول باللغة العربية (مثلاً "فرنسا").
      2. حقل "team2_ar": يجب أن يحتوي على اسم الفريق الثاني باللغة العربية (مثلاً "إيطاليا").
      3. حقل "analysis" (نص التحليل): يجب أن يكون مكتوباً باللغة العربية الفصحى حصراً. لا تكتب أي كلمة بالإنجليزية.
      4. حقل "expected_goals" (عدد الأهداف المتوقع): يجب أن يكون رقماً فقط (مثلاً "2.5" أو "3.1"). ممنوع منعاً باتاً وضع أي نص أو كلام في هذا الحقل.
      5. حقل "top_scores" (أكثر النتائج ترجيحاً): يجب أن يحتوي فقط على النتيجة (مثلاً "1-0") والاحتمالية (رقم). لا تضع أي كلام إضافي أو أسباب هنا.
      6. تأكد أن مجموع (win1 + draw + win2) يساوي 100 تقريباً.
      7. أرجع النتيجة بصيغة JSON فقط.
    `;

    const { object } = await generateObject({
      model: groq("openai/gpt-oss-120b"),
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
    console.error("Groq Octopus error:", error);
    
    return NextResponse.json({ 
      error: "تعذر تحليل المباراة حالياً. حاول مرة أخرى.",
      details: error.message || "خطأ غير معروف"
    }, { status: 500 });
  }
}