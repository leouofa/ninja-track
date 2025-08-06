import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { categoryUtils } from '../utils/categoryStorage';
import { taskCompletionUtils } from '../utils/taskCompletionStorage';
import { taskUtils } from '../utils/taskStorage';
import { createSpacing, createTextStyle, useTheme } from '../utils/theme';
import { Category, Task, TaskCompletion } from '../utils/types';

export default function Home() {
  const { theme } = useTheme();
  const [categories, setCategories] = useState<Category[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskCompletions, setTaskCompletions] = useState<TaskCompletion[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const loadData = async () => {
    const [loadedCategories, loadedTasks, loadedCompletions] = await Promise.all([
      categoryUtils.loadCategories(),
      taskUtils.loadTasks(),
      taskCompletionUtils.loadTaskCompletions()
    ]);
    setCategories(loadedCategories);
    setTasks(loadedTasks);
    setTaskCompletions(loadedCompletions);
  };

  // Reload data when the screen is focused (user comes back from settings)
  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  const styles = createStyles(theme);
  const spacing = createSpacing(theme);

  const getTasksForCategory = (categoryId: string): Task[] => {
    return tasks.filter(task => task.categoryId === categoryId);
  };

  const isTaskCompleted = (taskId: string): boolean => {
    const dateString = selectedDate.toISOString().split('T')[0];
    return taskCompletions.some(
      completion => completion.taskId === taskId && completion.date === dateString
    );
  };

  const handleTaskToggle = async (task: Task) => {
    const newCompletionState = await taskCompletionUtils.toggleTaskCompletion(task.id, selectedDate);
    // Reload completions to update the UI
    const updatedCompletions = await taskCompletionUtils.loadTaskCompletions();
    setTaskCompletions(updatedCompletions);
  };

  const renderTaskItem = (task: Task) => {
    const isCompleted = isTaskCompleted(task.id);
    
    return (
      <TouchableOpacity 
        key={task.id} 
        style={styles.taskItem}
        onPress={() => handleTaskToggle(task)}
        activeOpacity={0.7}
      >
        <View style={[
          styles.taskCheckbox,
          isCompleted && styles.taskCheckboxCompleted
        ]}>
          {isCompleted && (
            <Ionicons name="checkmark" size={16} color={theme.colors.surface} />
          )}
        </View>
        <Text style={[
          styles.taskName,
          isCompleted && styles.taskNameCompleted
        ]}>
          {task.name}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderCategorySection = (category: Category) => {
    const categoryTasks = getTasksForCategory(category.id);

    return (
      <View key={category.id} style={styles.categorySection}>
        <View style={styles.categoryHeader}>
          <View style={[styles.categoryColor, { backgroundColor: category.color }]} />
          <Text style={styles.categoryName}>{category.name}</Text>
        </View>
        
        <View style={styles.tasksContainer}>
          {categoryTasks.length === 0 ? (
            <View style={styles.emptyTasksState}>
              <Ionicons name="add-circle-outline" size={32} color={theme.colors.text.muted} />
              <Text style={styles.emptyTasksTitle}>No tasks yet</Text>
              <Text style={styles.emptyTasksDescription}>
                Go to Settings → Tasks to add tasks for this category.
              </Text>
            </View>
          ) : (
            categoryTasks.map(renderTaskItem)
          )}
        </View>
      </View>
    );
  };

  const generateCalendarDays = () => {
    const days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      days.push(date);
    }
    
    return days;
  };

  const getDayLabel = (date: Date) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[date.getDay()];
  };

  const renderCalendarDay = (date: Date) => {
    const isSelected = date.toDateString() === selectedDate.toDateString();
    const isToday = date.toDateString() === new Date().toDateString();
    
    return (
      <View key={date.toDateString()} style={styles.calendarDayContainer}>
        <TouchableOpacity
          style={[
            styles.calendarDay,
            isSelected && styles.calendarDaySelected,
            isToday && styles.calendarDayToday
          ]}
          onPress={() => setSelectedDate(date)}
        >
          <Text style={[
            styles.calendarDayText,
            isSelected && styles.calendarDayTextSelected
          ]}>
            {date.getDate()}
          </Text>
        </TouchableOpacity>
        <Text style={styles.calendarDayLabel}>
          {getDayLabel(date)}
        </Text>
      </View>
    );
  };

  const CalendarComponent = () => {
    const calendarDays = generateCalendarDays();
    
    return (
      <View style={styles.calendarContainer}>
        <View style={styles.calendarDays}>
          {calendarDays.map(renderCalendarDay)}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.subtitle}>
            Last 7 days of activity.
          </Text>
        </View>
        
        <CalendarComponent />
        
        <ScrollView 
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.categoriesSection}>
            <View style={styles.sectionHeaderContainer}>
              <View style={styles.horizontalLine} />
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Tracked Categories</Text>
                <Text style={styles.categoryCount}>({categories.length})</Text>
              </View>
              <View style={styles.horizontalLine} />
            </View>
            
            {categories.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="folder-outline" size={48} color={theme.colors.text.muted} />
                <Text style={styles.emptyTitle}>No categories yet</Text>
                <Text style={styles.emptyDescription}>
                  Go to Settings to create your first category and start tracking!
                </Text>
              </View>
            ) : (
              <View style={styles.categoriesList}>
                {categories.map(renderCategorySection)}
              </View>
            )}
          </View>
        </ScrollView>
      </View>
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
    paddingHorizontal: theme.spacing.container,
    paddingTop: theme.spacing.section,
  },
  header: {
    paddingHorizontal: theme.spacing.container,
    paddingBottom: theme.spacing.md,
  },
  subtitle: {
    ...createTextStyle(theme, 'bodyBase', theme.colors.text.secondary),
    lineHeight: 20,
    textAlign: 'center',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: theme.spacing.xl,
  },
  categoriesSection: {
    minHeight: '100%',
  },
  sectionHeaderContainer: {
    marginVertical: theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing.md,
  },
  horizontalLine: {
    height: 1,
    backgroundColor: theme.colors.border,
    opacity: 0.3,
    marginHorizontal: theme.spacing.container,
  },
  sectionTitle: {
    ...createTextStyle(theme, 'h3'),
  },
  categoryCount: {
    ...createTextStyle(theme, 'bodyLarge', theme.colors.text.secondary),
    marginLeft: theme.spacing.sm,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: theme.spacing.xxxl + theme.spacing.sm,
    minHeight: 300,
  },
  emptyTitle: {
    ...createTextStyle(theme, 'h4', theme.colors.text.secondary),
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  emptyDescription: {
    ...createTextStyle(theme, 'bodyBase', theme.colors.text.muted),
    textAlign: "center",
    lineHeight: 22,
  },
  categoriesList: {
  },
  categorySection: {
    marginBottom: theme.spacing.xl,
  },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.lg,
  },
  categoryColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: theme.spacing.md,
  },
  categoryName: {
    ...createTextStyle(theme, 'h4'),
    fontWeight: '600',
  },
  tasksContainer: {
    paddingLeft: theme.spacing.lg,
  },
  taskItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.layout.borderRadius.medium,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    minHeight: theme.layout.touchTarget.minimum,
  },
  taskCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.border,
    marginRight: theme.spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
  },
  taskCheckboxCompleted: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  taskName: {
    ...createTextStyle(theme, 'bodyLarge'),
    flex: 1,
    fontWeight: '500',
  },
  taskNameCompleted: {
    textDecorationLine: 'line-through',
    color: theme.colors.text.muted,
  },
  calendarContainer: {
    marginBottom: theme.spacing.xxxl,
  },
  calendarDays: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.sm,
  },
  calendarDay: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  calendarDaySelected: {
    backgroundColor: theme.colors.primary,
  },
  calendarDayToday: {
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  calendarDayText: {
    ...createTextStyle(theme, 'bodyBase'),
    fontWeight: '600',
  },
  calendarDayTextSelected: {
    color: theme.colors.surface,
  },
  calendarDayContainer: {
    alignItems: 'center',
  },
  calendarDayLabel: {
    ...createTextStyle(theme, 'bodySmall', theme.colors.text.secondary),
    fontSize: 12,
    fontWeight: '500',
    marginTop: theme.spacing.xs,
  },
  emptyTasksState: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.layout.borderRadius.medium,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
  },
  emptyTasksTitle: {
    ...createTextStyle(theme, 'bodyLarge', theme.colors.text.secondary),
    fontWeight: '500',
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  emptyTasksDescription: {
    ...createTextStyle(theme, 'bodySmall', theme.colors.text.muted),
    textAlign: "center",
    lineHeight: 18,
  },
});
