import pool from '../db';
import { Task } from '../types';

function mapRow(row: Record<string, unknown>): Task {
  const rawDate = row.task_date;
  let taskDate = '';

  if (rawDate instanceof Date) {
    // FIX: Extract the local date, avoiding the UTC timezone shift!
    const yyyy = rawDate.getFullYear();
    const mm = String(rawDate.getMonth() + 1).padStart(2, '0');
    const dd = String(rawDate.getDate()).padStart(2, '0');
    taskDate = `${yyyy}-${mm}-${dd}`;
  } else {
    taskDate = String(rawDate).slice(0, 10);
  }

  return {
    id: row.id as string,
    userId: row.user_id as string,
    title: row.title as string,
    description: row.description as string | undefined,
    taskTime: row.task_time as string | undefined,
    priority: row.priority as 'low' | 'medium' | 'high',
    completed: row.completed as boolean,
    taskDate,
    createdAt: row.created_at as string,
  };
}

export const TaskService = {
  // Updated signature to accept new fields
  async createTask(
    userId: string,
    title: string,
    date: string,
    description?: string,
    taskTime?: string,
    priority: 'low' | 'medium' | 'high' = 'medium'
  ): Promise<Task> {
    const trimmed = title.trim();
    if (trimmed.length === 0) {
      throw new Error('Title cannot be empty');
    }
    if (trimmed.length > 255) {
      throw new Error('Title cannot exceed 255 characters');
    }

    // Updated SQL query to insert new fields
    const result = await pool.query(
      `INSERT INTO tasks (user_id, title, task_date, description, task_time, priority, completed)
       VALUES ($1, $2, $3, $4, $5, $6, false)
       RETURNING *`,
      [userId, trimmed, date, description || null, taskTime || null, priority]
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
    const result = await pool.query(
      `DELETE FROM tasks WHERE id = $1 AND user_id = $2`,
      [taskId, userId]
    );
    if ((result.rowCount ?? 0) === 0) {
      const check = await pool.query(`SELECT id FROM tasks WHERE id = $1`, [taskId]);
      if (check.rows.length === 0) throw new Error('Task not found');
      throw new Error('Task not found');
    }
  },
  // Add this inside the TaskService object:
  async updateTask(
    userId: string,
    taskId: string,
    title: string,
    date: string,
    description?: string,
    taskTime?: string,
    priority: 'low' | 'medium' | 'high' = 'medium'
  ): Promise<Task> {
    const trimmed = title.trim();
    if (trimmed.length === 0) throw new Error('Title cannot be empty');
    if (trimmed.length > 255) throw new Error('Title cannot exceed 255 characters');

    // First, make sure the task actually exists and belongs to this user
    const check = await pool.query(`SELECT id FROM tasks WHERE id = $1 AND user_id = $2`, [taskId, userId]);
    if (check.rows.length === 0) throw new Error('Task not found');

    // Update the task and return the new row
    const result = await pool.query(
      `UPDATE tasks 
       SET title = $1, task_date = $2, description = $3, task_time = $4, priority = $5
       WHERE id = $6 AND user_id = $7
       RETURNING *`,
      [trimmed, date, description || null, taskTime || null, priority, taskId, userId]
    );

    return mapRow(result.rows[0]);
  },
};

