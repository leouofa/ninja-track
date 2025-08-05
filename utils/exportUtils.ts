import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { categoryUtils } from './categoryStorage';
import { taskCompletionUtils } from './taskCompletionStorage';
import { taskUtils } from './taskStorage';
import { Category, Task } from './types';

export interface ExportData {
  date: string;
  category: string;
  color: string;
  task: string;
}

export const exportUtils = {
  // Generate CSV content from task completion data
  generateCSVContent: async (): Promise<string> => {
    try {
      // Load all data
      const [completions, tasks, categories] = await Promise.all([
        taskCompletionUtils.loadTaskCompletions(),
        taskUtils.loadTasks(),
        categoryUtils.loadCategories()
      ]);

      // Create maps for quick lookup
      const taskMap = new Map<string, Task>();
      const categoryMap = new Map<string, Category>();

      tasks.forEach(task => taskMap.set(task.id, task));
      categories.forEach(category => categoryMap.set(category.id, category));

      // Generate export data
      const exportData: ExportData[] = [];

      completions.forEach(completion => {
        const task = taskMap.get(completion.taskId);
        if (!task) return; // Skip if task not found

        const category = categoryMap.get(task.categoryId);
        if (!category) return; // Skip if category not found

        exportData.push({
          date: completion.date,
          category: category.name,
          color: category.color,
          task: task.name
        });
      });

      // Sort by date
      exportData.sort((a, b) => a.date.localeCompare(b.date));

      // Generate CSV content
      const csvHeader = 'date,category,color,task\n';
      const csvRows = exportData.map(row => 
        `${row.date},"${row.category}","${row.color}","${row.task}"`
      ).join('\n');

      return csvHeader + csvRows;
    } catch (error) {
      console.error('Error generating CSV content:', error);
      throw new Error('Failed to generate export data');
    }
  },

  // Export task completion data to CSV file
  exportToCSV: async (): Promise<void> => {
    try {
      const csvContent = await exportUtils.generateCSVContent();
      
      // Generate filename with current timestamp
      const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      const filename = `ninja-track-data-${timestamp}.csv`;
      const fileUri = FileSystem.documentDirectory + filename;

      // Write file
      await FileSystem.writeAsStringAsync(fileUri, csvContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      // Check if sharing is available
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/csv',
          dialogTitle: 'Export Ninja Track Data',
        });
      } else {
        throw new Error('Sharing is not available on this platform');
      }
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      throw error;
    }
  }
};