import { Router } from 'express';
import {
  createFeedback,
  getAllFeedback,
  getFeedbackById,
  updateFeedbackStatus,
  deleteFeedback,
  getFeedbackSummary,
} from '../controllers/feedback.controller';

//import middleware
import { protect } from '../middleware/auth.middleware';

const router = Router();

// AI Summary route - must be before /:id route
router.get('/summary', getFeedbackSummary);

// Public routes - anyone can access
router.post('/', createFeedback);        // Submit new feedback
router.get('/', getAllFeedback);          // Get all feedback (with filters)
router.get('/:id', getFeedbackById);     // Get single feedback by ID

// Admin only routes - JWT middleware will be added later
router.patch('/:id', updateFeedbackStatus);  // Update feedback status
router.delete('/:id', deleteFeedback);       // Delete feedback

export default router;