import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import { NextResponse } from "next/server";
import { getFallbackTranslation } from "@/utils/fallbackData";

export const maxDuration = 30;

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || "",
});

export async function POST(req: Request) {
  try {
    const { fields, targetLanguage } = await req.json();

    if (!fields || !targetLanguage) {
      return NextResponse.json({ error: "Fields and targetLanguage are required" }, { status: 400 });
    }

    if (targetLanguage === "en") {
      return NextResponse.json({ result: fields });
    }

    // Try using Gemini AI first
    try {
      if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY.startsWith("AQ")) {
        throw new Error("Invalid or unauthenticated API key format detected in environment configuration.");
      }

      const languageNames: Record<string, string> = {
        hi: "Hindi",
        bn: "Bengali",
        ta: "Tamil",
        te: "Telugu",
        es: "Spanish",
        fr: "French",
        ar: "Arabic"
      };

      const targetLangName = languageNames[targetLanguage] || targetLanguage;

      const prompt = `You are a precise translator. Translate the values of the following JSON object into ${targetLangName}. Keep any HTML tags, emojis, markdown formatting, and original names/IDs intact.
Return ONLY the translated JSON object matching the exact keys. Do not wrap in markdown code blocks or add other text.

JSON to translate:
${JSON.stringify(fields, null, 2)}`;

      const { text } = await generateText({
        model: google("gemini-2.5-flash"),
        system: "You are a precise translator. Translate values of the JSON object into the requested language and return only the translated JSON. No markdown code blocks, no intro, no comments.",
        prompt: prompt,
      });

      let result;
      const cleaned = text.trim().replace(/^```json/, "").replace(/```$/, "").trim();
      result = JSON.parse(cleaned);
      return NextResponse.json({ result });
    } catch (aiError: any) {
      console.warn("Gemini API call failed (likely due to auth issues). Using local fallback translator:", aiError.message || aiError);
      
      // Fallback local translation
      const result = getFallbackTranslation(fields, targetLanguage);
      return NextResponse.json({ result });
    }
  } catch (error: any) {
    console.error("Translate route critical error:", error);
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}
