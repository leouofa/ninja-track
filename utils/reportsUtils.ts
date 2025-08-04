import { Category, Task, TaskCompletion } from './types';

export type TimeGrouping = 'days' | 'weeks' | 'months';

export interface ChartDataPoint {
  period: string;
  date: Date;
  categoryData: {
    categoryId: string;
    categoryName: string;
    categoryColor: string;
    count: number;
  }[];
  total: number;
}

export const reportsUtils = {
  // Format date for different groupings
  formatPeriodLabel: (date: Date, grouping: TimeGrouping): string => {
    switch (grouping) {
      case 'days':
        return date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        });
      case 'weeks':
        // Show the Monday of the week in M/D format
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay() + 1);
        return weekStart.toLocaleDateString('en-US', { 
          month: 'numeric', 
          day: 'numeric' 
        });
      case 'months':
        return date.toLocaleDateString('en-US', { 
          month: 'numeric', 
          year: '2-digit' 
        });
      default:
        return date.toLocaleDateString();
    }
  },

  // Get the period key for grouping
  getPeriodKey: (date: Date, grouping: TimeGrouping): string => {
    switch (grouping) {
      case 'days':
        return date.toISOString().split('T')[0]; // YYYY-MM-DD
      case 'weeks':
        // Get the Monday of the week
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay() + 1);
        return weekStart.toISOString().split('T')[0];
      case 'months':
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      default:
        return date.toISOString().split('T')[0];
    }
  },

  // Generate date range for the last N periods
  generateDateRange: (grouping: TimeGrouping, periods: number = 30): Date[] => {
    const dates: Date[] = [];
    const today = new Date();
    
    for (let i = periods - 1; i >= 0; i--) {
      const date = new Date(today);
      
      switch (grouping) {
        case 'days':
          date.setDate(today.getDate() - i);
          break;
        case 'weeks':
          date.setDate(today.getDate() - (i * 7));
          // Set to Monday of the week
          date.setDate(date.getDate() - date.getDay() + 1);
          break;
        case 'months':
          date.setMonth(today.getMonth() - i);
          date.setDate(1); // First day of month
          break;
      }
      
      dates.push(date);
    }
    
    return dates;
  },

  // Aggregate task completions into chart data
  aggregateCompletionData: (
    completions: TaskCompletion[],
    tasks: Task[],
    categories: Category[],
    grouping: TimeGrouping,
    periods: number = 30
  ): ChartDataPoint[] => {


    // Create a map of tasks by ID for quick lookup
    const taskMap = new Map(tasks.map(task => [task.id, task]));
    const categoryMap = new Map(categories.map(cat => [cat.id, cat]));

    // Group completions by period and category
    const groupedData = new Map<string, Map<string, number>>();

    // Initialize all periods with zero counts
    const dateRange = reportsUtils.generateDateRange(grouping, periods);

    dateRange.forEach(date => {
      const periodKey = reportsUtils.getPeriodKey(date, grouping);
      if (!groupedData.has(periodKey)) {
        groupedData.set(periodKey, new Map());
      }
    });

    // Process completions
    completions.forEach(completion => {
      const task = taskMap.get(completion.taskId);
      if (!task) return; // Skip if task not found

      const completionDate = new Date(completion.date);
      const periodKey = reportsUtils.getPeriodKey(completionDate, grouping);
      
      if (!groupedData.has(periodKey)) {
        groupedData.set(periodKey, new Map());
      }

      const periodData = groupedData.get(periodKey)!;
      const currentCount = periodData.get(task.categoryId) || 0;
      periodData.set(task.categoryId, currentCount + 1);
    });

    // Convert to chart data format
    const chartData: ChartDataPoint[] = [];

    dateRange.forEach(date => {
      const periodKey = reportsUtils.getPeriodKey(date, grouping);
      const periodData = groupedData.get(periodKey) || new Map();

      const categoryData = categories.map(category => ({
        categoryId: category.id,
        categoryName: category.name,
        categoryColor: category.color,
        count: periodData.get(category.id) || 0
      }));

      const total = categoryData.reduce((sum, cat) => sum + cat.count, 0);

      chartData.push({
        period: reportsUtils.formatPeriodLabel(date, grouping),
        date,
        categoryData,
        total
      });
    });



    return chartData;
  }
};