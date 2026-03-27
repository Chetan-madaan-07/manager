import { apiFetch } from './client';
import type { Task, CreateTaskPayload } from '../types';

export function getTasks(date: string): Promise<Task[]> {
  return apiFetch(`/api/tasks?date=${encodeURIComponent(date)}`);
}

// UPDATED: Now accepts the payload object instead of individual arguments
export function createTask(payload: CreateTaskPayload): Promise<Task> {
  return apiFetch('/api/tasks', {
    method: 'POST',
    body: JSON.stringify(payload),
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
// Add this export to the bottom of the file
export function updateTask(id: string, payload: CreateTaskPayload): Promise<Task> {
  return apiFetch(`/api/tasks/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}
