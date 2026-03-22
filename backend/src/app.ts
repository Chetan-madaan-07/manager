import express from 'express';
import cookieParser from 'cookie-parser';
import authRouter from './routes/auth.router';
import taskRouter from './routes/task.router';

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRouter);
app.use('/api/tasks', taskRouter);

export default app;
