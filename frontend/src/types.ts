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
  taskTime?: string;                    // NEW
  priority: 'low' | 'medium' | 'high';  // NEW
  completed: boolean;
  taskDate: string;
  createdAt: string;
}

// NEW: A clean interface for creating tasks from our upcoming Modal
export interface CreateTaskPayload {
  title: string;
  date: string;
  description?: string;
  taskTime?: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface ProgressStats {
  total: number;
  completed: number;
  remaining: number;
  percentage: number;
}
