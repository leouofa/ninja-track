export interface Category {
  id: string;
  name: string;
  color: string;
  createdAt: Date;
}

export interface Task {
  id: string;
  name: string;
  categoryId: string;
  createdAt: Date;
}

export interface TaskCompletion {
  id: string;
  taskId: string;
  date: string; // ISO date string (YYYY-MM-DD)
  completedAt: Date;
}