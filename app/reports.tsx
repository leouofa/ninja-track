import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import StackedBarChart from '../components/StackedBarChart';
import TimeGroupingToggle from '../components/TimeGroupingToggle';
import { categoryUtils } from '../utils/categoryStorage';
import { ChartDataPoint, reportsUtils, TimeGrouping } from '../utils/reportsUtils';
import { taskCompletionUtils } from '../utils/taskCompletionStorage';
import { taskUtils } from '../utils/taskStorage';
import { createTextStyle, useTheme } from '../utils/theme';
import { Category, Task, TaskCompletion } from '../utils/types';

export default function Reports() {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const [categories, setCategories] = useState<Category[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskCompletions, setTaskCompletions] = useState<TaskCompletion[]>([]);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [selectedGrouping, setSelectedGrouping] = useState<TimeGrouping>('days');
  const [isLoading, setIsLoading] = useState(true);



  const loadData = async () => {
    try {
      setIsLoading(true);
      const [loadedCategories, loadedTasks, loadedCompletions] = await Promise.all([
        categoryUtils.loadCategories(),
        taskUtils.loadTasks(),
        taskCompletionUtils.loadTaskCompletions()
      ]);
      
      setCategories(loadedCategories);
      setTasks(loadedTasks);
      setTaskCompletions(loadedCompletions);
      
      // Generate chart data
      const periods = selectedGrouping === 'days' ? 5 : selectedGrouping === 'weeks' ? 12 : 6;

      
      const aggregatedData = reportsUtils.aggregateCompletionData(
        loadedCompletions,
        loadedTasks,
        loadedCategories,
        selectedGrouping,
        periods
      );
      

      
      setChartData(aggregatedData);
    } catch (error) {
      console.error('Error loading reports data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle grouping change
  const handleGroupingChange = async (grouping: TimeGrouping) => {
    setSelectedGrouping(grouping);
    setIsLoading(true);
    
    try {
      const periods = grouping === 'days' ? 5 : grouping === 'weeks' ? 12 : 6;
      const aggregatedData = reportsUtils.aggregateCompletionData(
        taskCompletions,
        tasks,
        categories,
        grouping,
        periods
      );
      setChartData(aggregatedData);
    } catch (error) {
      console.error('Error updating chart data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [selectedGrouping])
  );

  // Calculate summary statistics
  const totalCompletions = taskCompletions.length;
  const completionsThisPeriod = chartData.reduce((sum, dataPoint) => sum + dataPoint.total, 0);
  const averagePerPeriod = chartData.length > 0 ? completionsThisPeriod / chartData.length : 0;

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.text.muted} />
          <Text style={styles.loadingText}>Loading reports...</Text>
        </View>
      </View>
    );
  }

  // Show empty state if no data
  if (categories.length === 0 || tasks.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Ionicons name="analytics-outline" size={64} color={theme.colors.text.muted} />
          <Text style={styles.emptyTitle}>No Data Available</Text>
          <Text style={styles.emptySubtitle}>
            Create some categories and tasks, then start completing them to see your productivity reports.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Task Completion Reports</Text>
          <Text style={styles.subtitle}>
            Track your productivity across categories over time
          </Text>
        </View>

        {/* Time Period Toggle */}
        <TimeGroupingToggle
          selectedGrouping={selectedGrouping}
          onGroupingChange={handleGroupingChange}
        />

        {/* Summary Statistics */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalCompletions}</Text>
            <Text style={styles.statLabel}>Total Completions</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{completionsThisPeriod}</Text>
            <Text style={styles.statLabel}>
              {selectedGrouping === 'days' ? 'Last 5 Days' : 
               selectedGrouping === 'weeks' ? 'Last 12 Weeks' : 'Last 6 Months'}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{averagePerPeriod.toFixed(1)}</Text>
            <Text style={styles.statLabel}>
              Avg per {selectedGrouping.slice(0, -1)}
            </Text>
          </View>
        </View>

        {/* Chart */}
        <StackedBarChart data={chartData} height={320} />

        {/* Category Breakdown */}
        {chartData.length > 0 && (
          <View style={styles.categoryBreakdown}>
            <Text style={styles.breakdownTitle}>Category Performance</Text>
            {categories.map(category => {
              const totalForCategory = chartData.reduce((sum, dataPoint) => {
                const catData = dataPoint.categoryData.find(c => c.categoryId === category.id);
                return sum + (catData?.count || 0);
              }, 0);
              
              const percentage = completionsThisPeriod > 0 ? 
                (totalForCategory / completionsThisPeriod * 100) : 0;

              return (
                <View key={category.id} style={styles.categoryItem}>
                  <View style={styles.categoryHeader}>
                    <View style={[styles.categoryColor, { backgroundColor: category.color }]} />
                    <Text style={styles.categoryName}>{category.name}</Text>
                  </View>
                  <View style={styles.categoryStats}>
                    <Text style={styles.categoryCount}>{totalForCategory}</Text>
                    <Text style={styles.categoryPercentage}>({percentage.toFixed(1)}%)</Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    paddingBottom: theme.spacing.xl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...createTextStyle(theme, 'bodyBase', theme.colors.text.muted),
    marginTop: theme.spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.container,
  },
  emptyTitle: {
    ...createTextStyle(theme, 'h3'),
    marginTop: theme.spacing.lg,
    textAlign: 'center',
  },
  emptySubtitle: {
    ...createTextStyle(theme, 'bodyBase', theme.colors.text.secondary),
    textAlign: 'center',
    marginTop: theme.spacing.sm,
    lineHeight: 20,
  },
  header: {
    paddingHorizontal: theme.spacing.container,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  title: {
    ...createTextStyle(theme, 'h2'),
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    ...createTextStyle(theme, 'bodyBase', theme.colors.text.secondary),
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: theme.spacing.container,
    marginBottom: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.layout.borderRadius.large,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.subtle,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    ...createTextStyle(theme, 'h3'),
    fontWeight: '700',
    marginBottom: theme.spacing.xs,
  },
  statLabel: {
    ...createTextStyle(theme, 'bodySmall', theme.colors.text.secondary),
    textAlign: 'center',
  },
  categoryBreakdown: {
    marginHorizontal: theme.spacing.container,
    marginTop: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.layout.borderRadius.large,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.subtle,
  },
  breakdownTitle: {
    ...createTextStyle(theme, 'h4'),
    marginBottom: theme.spacing.lg,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: theme.spacing.md,
  },
  categoryName: {
    ...createTextStyle(theme, 'bodyLarge'),
    fontWeight: '500',
    flex: 1,
  },
  categoryStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryCount: {
    ...createTextStyle(theme, 'bodyLarge'),
    fontWeight: '600',
    marginRight: theme.spacing.xs,
  },
  categoryPercentage: {
    ...createTextStyle(theme, 'bodySmall', theme.colors.text.muted),
  },
});