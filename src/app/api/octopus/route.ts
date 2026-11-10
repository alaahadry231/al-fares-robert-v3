import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { team1, team2 } = await req.json();

    if (!team1 || !team2) {
      return NextResponse.json({ error: "اسم الفريقين مطلوبين" }, { status: 400 });
    }

    // 👇 استخدام الموديل الأحدث
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash",
      generationConfig: {
        responseMimeType: "application/json", 
      }
    });

    const prompt = `
      أنت خبير تحليل مباريات كرة قدم. حلل المباراة بين ${team1} و ${team2}.
      أعطني توقعك بناءً على معلوماتك العامة عن الفريقين (مستواهم، تاريخهم، وأدائهم الأخير إن أمكن).
      
      أرجع النتيجة بصيغة JSON فقط، بدون أي نص إضافي (لا تكتب \`\`\`json ولا أي شي)، بهذا الشكل بالضبط:
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

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // 👇 تنظيف النص من أي علامات إضافية ممكن الذكاء الاصطناعي يضيفها
    const cleanedJson = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
    const predictionData = JSON.parse(cleanedJson);

    return NextResponse.json({
      team1,
      team2,
      prediction: predictionData,
    });

  } catch (error: any) {
    console.error("Gemini Octopus error:", error);
    
    // 👇 نرجع تفاصيل الخطأ عشان نعرف شو صار بالضبط
    return NextResponse.json({ 
      error: "تعذر تحليل المباراة حالياً.",
      details: error.message || "خطأ غير معروف"
    }, { status: 500 });
  }
}