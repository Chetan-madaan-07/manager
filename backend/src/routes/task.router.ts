import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/authenticate';
import { TaskService } from '../services/task.service';

const taskRouter = Router();

taskRouter.use(authenticate);

// GET /api/tasks?date=YYYY-MM-DD
taskRouter.get('/', async (req: Request, res: Response): Promise<void> => {
  const date = (req.query.date as string) ?? new Date().toISOString().slice(0, 10);
  try {
    const tasks = await TaskService.getTasks(req.userId, date);
    res.status(200).json(tasks);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/tasks
taskRouter.post('/', async (req: Request, res: Response): Promise<void> => {
  const { title, date } = req.body as { title?: string; date?: string };
  const taskDate = date ?? new Date().toISOString().slice(0, 10);

  if (!title || title.trim().length === 0) {
    res.status(400).json({ error: 'Title is required' });
    return;
  }

  try {
    const task = await TaskService.createTask(req.userId, title, taskDate);
    res.status(201).json(task);
  } catch (err) {
    const message = err instanceof Error ? err.message : '';
    if (message.includes('empty') || message.includes('exceed')) {
      res.status(400).json({ error: message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// PATCH /api/tasks/:id/toggle
taskRouter.patch('/:id/toggle', async (req: Request, res: Response): Promise<void> => {
  try {
    const task = await TaskService.toggleTask(req.userId, req.params.id as string);
    res.status(200).json(task);
  } catch (err) {
    const message = err instanceof Error ? err.message : '';
    if (message.includes('not found')) {
      res.status(404).json({ error: 'Task not found' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// DELETE /api/tasks/:id
taskRouter.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    await TaskService.deleteTask(req.userId, req.params.id as string);
    res.status(204).send();
  } catch (err) {
    const message = err instanceof Error ? err.message : '';
    console.error('Delete error:', message, 'userId:', req.userId, 'taskId:', req.params.id);
    if (message.includes('not found')) {
      res.status(404).json({ error: 'Task not found' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

export default taskRouter;
