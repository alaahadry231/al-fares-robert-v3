import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// 👇 تهيئة Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { team1, team2 } = await req.json();

    if (!team1 || !team2) {
      return NextResponse.json({ error: "اسم الفريقين مطلوبين" }, { status: 400 });
    }

    // 👇 نستخدم موديل سريع ومجاني
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // 👇 هذا هو "البرومبت" (الطلب) اللي رح ينبعث للذكاء الاصطناعي
    const prompt = `
      أنت خبير تحليل مباريات كرة قدم. حلل المباراة بين ${team1} و ${team2}.
      أعطني توقعك بناءً على معلوماتك العامة عن الفريقين (مستواهم، تاريخهم، وأدائهم الأخير إن أمكن).
      
      أرجع النتيجة بصيغة JSON فقط، بدون أي نص إضافي، بهذا الشكل بالضبط:
      {
        "analysis": "نص التحليل (جملتين إلى ثلاث جمل)",
        "win1": (رقم من 0 إلى 100 يمثل احتمالية فوز ${team1}),
        "draw": (رقم من 0 إلى 100 يمثل احتمالية التعادل),
        "win2": (رقم من 0 إلى 100 يمثل احتمالية فوز ${team2}),
        "expected_goals": "رقم عشري يمثل عدد الأهداف المتوقع (مثلاً 2.5)",
        "top_scores": [
          { "score": "1-0", "probability": (رقم من 0 إلى 100) },
          { "score": "1-1", "probability": (رقم) },
          { "score": "2-1", "probability": (رقم) }
        ]
      }
      تأكد أن مجموع (win1 + draw + win2) يساوي 100 تقريباً.
    `;

    // 👇 نطلب من Gemini يرجع الرد بصيغة JSON
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json", // 👈 هذا يخلي Gemini يرد بـ JSON نظيف
      },
    });

    const responseText = result.response.text();
    
    // 👇 نحوّل النص لـ JSON
    const predictionData = JSON.parse(responseText);

    return NextResponse.json({
      team1,
      team2,
      prediction: predictionData,
    });

  } catch (error: any) {
    console.error("Gemini Octopus error:", error);
    
    // إذا صار خطأ بالـ JSON أو الاتصال
    return NextResponse.json({ 
      error: "تعذر تحليل المباراة حالياً. حاول مرة أخرى." 
    }, { status: 500 });
  }
}