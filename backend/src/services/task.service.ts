import pool from '../db';
import { Task } from '../types';

function mapRow(row: Record<string, unknown>): Task {
  const rawDate = row.task_date;
  const taskDate =
    rawDate instanceof Date
      ? rawDate.toISOString().slice(0, 10)
      : String(rawDate).slice(0, 10);

  return {
    id: row.id as string,
    userId: row.user_id as string,
    title: row.title as string,
    completed: row.completed as boolean,
    taskDate,
    createdAt: row.created_at as string,
  };
}

export const TaskService = {
  async createTask(userId: string, title: string, date: string): Promise<Task> {
    const trimmed = title.trim();
    if (trimmed.length === 0) {
      throw new Error('Title cannot be empty');
    }
    if (trimmed.length > 255) {
      throw new Error('Title cannot exceed 255 characters');
    }

    const result = await pool.query(
      `INSERT INTO tasks (user_id, title, task_date, completed)
       VALUES ($1, $2, $3, false)
       RETURNING *`,
      [userId, trimmed, date]
    );

    return mapRow(result.rows[0]);
  },

  async getTasks(userId: string, date: string): Promise<Task[]> {
    const result = await pool.query(
      `SELECT * FROM tasks
       WHERE user_id = $1 AND task_date = $2
       ORDER BY created_at ASC`,
      [userId, date]
    );

    return result.rows.map(mapRow);
  },

  async toggleTask(userId: string, taskId: string): Promise<Task> {
    const fetch = await pool.query(
      `SELECT * FROM tasks WHERE id = $1`,
      [taskId]
    );

    const task = fetch.rows[0];
    if (!task || task.user_id !== userId) {
      throw new Error('Task not found');
    }

    const update = await pool.query(
      `UPDATE tasks SET completed = $1 WHERE id = $2 RETURNING *`,
      [!task.completed, taskId]
    );

    return mapRow(update.rows[0]);
  },

  async deleteTask(userId: string, taskId: string): Promise<void> {
    // Try with ownership check first, fall back to just ID
    const result = await pool.query(
      `DELETE FROM tasks WHERE id = $1 AND user_id = $2`,
      [taskId, userId]
    );
    if ((result.rowCount ?? 0) === 0) {
      // Check if task exists at all (for better error message)
      const check = await pool.query(`SELECT id FROM tasks WHERE id = $1`, [taskId]);
      if (check.rows.length === 0) throw new Error('Task not found');
      throw new Error('Task not found'); // exists but wrong user
    }
  },
};
