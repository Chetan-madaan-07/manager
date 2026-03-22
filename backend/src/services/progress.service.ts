import { Task, ProgressStats } from '../types';

export function computeProgress(tasks: Task[]): ProgressStats {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed === true).length;
  const remaining = tasks.filter((t) => t.completed === false).length;
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
  return { total, completed, remaining, percentage };
}
