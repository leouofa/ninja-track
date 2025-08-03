import AsyncStorage from '@react-native-async-storage/async-storage';
import { TaskCompletion } from './types';

const TASK_COMPLETIONS_STORAGE_KEY = '@ninja_track_task_completions';

export const taskCompletionUtils = {
  // Generate unique ID
  generateId: (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  },

  // Load all task completions
  loadTaskCompletions: async (): Promise<TaskCompletion[]> => {
    try {
      const completionsJson = await AsyncStorage.getItem(TASK_COMPLETIONS_STORAGE_KEY);
      if (completionsJson) {
        const completions = JSON.parse(completionsJson);
        // Convert completedAt strings back to Date objects
        return completions.map((completion: any) => ({
          ...completion,
          completedAt: new Date(completion.completedAt)
        }));
      }
      return [];
    } catch (error) {
      console.error('Error loading task completions:', error);
      return [];
    }
  },

  // Save all task completions
  saveTaskCompletions: async (completions: TaskCompletion[]): Promise<void> => {
    try {
      const completionsJson = JSON.stringify(completions);
      await AsyncStorage.setItem(TASK_COMPLETIONS_STORAGE_KEY, completionsJson);
    } catch (error) {
      console.error('Error saving task completions:', error);
    }
  },

  // Get completions for a specific date
  getCompletionsForDate: async (date: Date): Promise<TaskCompletion[]> => {
    const dateString = date.toISOString().split('T')[0]; // Get YYYY-MM-DD format
    const allCompletions = await taskCompletionUtils.loadTaskCompletions();
    return allCompletions.filter(completion => completion.date === dateString);
  },

  // Check if a task is completed on a specific date
  isTaskCompletedOnDate: async (taskId: string, date: Date): Promise<boolean> => {
    const dateString = date.toISOString().split('T')[0];
    const completions = await taskCompletionUtils.getCompletionsForDate(date);
    return completions.some(completion => completion.taskId === taskId);
  },

  // Complete a task on a specific date
  completeTask: async (taskId: string, date: Date): Promise<TaskCompletion> => {
    const dateString = date.toISOString().split('T')[0];
    const completions = await taskCompletionUtils.loadTaskCompletions();
    
    // Check if already completed
    const existingCompletion = completions.find(
      completion => completion.taskId === taskId && completion.date === dateString
    );
    
    if (existingCompletion) {
      return existingCompletion;
    }

    const newCompletion: TaskCompletion = {
      id: taskCompletionUtils.generateId(),
      taskId,
      date: dateString,
      completedAt: new Date()
    };

    completions.push(newCompletion);
    await taskCompletionUtils.saveTaskCompletions(completions);
    return newCompletion;
  },

  // Uncomplete a task on a specific date
  uncompleteTask: async (taskId: string, date: Date): Promise<boolean> => {
    const dateString = date.toISOString().split('T')[0];
    const completions = await taskCompletionUtils.loadTaskCompletions();
    
    const filteredCompletions = completions.filter(
      completion => !(completion.taskId === taskId && completion.date === dateString)
    );
    
    if (filteredCompletions.length === completions.length) {
      return false; // No completion found to remove
    }

    await taskCompletionUtils.saveTaskCompletions(filteredCompletions);
    return true;
  },

  // Toggle task completion for a specific date
  toggleTaskCompletion: async (taskId: string, date: Date): Promise<boolean> => {
    const isCompleted = await taskCompletionUtils.isTaskCompletedOnDate(taskId, date);
    
    if (isCompleted) {
      await taskCompletionUtils.uncompleteTask(taskId, date);
      return false;
    } else {
      await taskCompletionUtils.completeTask(taskId, date);
      return true;
    }
  },

  // Delete all completions for a specific task (when task is deleted)
  deleteCompletionsForTask: async (taskId: string): Promise<void> => {
    const completions = await taskCompletionUtils.loadTaskCompletions();
    const filteredCompletions = completions.filter(completion => completion.taskId !== taskId);
    await taskCompletionUtils.saveTaskCompletions(filteredCompletions);
  }
};