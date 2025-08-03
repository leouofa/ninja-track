import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task } from './types';

const TASKS_STORAGE_KEY = '@ninja_track_tasks';

export const taskUtils = {
  // Validate and format task name
  formatTaskName: (name: string): string => {
    // Replace spaces with dashes and remove hashtags
    return name
      .replace(/\s+/g, '-')
      .replace(/#/g, '')
      .toLowerCase()
      .trim();
  },

  // Validate task name
  isValidTaskName: (name: string): boolean => {
    const formatted = taskUtils.formatTaskName(name);
    return formatted.length > 0 && !formatted.includes(' ') && !formatted.includes('#');
  },

  // Generate unique ID
  generateId: (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  },

  // Load all tasks
  loadTasks: async (): Promise<Task[]> => {
    try {
      const tasksJson = await AsyncStorage.getItem(TASKS_STORAGE_KEY);
      if (tasksJson) {
        const tasks = JSON.parse(tasksJson);
        // Convert createdAt strings back to Date objects
        return tasks.map((task: any) => ({
          ...task,
          createdAt: new Date(task.createdAt)
        }));
      }
      return [];
    } catch (error) {
      console.error('Error loading tasks:', error);
      return [];
    }
  },

  // Load tasks for a specific category
  loadTasksByCategory: async (categoryId: string): Promise<Task[]> => {
    const allTasks = await taskUtils.loadTasks();
    return allTasks.filter(task => task.categoryId === categoryId);
  },

  // Save all tasks
  saveTasks: async (tasks: Task[]): Promise<void> => {
    try {
      const tasksJson = JSON.stringify(tasks);
      await AsyncStorage.setItem(TASKS_STORAGE_KEY, tasksJson);
    } catch (error) {
      console.error('Error saving tasks:', error);
    }
  },

  // Add a new task
  addTask: async (name: string, categoryId: string): Promise<Task | null> => {
    const formattedName = taskUtils.formatTaskName(name);
    
    if (!taskUtils.isValidTaskName(name)) {
      return null;
    }

    const tasks = await taskUtils.loadTasks();
    
    // Check if task with this name already exists in the same category
    const existingTask = tasks.find(task => task.name === formattedName && task.categoryId === categoryId);
    if (existingTask) {
      return null;
    }

    const newTask: Task = {
      id: taskUtils.generateId(),
      name: formattedName,
      categoryId,
      createdAt: new Date()
    };

    tasks.push(newTask);
    await taskUtils.saveTasks(tasks);
    return newTask;
  },

  // Update an existing task
  updateTask: async (id: string, name: string, categoryId: string): Promise<Task | null> => {
    const formattedName = taskUtils.formatTaskName(name);
    
    if (!taskUtils.isValidTaskName(name)) {
      return null;
    }

    const tasks = await taskUtils.loadTasks();
    const taskIndex = tasks.findIndex(task => task.id === id);
    
    if (taskIndex === -1) {
      return null;
    }

    // Check if another task with this name already exists in the same category
    const existingTask = tasks.find(task => 
      task.name === formattedName && 
      task.categoryId === categoryId && 
      task.id !== id
    );
    if (existingTask) {
      return null;
    }

    tasks[taskIndex] = {
      ...tasks[taskIndex],
      name: formattedName,
      categoryId
    };

    await taskUtils.saveTasks(tasks);
    return tasks[taskIndex];
  },

  // Delete a task
  deleteTask: async (id: string): Promise<boolean> => {
    const tasks = await taskUtils.loadTasks();
    const filteredTasks = tasks.filter(task => task.id !== id);
    
    if (filteredTasks.length === tasks.length) {
      return false; // Task not found
    }

    await taskUtils.saveTasks(filteredTasks);
    return true;
  },

  // Delete all tasks for a category (when category is deleted)
  deleteTasksByCategory: async (categoryId: string): Promise<void> => {
    const tasks = await taskUtils.loadTasks();
    const filteredTasks = tasks.filter(task => task.categoryId !== categoryId);
    await taskUtils.saveTasks(filteredTasks);
  }
};