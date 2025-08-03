import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { categoryUtils } from '../utils/categoryStorage';
import { taskUtils } from '../utils/taskStorage';
import { createSpacing, createTextStyle, useTheme } from '../utils/theme';
import { Category, Task } from '../utils/types';

export default function Home() {
  const { theme } = useTheme();
  const [categories, setCategories] = useState<Category[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const loadData = async () => {
    const [loadedCategories, loadedTasks] = await Promise.all([
      categoryUtils.loadCategories(),
      taskUtils.loadTasks()
    ]);
    setCategories(loadedCategories);
    setTasks(loadedTasks);
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

  const renderTaskItem = (task: Task) => (
    <View key={task.id} style={styles.taskItem}>
      <View style={styles.taskDot} />
      <Text style={styles.taskName}>{task.name}</Text>
    </View>
  );

  const renderCategoryItem = ({ item }: { item: Category }) => {
    const categoryTasks = getTasksForCategory(item.id);
    return (
      <View style={styles.categoryCard}>
        <View style={styles.categoryHeader}>
          <View style={[styles.categoryColor, { backgroundColor: item.color }]} />
          <View style={styles.categoryInfo}>
            <Text style={styles.categoryName}>{item.name}</Text>
            <Text style={styles.categoryMeta}>
              {categoryTasks.length} {categoryTasks.length === 1 ? 'task' : 'tasks'} • Created {item.createdAt.toLocaleDateString()}
            </Text>
          </View>
          <TouchableOpacity style={styles.categoryMenuButton}>
            <Ionicons name="ellipsis-horizontal" size={20} color={theme.colors.text.muted} />
          </TouchableOpacity>
        </View>
        
        {categoryTasks.length > 0 && (
          <View style={styles.tasksContainer}>
            {categoryTasks.map(renderTaskItem)}
          </View>
        )}
        
        {categoryTasks.length === 0 && (
          <Text style={styles.noTasksText}>No tasks yet</Text>
        )}
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

  const renderCalendarDay = (date: Date) => {
    const isSelected = date.toDateString() === selectedDate.toDateString();
    const isToday = date.toDateString() === new Date().toDateString();
    
    return (
      <TouchableOpacity
        key={date.toDateString()}
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
        <CalendarComponent />
        
        <View style={styles.categoriesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Categories</Text>
            <Text style={styles.categoryCount}>({categories.length})</Text>
          </View>
          
          {categories.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="folder-outline" size={48} color={theme.colors.text.muted} />
              <Text style={styles.emptyTitle}>No categories yet</Text>
              <Text style={styles.emptyDescription}>
                Go to Profile to create your first category and start tracking!
              </Text>
            </View>
          ) : (
            <FlatList
              data={categories}
              renderItem={renderCategoryItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.categoriesList}
            />
          )}
        </View>
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

  categoriesSection: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.lg,
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
    paddingBottom: theme.spacing.xl,
  },
  categoryCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.layout.borderRadius.large,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.subtle,
    // Interactive card per style guide
    minHeight: theme.layout.touchTarget.minimum,
  },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  categoryMenuButton: {
    padding: theme.spacing.xs,
    borderRadius: theme.layout.borderRadius.small,
  },
  categoryColor: {
    width: theme.spacing.xxxl,
    height: theme.spacing.xxxl,
    borderRadius: theme.spacing.lg,
    marginRight: theme.spacing.lg,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    ...createTextStyle(theme, 'bodyLarge'),
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
  },
  categoryMeta: {
    ...createTextStyle(theme, 'bodySmall', theme.colors.text.secondary),
  },
  tasksContainer: {
    paddingLeft: theme.spacing.md,
    borderLeftWidth: 2,
    borderLeftColor: theme.colors.border,
    marginLeft: theme.spacing.lg,
  },
  taskItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing.xs,
  },
  taskDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.text.muted,
    marginRight: theme.spacing.sm,
  },
  taskName: {
    ...createTextStyle(theme, 'bodyBase', theme.colors.text.secondary),
    flex: 1,
  },
  noTasksText: {
    ...createTextStyle(theme, 'bodySmall', theme.colors.text.muted),
    fontStyle: 'italic',
    marginLeft: theme.spacing.lg,
    paddingVertical: theme.spacing.xs,
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
});
