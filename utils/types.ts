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

export interface ReminderSettings {
  id: string;
  enabled: boolean;
  time: string; // Time in format "HH:MM" (24-hour)
  createdAt: Date;
  updatedAt: Date;
}