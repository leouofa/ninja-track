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