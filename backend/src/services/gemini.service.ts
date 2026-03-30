import { GoogleGenerativeAI } from '@google/generative-ai';

export interface GeminiAnalysis {
  category: string;
  sentiment: 'Positive' | 'Neutral' | 'Negative';
  priorityScore: number;
  summary: string;
  tags: string[];
}

const MODELS = [
  'gemini-2.0-flash-lite',
  'gemini-2.0-flash',
  'gemini-3-flash-preview',
];

export const analyzeFeedback = async (
  title: string,
  description: string
): Promise<GeminiAnalysis | null> => {
  const prompt = `Analyse this product feedback. Return ONLY valid JSON with no markdown, no code blocks, just raw JSON.

Title: ${title}
Description: ${description}

Return this exact JSON structure:
{
  "category": "Bug" | "Feature Request" | "Improvement" | "Other",
  "sentiment": "Positive" | "Neutral" | "Negative",
  "priorityScore": <number 1-10>,
  "summary": "<one sentence summary>",
  "tags": ["tag1", "tag2", "tag3"]
}`;

  for (const modelName of MODELS) {
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
      const geminiModel = genAI.getGenerativeModel({ model: modelName });
      const result = await geminiModel.generateContent(prompt);
      const response = result.response.text().trim();
      const parsed: GeminiAnalysis = JSON.parse(response);
      console.log(`Gemini success with model: ${modelName}`);
      return parsed;
    } catch (error: any) {
      console.error(`Gemini failed with model ${modelName}:`, error.message);
      continue;
    }
  }

  return null;
};