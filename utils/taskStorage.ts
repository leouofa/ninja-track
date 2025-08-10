import AsyncStorage from '@react-native-async-storage/async-storage';
import { taskCompletionUtils } from './taskCompletionStorage';
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

  // Load all tasks, migrating and normalizing per-category order
  loadTasks: async (): Promise<Task[]> => {
    try {
      const tasksJson = await AsyncStorage.getItem(TASKS_STORAGE_KEY);
      if (tasksJson) {
        const parsed: any[] = JSON.parse(tasksJson);
        let tasks: Task[] = parsed.map((task: any) => ({
          ...task,
          order: typeof task.order === 'number' ? task.order : -1,
          createdAt: new Date(task.createdAt)
        }));

        // Migration: assign order within each category if missing
        let needsMigration = tasks.some(t => t.order < 0);
        if (needsMigration) {
          const byCategory = new Map<string, Task[]>();
          for (const t of tasks) {
            const arr = byCategory.get(t.categoryId) ?? [];
            arr.push(t);
            byCategory.set(t.categoryId, arr);
          }
          const migrated: Task[] = [];
          for (const [_, arr] of byCategory) {
            const sortedByCreated = arr
              .slice()
              .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
              .map((t, index) => ({ ...t, order: index }));
            migrated.push(...sortedByCreated);
          }
          tasks = migrated;
          await taskUtils.saveTasks(tasks);
        }
        // Ensure normalized order before returning
        tasks = await taskUtils.normalizeOrders(tasks);
        return tasks;
      }
      return [];
    } catch (error) {
      console.error('Error loading tasks:', error);
      return [];
    }
  },

  // Load tasks for a specific category (sorted by order)
  loadTasksByCategory: async (categoryId: string): Promise<Task[]> => {
    const allTasks = await taskUtils.loadTasks();
    return allTasks
      .filter(task => task.categoryId === categoryId)
      .sort((a, b) => a.order - b.order);
  },

  // Save all tasks (after normalizing per-category order)
  saveTasks: async (tasks: Task[]): Promise<void> => {
    try {
      const normalized = await taskUtils.normalizeOrders(tasks);
      const tasksJson = JSON.stringify(normalized);
      await AsyncStorage.setItem(TASKS_STORAGE_KEY, tasksJson);
    } catch (error) {
      console.error('Error saving tasks:', error);
    }
  },

  // Normalize order per category; helper used by save and load
  normalizeOrders: async (tasks: Task[]): Promise<Task[]> => {
    const byCategory = new Map<string, Task[]>();
    for (const t of tasks) {
      const arr = byCategory.get(t.categoryId) ?? [];
      arr.push(t);
      byCategory.set(t.categoryId, arr);
    }
    const normalized: Task[] = [];
    for (const [_, arr] of byCategory) {
      const sorted = arr
        .slice()
        .sort((a, b) => a.order - b.order)
        .map((t, index) => ({ ...t, order: index }));
      normalized.push(...sorted);
    }
    return normalized;
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

    const tasksInCategory = tasks.filter(t => t.categoryId === categoryId);
    const newTask: Task = {
      id: taskUtils.generateId(),
      name: formattedName,
      categoryId,
      order: tasksInCategory.length,
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

    const originalCategoryId = tasks[taskIndex].categoryId;
    tasks[taskIndex] = {
      ...tasks[taskIndex],
      name: formattedName,
      categoryId
    };

    // If category changed, re-normalize orders for both categories
    if (originalCategoryId !== categoryId) {
      // When moving to a new category, place at end
      const maxOrderInTarget = Math.max(
        -1,
        ...tasks.filter(t => t.categoryId === categoryId).map(t => t.order)
      );
      tasks[taskIndex].order = maxOrderInTarget + 1;
      // Normalize will fix gaps in original category on save
    }

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

    // Clean up task completions
    await taskCompletionUtils.deleteCompletionsForTask(id);
    await taskUtils.saveTasks(filteredTasks);
    return true;
  },

  // Delete all tasks for a category (when category is deleted)
  deleteTasksByCategory: async (categoryId: string): Promise<void> => {
    const tasks = await taskUtils.loadTasks();
    const tasksToDelete = tasks.filter(task => task.categoryId === categoryId);
    
    // Clean up task completions for all tasks in this category
    for (const task of tasksToDelete) {
      await taskCompletionUtils.deleteCompletionsForTask(task.id);
    }
    
    const filteredTasks = tasks.filter(task => task.categoryId !== categoryId);
    await taskUtils.saveTasks(filteredTasks);
  },

  // Reorder tasks within a category by ordered task IDs
  reorderTasksByIds: async (categoryId: string, orderedIds: string[]): Promise<Task[]> => {
    const tasks = await taskUtils.loadTasks();
    const inCategory = tasks.filter(t => t.categoryId === categoryId);
    const idToTask = new Map(inCategory.map(t => [t.id, t] as const));
    const seen = new Set<string>();
    const ordered: Task[] = [];
    for (const id of orderedIds) {
      const task = idToTask.get(id);
      if (task && !seen.has(id)) {
        ordered.push(task);
        seen.add(id);
      }
    }
    // Append any remaining in-category tasks not included
    for (const task of inCategory) {
      if (!seen.has(task.id)) ordered.push(task);
    }
    // Set orders and merge back with out-of-category tasks
    const updatedInCategory = ordered.map((t, index) => ({ ...t, order: index }));
    const outOfCategory = tasks.filter(t => t.categoryId !== categoryId);
    const merged = [...outOfCategory, ...updatedInCategory];
    await taskUtils.saveTasks(merged);
    return merged;
  },

  // Move a task up/down within its category
  moveTaskWithinCategory: async (id: string, delta: number): Promise<Task[]> => {
    const tasks = await taskUtils.loadTasks();
    const index = tasks.findIndex(t => t.id === id);
    if (index === -1) return tasks;
    const categoryId = tasks[index].categoryId;
    const inCategory = tasks
      .filter(t => t.categoryId === categoryId)
      .sort((a, b) => a.order - b.order);
    const currentIndex = inCategory.findIndex(t => t.id === id);
    const targetIndex = currentIndex + delta;
    if (targetIndex < 0 || targetIndex >= inCategory.length) return tasks;
    const tmp = inCategory[currentIndex];
    inCategory[currentIndex] = inCategory[targetIndex];
    inCategory[targetIndex] = tmp;
    const updatedInCategory = inCategory.map((t, i) => ({ ...t, order: i }));
    const outOfCategory = tasks.filter(t => t.categoryId !== categoryId);
    const merged = [...outOfCategory, ...updatedInCategory];
    await taskUtils.saveTasks(merged);
    return merged;
  }
};