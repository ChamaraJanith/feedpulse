# FeedPulse

FeedPulse is an AI-powered feedback management platform built to collect, analyze, and manage user feedback through a modern full-stack web application. It provides a public feedback submission interface, an admin login area, and an admin dashboard for reviewing feedback efficiently.

## Features

- Public feedback submission form
- Admin login functionality
- Admin dashboard for feedback management
- AI-assisted feedback analysis
- Category and sentiment-based processing
- MongoDB database integration
- REST API backend with Express.js
- Modern frontend built with Next.js
- Docker support for containerized development
- CI workflow with GitHub Actions
- Cloud deployment using Render and Vercel

## Tech Stack

### Frontend
- Next.js
- TypeScript
- Tailwind CSS

### Backend
- Node.js
- Express.js
- TypeScript
- MongoDB
- Mongoose
- JWT Authentication

### DevOps / Deployment
- Docker
- Docker Compose
- GitHub Actions
- Render
- Vercel

## Project Structure

```bash
feedpulse/
├── backend/
│   ├── src/
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── app/
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
├── docker-compose.yml
└── .github/workflows/ci.yml
```

## Live Deployment

### Frontend
- Vercel: https://feedpulse-phi.vercel.app/

### Backend
- Render: https://feedpulse-backend.onrender.com/

### Health Check
- https://feedpulse-backend.onrender.com/health

## Environment Variables

### Backend `.env`

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-3-flash-preview
ADMIN_EMAIL=admin@feedpulse.com
ADMIN_PASSWORD=your_admin_password
```

### Frontend `.env.local`

```env
NEXT_PUBLIC_API_URL=https://feedpulse-backend.onrender.com
```

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/ChamaraJanith/feedpulse.git
cd feedpulse
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Install frontend dependencies

```bash
cd ../frontend
npm install
```

## Running Locally

### Run backend

```bash
cd backend
npm run dev
```

### Run frontend

```bash
cd frontend
npm run dev
```

## Production Build

### Backend

```bash
cd backend
npm run build
npm start
```

### Frontend

```bash
cd frontend
npm run build
npm start
```

## Docker Setup

From the project root:

```bash
docker-compose up --build
```

## API Endpoints

### Root
```http
GET /
```

### Health Check
```http
GET /health
```

### Feedback
```http
POST /api/feedback
GET /api/feedback
```

### Authentication
```http
POST /api/auth/login
```

## Testing

### Backend tests

```bash
cd backend
npm test
```

## CI/CD

This project includes:
- GitHub Actions workflow for CI
- Docker configuration for containerized setup
- Render deployment for backend
- Vercel deployment for frontend

## Usage Flow

1. User opens the frontend application.
2. User submits feedback through the feedback form.
3. Frontend sends the request to the backend API.
4. Backend stores feedback in MongoDB.
5. AI service analyzes feedback data.
6. Admin logs in to review and manage submissions.

## Future Improvements

- Feedback filtering and search
- Report generation
- Data visualization charts
- Role-based access control
- Email notifications
- Multilingual support improvements

## Author

**Chamara Janith**

## License

This project is developed for educational and project demonstration purposes.