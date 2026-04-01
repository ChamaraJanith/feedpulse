import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { connectDB } from './config/db';

//add internal imports
import feedbackRoutes from './routes/feedback.routes';
import authRoutes from './routes/auth.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use('/api/feedback', feedbackRoutes);
app.use('/api/auth', authRoutes);

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'FeedPulse API is running',
  });
});
app.get('/', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'FeedPulse backend is live',
  });
});


const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

if (process.env.NODE_ENV !== 'test') {
  start();
}

export default app;