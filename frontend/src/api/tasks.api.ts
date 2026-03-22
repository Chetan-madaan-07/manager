import { apiFetch } from './client';
import type { Task } from '../types';

export function getTasks(date: string): Promise<Task[]> {
  return apiFetch(`/api/tasks?date=${encodeURIComponent(date)}`);
}

export function createTask(title: string, date: string): Promise<Task> {
  return apiFetch('/api/tasks', {
    method: 'POST',
    body: JSON.stringify({ title, date }),
  });
}

export function toggleTask(id: string): Promise<Task> {
  return apiFetch(`/api/tasks/${encodeURIComponent(id)}/toggle`, {
    method: 'PATCH',
  });
}

export function deleteTask(id: string): Promise<void> {
  return apiFetch(`/api/tasks/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}
