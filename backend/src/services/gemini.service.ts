import { GoogleGenerativeAI } from "@google/generative-ai";

export interface GeminiAnalysis {
  originalLanguage: string;
  translatedTitle: string;
  translatedDescription: string;
  category: "Bug" | "Feature Request" | "Improvement" | "Other";
  sentiment: "Positive" | "Neutral" | "Negative";
  priority_score: number;
  summary: string;
  tags: string[];
}

const MODELS = [
  "gemini-1.5-flash",
  "gemini-2.0-flash-lite",
  "gemini-2.0-flash",
  "gemini-3-flash-preview",
];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const cleanJson = (text: string) => {
  return text.replace(/```json|```/g, "").trim();
};

export const analyzeFeedback = async (
  title: string,
  description: string
): Promise<GeminiAnalysis | null> => {
  const prompt = `
Analyse this product feedback and return ONLY valid raw JSON.

Tasks:
1. Detect the original language.
2. Translate title and description into English.
3. Classify category as one of: Bug, Feature Request, Improvement, Other.
4. Detect sentiment as one of: Positive, Neutral, Negative.
5. Assign priority_score from 1 to 10.
6. Write a one sentence summary in English.
7. Return exactly 3 short tags in English.

Title: ${title}
Description: ${description}

Return this exact JSON structure:
{
  "originalLanguage": "si",
  "translatedTitle": "English title here",
  "translatedDescription": "English description here",
  "category": "Bug",
  "sentiment": "Negative",
  "priority_score": 8,
  "summary": "One sentence summary here.",
  "tags": ["search", "accuracy", "ux"]
}
`;

  for (const modelName of MODELS) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
        const geminiModel = genAI.getGenerativeModel({ model: modelName });

        const result = await geminiModel.generateContent(prompt);
        const responseText = result.response.text().trim();
        const parsed: GeminiAnalysis = JSON.parse(cleanJson(responseText));

        console.log(`Gemini success with model: ${modelName} (attempt ${attempt})`);
        return parsed;
      } catch (error: any) {
        console.error(
          `Gemini failed with model ${modelName} attempt ${attempt}:`,
          error.message
        );

        if (attempt === 1) {
          await delay(2000);
        }
      }
    }
  }

  return null;
};