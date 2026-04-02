import { Request, Response } from "express";
import Feedback from "../models/feedback.model";

//Gemini analysis
import { analyzeFeedback } from "../services/gemini.service";

// POST /api/feedback
export const createFeedback = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { title, description, category, submitterName, submitterEmail } =
      req.body;

    if (!title || !description || !category) {
      res.status(400).json({
        success: false,
        message: 'Missing required fields: title, description, category',
        error: null,
      });
      return;
    }

    if (description.length < 20) {
      res.status(400).json({
        success: false,
        message: 'Description must be at least 20 characters',
        error: null,
      });
      return;
    }

    if (submitterEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(submitterEmail)) {
      res.status(400).json({
        success: false,
        message: 'Submitter email is not valid',
        error: null,
      });
      return;
    }

    const validCategories = ['Bug', 'Feature Request', 'Improvement', 'Other'];
    if (!validCategories.includes(category)) {
      res.status(400).json({
        success: false,
        message: 'Invalid category',
        error: null,
      });
      return;
    }

    const feedback = await Feedback.create({
      title,
      description,
      category,
      submitterName,
      submitterEmail,
      originalTitle: title,
      originalDescription: description,
      translatedTitle: title,
      translatedDescription: description,
      originalLanguage: "en",
    });

    // Gemini AI analysis
    const aiAnalysis = await analyzeFeedback(
      feedback.title,
      feedback.description,
    );

    if (aiAnalysis) {
      feedback.aiCategory = aiAnalysis.category;
      feedback.aiSentiment = aiAnalysis.sentiment;
      feedback.aiPriority = aiAnalysis.priority_score;
      feedback.aiSummary = aiAnalysis.summary;
      feedback.aiTags = aiAnalysis.tags;
      feedback.aiProcessed = true;

      feedback.originalLanguage = aiAnalysis.originalLanguage || "en";
      feedback.originalTitle = title;
      feedback.originalDescription = description;
      feedback.translatedTitle = aiAnalysis.translatedTitle || title;
      feedback.translatedDescription =
        aiAnalysis.translatedDescription || description;
      await feedback.save();
    }

    res.status(201).json({
      success: true,
      message: "Feedback submitted successfully",
      data: feedback,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: "Failed to submit feedback",
      error: error.message,
    });
  }
};

// GET /api/feedback
export const getAllFeedback = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const {
      category,
      status,
      sortBy = "createdAt",
      order = "desc",
    } = req.query;

    const filter: any = {};
    if (category) filter.category = category;
    if (status) filter.status = status;

    const sortOrder = order === "asc" ? 1 : -1;
    const sortField = sortBy as string;

    const feedback = await Feedback.find(filter)
      .sort({ [sortField]: sortOrder })
      .lean();

    res.status(200).json({
      success: true,
      message: "Feedback retrieved successfully",
      data: feedback,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve feedback",
      error: error.message,
    });
  }
};

// GET /api/feedback/:id
export const getFeedbackById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      res.status(404).json({
        success: false,
        message: "Feedback not found",
        error: null,
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Feedback retrieved successfully",
      data: feedback,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve feedback",
      error: error.message,
    });
  }
};

// PATCH /api/feedback/:id
export const updateFeedbackStatus = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { status } = req.body;

    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true },
    );

    if (!feedback) {
      res.status(404).json({
        success: false,
        message: "Feedback not found",
        error: null,
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Feedback status updated successfully",
      data: feedback,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: "Failed to update feedback status",
      error: error.message,
    });
  }
};

// DELETE /api/feedback/:id
export const deleteFeedback = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const feedback = await Feedback.findByIdAndDelete(req.params.id);

    if (!feedback) {
      res.status(404).json({
        success: false,
        message: "Feedback not found",
        error: null,
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Feedback deleted successfully",
      data: null,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to delete feedback",
      error: error.message,
    });
  }
};

// GET /api/feedback/summary
export const getFeedbackSummary = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const cleanJson = (text: string) => text.replace(/```json|```/g, "").trim();
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentFeedback = await Feedback.find({
      createdAt: { $gte: sevenDaysAgo },
      aiProcessed: true,
    }).lean();

    if (recentFeedback.length === 0) {
      res.status(200).json({
        success: true,
        message: "No processed feedback found in the last 7 days",
        data: { summary: "No feedback available for analysis.", totalCount: 0 },
      });
      return;
    }

    const feedbackText = recentFeedback
      .map(
        (f, i) =>
          `${i + 1}. Title: ${f.translatedTitle || f.title} | Category: ${f.aiCategory || f.category} | Sentiment: ${f.aiSentiment || "Unknown"} | Tags: ${f.aiTags?.join(", ") || "None"}`,
      )
      .join("\n");

    const { analyzeFeedback } = await import("../services/gemini.service");

    // Gemini call for trend summary
    const MODELS = [
      "gemini-2.0-flash-lite",
      "gemini-2.0-flash",
      "gemini-3-flash-preview",
    ];
    let summaryText = "";

    for (const modelName of MODELS) {
      try {
        const { GoogleGenerativeAI } = await import("@google/generative-ai");
        const genAI = new GoogleGenerativeAI(
          process.env.GEMINI_API_KEY as string,
        );
        const geminiModel = genAI.getGenerativeModel({ model: modelName });

        const prompt = `Analyse these ${recentFeedback.length} product feedback items from the last 7 days and identify the top 3 themes. Return ONLY valid JSON:
{
  "themes": [
    {"theme": "Theme name", "count": number, "description": "brief description"},
    {"theme": "Theme name", "count": number, "description": "brief description"},
    {"theme": "Theme name", "count": number, "description": "brief description"}
  ],
  "overallSentiment": "Positive" | "Neutral" | "Negative",
  "recommendation": "One actionable recommendation for the product team"
}

Feedback data:
${feedbackText}`;

        const result = await geminiModel.generateContent(prompt);
        summaryText = result.response.text().trim();
        console.log(`Summary generated with model: ${modelName}`);
        break;
      } catch (error: any) {
        console.error(`Summary failed with model ${modelName}:`, error.message);
        continue;
      }
    }

    if (!summaryText) {
      res.status(500).json({
        success: false,
        message: "Failed to generate AI summary",
        error: null,
      });
      return;
    }

    const parsed = JSON.parse(cleanJson(summaryText));

    res.status(200).json({
      success: true,
      message: "AI summary generated successfully",
      data: {
        ...parsed,
        totalCount: recentFeedback.length,
        period: "7 days",
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to generate summary",
      error: error.message,
    });
  }
};
