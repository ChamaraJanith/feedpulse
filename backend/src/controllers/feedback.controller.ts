import { Request, Response } from 'express';
import Feedback from '../models/feedback.model';

// POST /api/feedback
export const createFeedback = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, category, submitterName, submitterEmail } = req.body;

    const feedback = await Feedback.create({
      title,
      description,
      category,
      submitterName,
      submitterEmail,
    });

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      data: feedback,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: 'Failed to submit feedback',
      error: error.message,
    });
  }
};

// GET /api/feedback
export const getAllFeedback = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, status, sortBy = 'createdAt', order = 'desc' } = req.query;

    const filter: any = {};
    if (category) filter.category = category;
    if (status) filter.status = status;

    const sortOrder = order === 'asc' ? 1 : -1;
    const sortField = sortBy as string;

    const feedback = await Feedback.find(filter)
      .sort({ [sortField]: sortOrder })
      .lean();

    res.status(200).json({
      success: true,
      message: 'Feedback retrieved successfully',
      data: feedback,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve feedback',
      error: error.message,
    });
  }
};

// GET /api/feedback/:id
export const getFeedbackById = async (req: Request, res: Response): Promise<void> => {
  try {
    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      res.status(404).json({
        success: false,
        message: 'Feedback not found',
        error: null,
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Feedback retrieved successfully',
      data: feedback,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve feedback',
      error: error.message,
    });
  }
};

// PATCH /api/feedback/:id
export const updateFeedbackStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.body;

    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!feedback) {
      res.status(404).json({
        success: false,
        message: 'Feedback not found',
        error: null,
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Feedback status updated successfully',
      data: feedback,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: 'Failed to update feedback status',
      error: error.message,
    });
  }
};

// DELETE /api/feedback/:id
export const deleteFeedback = async (req: Request, res: Response): Promise<void> => {
  try {
    const feedback = await Feedback.findByIdAndDelete(req.params.id);

    if (!feedback) {
      res.status(404).json({
        success: false,
        message: 'Feedback not found',
        error: null,
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Feedback deleted successfully',
      data: null,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete feedback',
      error: error.message,
    });
  }
};