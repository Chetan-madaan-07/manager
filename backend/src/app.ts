import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors'; // <--- NEW IMPORT
import authRouter from './routes/auth.router';
import taskRouter from './routes/task.router';

const app = express();

// --- NEW: CORS Configuration ---
// This allows your Vercel frontend to talk to this backend
// and allows secure cookies to pass between them!
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
// -------------------------------

app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRouter);
app.use('/api/tasks', taskRouter);

export default app;