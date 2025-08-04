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
  daysOfWeek: number[]; // Array of days: 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  time: string; // HH:MM format (24-hour)
  createdAt: Date;
  updatedAt: Date;
}