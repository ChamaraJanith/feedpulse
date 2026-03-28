import { GoogleGenerativeAI } from '@google/generative-ai';

export interface GeminiAnalysis {
  category: string;
  sentiment: 'Positive' | 'Neutral' | 'Negative';
  priorityScore: number;
  summary: string;
  tags: string[];
}

export const analyzeFeedback = async (
  title: string,
  description: string
): Promise<GeminiAnalysis | null> => {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
    const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });

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

    const result = await model.generateContent(prompt);
    const response = result.response.text().trim();

    const parsed: GeminiAnalysis = JSON.parse(response);
    return parsed;
  } catch (error) {
    console.error('Gemini analysis failed:', error);
    return null;
  }
};