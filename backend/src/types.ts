export interface User {
  id: string;
  email: string;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  createdAt: string;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;                 // NEW
  taskTime?: string;                    // NEW (Will be stored as HH:mm:ss)
  priority: 'low' | 'medium' | 'high';  // NEW
  completed: boolean;
  taskDate: string; // YYYY-MM-DD
  createdAt: string;
}

export interface ProgressStats {
  total: number;
  completed: number;
  remaining: number;
  percentage: number;
}

export interface ProgressStats {
  total: number;
  completed: number;
  remaining: number;
  percentage: number;
}
