export interface User {
  id: string;
  email: string;
  createdAt: string;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  completed: boolean;
  taskDate: string;
  createdAt: string;
}

export interface ProgressStats {
  total: number;
  completed: number;
  remaining: number;
  percentage: number;
}
