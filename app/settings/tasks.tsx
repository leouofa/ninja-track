import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';
import { categoryUtils } from '../../utils/categoryStorage';
import { taskUtils } from '../../utils/taskStorage';
import { createTextStyle, useTheme } from '../../utils/theme';
import { Category, Task } from '../../utils/types';

export default function Tasks() {
  const { theme } = useTheme();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskCategoryId, setNewTaskCategoryId] = useState('');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editName, setEditName] = useState('');
  const [editCategoryId, setEditCategoryId] = useState('');
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showEditCategoryPicker, setShowEditCategoryPicker] = useState(false);
  
  const styles = createStyles(theme);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await Promise.all([loadTasks(), loadCategories()]);
  };

  const loadTasks = async () => {
    const loadedTasks = await taskUtils.loadTasks();
    setTasks(loadedTasks);
  };

  const loadCategories = async () => {
    const loadedCategories = await categoryUtils.loadCategories();
    setCategories(loadedCategories);
    // Set default category for new tasks
    if (loadedCategories.length > 0 && !newTaskCategoryId) {
      setNewTaskCategoryId(loadedCategories[0].id);
    }
  };

  const handleAddTask = async () => {
    if (newTaskName.trim() === '') {
      Alert.alert('Error', 'Please enter a task name');
      return;
    }

    if (!newTaskCategoryId) {
      Alert.alert('Error', 'Please select a category');
      return;
    }

    const result = await taskUtils.addTask(newTaskName, newTaskCategoryId);
    if (result) {
      await loadTasks();
      setNewTaskName('');
      // Keep the same category selected for easier bulk entry
    } else {
      Alert.alert('Error', 'Task name already exists in this category or is invalid');
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setEditName(task.name);
    setEditCategoryId(task.categoryId);
  };

  const handleUpdateTask = async () => {
    if (!editingTask) return;

    if (editName.trim() === '') {
      Alert.alert('Error', 'Please enter a task name');
      return;
    }

    if (!editCategoryId) {
      Alert.alert('Error', 'Please select a category');
      return;
    }

    const result = await taskUtils.updateTask(editingTask.id, editName, editCategoryId);
    if (result) {
      await loadTasks();
      setEditingTask(null);
      setEditName('');
      setEditCategoryId('');
    } else {
      Alert.alert('Error', 'Task name already exists in this category or is invalid');
    }
  };

  const handleDeleteTask = (task: Task) => {
    Alert.alert(
      'Delete Task',
      `Are you sure you want to delete "${task.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await taskUtils.deleteTask(task.id);
            await loadTasks();
          },
        },
      ]
    );
  };

  const formatNameAsUserTypes = (text: string) => {
    return taskUtils.formatTaskName(text);
  };

  const getCategoryById = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId);
  };

  const renderCategoryPicker = (selectedCategoryId: string, onCategorySelect: (categoryId: string) => void, onClose: () => void) => (
    <View style={styles.categoryPickerContainer}>
      <Text style={styles.categoryPickerLabel}>Select Category:</Text>
      <ScrollView style={styles.categoryPickerScroll} showsVerticalScrollIndicator={false}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryPickerOption,
              selectedCategoryId === category.id && styles.selectedCategoryOption,
            ]}
            onPress={() => {
              onCategorySelect(category.id);
              onClose();
            }}
          >
            <View style={[styles.categoryColor, { backgroundColor: category.color }]} />
            <Text style={styles.categoryPickerOptionText}>{category.name}</Text>
            {selectedCategoryId === category.id && (
              <Ionicons name="checkmark" size={20} color={theme.colors.accent} />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderCategorySelector = (selectedCategoryId: string, onPress: () => void) => {
    const selectedCategory = getCategoryById(selectedCategoryId);
    return (
      <TouchableOpacity style={styles.categorySelector} onPress={onPress}>
        <Text style={styles.categorySelectorLabel}>Category:</Text>
        <View style={styles.categorySelectorValue}>
          {selectedCategory && (
            <>
              <View style={[styles.categoryColor, { backgroundColor: selectedCategory.color }]} />
              <Text style={styles.categorySelectorText}>{selectedCategory.name}</Text>
            </>
          )}
          <Ionicons name="chevron-down" size={16} color={theme.colors.text.secondary} />
        </View>
      </TouchableOpacity>
    );
  };

  const renderTaskItem = ({ item, drag, isActive }: RenderItemParams<Task>) => {
    return (
      <View style={[styles.taskItem, isActive && { opacity: 0.9 }]}>
        <TouchableOpacity
          style={styles.dragHandle}
          onLongPress={drag}
          delayLongPress={120}
          activeOpacity={0.6}
        >
          <Ionicons name="reorder-three" size={20} color={theme.colors.text.secondary} />
        </TouchableOpacity>
        <View style={styles.taskInfo}>
          <View style={styles.taskHeader}>
            <Text style={styles.taskName}>{item.name}</Text>
          </View>
        </View>
        <View style={styles.taskActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleEditTask(item)}
            activeOpacity={0.98}
          >
                            <Ionicons name="pencil" size={16} color={theme.colors.text.secondary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDeleteTask(item)}
            activeOpacity={0.98}
          >
                            <Ionicons name="trash" size={16} color={theme.colors.text.secondary} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (categories.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.emptyState}>
            <Ionicons name="folder-outline" size={48} color={theme.colors.text.muted} />
            <Text style={styles.emptyTitle}>No categories found</Text>
            <Text style={styles.emptyDescription}>
              You need to create categories first before adding tasks.
            </Text>
            <Link href="/settings/categories" asChild>
              <TouchableOpacity
                style={styles.addButton}
                activeOpacity={0.98}
              >
                <Text style={styles.addButtonText}>Manage Categories</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <Text style={styles.sectionDescription}>
          Manage your tasks. Names cannot contain spaces (replaced with dashes) or hashtags.
        </Text>

        {/* Add New Task */}
        <View style={styles.addTaskForm}>
          <Text style={styles.formLabel}>Add New Task</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Enter task name"
            value={newTaskName}
            onChangeText={(text) => {
              const formatted = formatNameAsUserTypes(text);
              setNewTaskName(formatted);
            }}
            onSubmitEditing={handleAddTask}
            returnKeyType="done"
          />
          {renderCategorySelector(newTaskCategoryId, () => setShowCategoryPicker(true))}
          <TouchableOpacity 
            style={styles.addButton} 
            onPress={handleAddTask}
            activeOpacity={0.98}
          >
            <Text style={styles.addButtonText}>Add Task</Text>
          </TouchableOpacity>
        </View>

        {/* Tasks List */}
        <View style={styles.tasksList}>
          <Text style={styles.formLabel}>Your Tasks ({tasks.length})</Text>
          {tasks.length === 0 ? (
            <Text style={styles.emptyText}>No tasks yet. Add your first one above!</Text>
          ) : (
            <View>
              {categories.map((category) => {
                const tasksForCategory = tasks
                  .filter((t) => t.categoryId === category.id)
                  .sort((a, b) => a.order - b.order);
                if (tasksForCategory.length === 0) return null;
                return (
                  <View key={category.id} style={{ marginBottom: styles.formLabel.marginBottom }}>
                    <View style={styles.categoryHeaderRow}>
                      <View style={[styles.categoryColor, { backgroundColor: category.color }]} />
                      <Text style={styles.categoryHeaderText}>{category.name}</Text>
                    </View>
                    <DraggableFlatList
                      data={tasksForCategory}
                      keyExtractor={(item) => item.id}
                      renderItem={renderTaskItem}
                      onDragEnd={async ({ data }) => {
                        // Persist re-ordered tasks for this category
                        const updatedAll = await taskUtils.reorderTasksByIds(category.id, data.map((t) => t.id));
                        setTasks(updatedAll);
                      }}
                      activationDistance={12}
                      scrollEnabled={false}
                    />
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Category Picker Modal for New Task */}
      <Modal
        visible={showCategoryPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCategoryPicker(false)}
      >
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Category</Text>
            {renderCategoryPicker(newTaskCategoryId, setNewTaskCategoryId, () => setShowCategoryPicker(false))}
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton, styles.singleActionButton]}
              onPress={() => setShowCategoryPicker(false)}
              activeOpacity={0.98}
            >
              <Text style={styles.cancelButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Edit Task Modal */}
      <Modal
        visible={!!editingTask && !showEditCategoryPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setEditingTask(null)}
      >
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Task</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Task name"
              value={editName}
              onChangeText={(text) => {
                const formatted = formatNameAsUserTypes(text);
                setEditName(formatted);
              }}
              onSubmitEditing={handleUpdateTask}
              returnKeyType="done"
            />
            {renderCategorySelector(editCategoryId, () => setShowEditCategoryPicker(true))}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setEditingTask(null)}
                activeOpacity={0.98}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleUpdateTask}
                activeOpacity={0.98}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Category Picker Modal for Edit Task */}
      <Modal
        visible={showEditCategoryPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowEditCategoryPicker(false)}
      >
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Category</Text>
            {renderCategoryPicker(editCategoryId, setEditCategoryId, () => setShowEditCategoryPicker(false))}
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton, styles.singleActionButton]}
              onPress={() => setShowEditCategoryPicker(false)}
              activeOpacity={0.98}
            >
              <Text style={styles.cancelButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  sectionDescription: {
    ...createTextStyle(theme, 'bodySmall', theme.colors.text.secondary),
    marginBottom: theme.spacing.xl,
  },
  addTaskForm: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.layout.borderRadius.large,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.subtle,
  },
  formLabel: {
    ...createTextStyle(theme, 'bodyLarge'),
    fontWeight: "600",
    marginBottom: theme.spacing.md,
  },
  textInput: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.layout.borderRadius.medium,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm + theme.spacing.xs,
    ...createTextStyle(theme, 'bodyBase'),
    backgroundColor: theme.colors.surface,
    marginBottom: theme.spacing.lg,
    minHeight: theme.layout.touchTarget.recommended,
  },
  categorySelector: {
    marginBottom: theme.spacing.lg,
  },
  categorySelectorLabel: {
    ...createTextStyle(theme, 'bodyBase'),
    fontWeight: "500",
    marginBottom: theme.spacing.sm,
  },
  categorySelectorValue: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.layout.borderRadius.medium,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm + theme.spacing.xs,
    backgroundColor: theme.colors.surface,
    minHeight: theme.layout.touchTarget.recommended,
    justifyContent: "space-between",
  },
  categorySelectorText: {
    ...createTextStyle(theme, 'bodyBase'),
    flex: 1,
    marginLeft: theme.spacing.sm,
  },
  addButton: {
    backgroundColor: theme.colors.text.primary,
    borderRadius: theme.layout.borderRadius.medium,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm + theme.spacing.xs,
    alignItems: "center",
    minHeight: theme.layout.touchTarget.recommended,
    justifyContent: "center",
  },
  addButtonText: {
    ...createTextStyle(theme, 'button', theme.colors.surface),
    fontWeight: "600",
  },
  tasksList: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.layout.borderRadius.large,
    padding: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.xl,
    ...theme.shadows.subtle,
  },
  emptyText: {
    ...createTextStyle(theme, 'bodyBase', theme.colors.text.secondary),
    textAlign: "center",
    fontStyle: "italic",
    paddingVertical: theme.spacing.xl,
  },
  taskItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    minHeight: theme.layout.touchTarget.minimum + theme.spacing.lg,
  },
  taskInfo: {
    flex: 1,
  },
  taskHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  taskName: {
    ...createTextStyle(theme, 'bodyBase'),
    fontWeight: "600",
    marginBottom: 0,
  },
  taskCategory: {
    flexDirection: "row",
    alignItems: "center",
  },
  taskCategoryText: {
    ...createTextStyle(theme, 'bodySmall', theme.colors.text.secondary),
    marginLeft: theme.spacing.xs,
  },
  categoryColor: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 10,
  },
  categoryHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryHeaderText: {
    ...createTextStyle(theme, 'bodyLarge'),
    fontWeight: '600',
    lineHeight: 20,
  },
  taskActions: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  dragHandle: {
    paddingVertical: theme.spacing.sm,
    paddingRight: theme.spacing.sm,
    paddingLeft: 0,
    marginRight: theme.spacing.sm,
    marginLeft: -2,
  },
  actionButton: {
    padding: theme.spacing.sm,
    borderRadius: theme.layout.borderRadius.small + 2,
    backgroundColor: theme.colors.secondaryBackground,
    minHeight: theme.layout.touchTarget.recommended,
    minWidth: theme.layout.touchTarget.recommended,
    justifyContent: "center",
    alignItems: "center",
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
    marginBottom: theme.spacing.xl,
  },
  modal: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
    // elevation is for Android; harmless on iOS
    elevation: 9999,
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.layout.borderRadius.large,
    padding: theme.spacing.xl,
    margin: theme.spacing.xl,
    width: "90%",
    maxWidth: 400,
    ...theme.shadows.subtle,
    overflow: 'visible',
  },
  modalTitle: {
    ...createTextStyle(theme, 'h4'),
    marginBottom: theme.spacing.lg,
    textAlign: "center",
  },
  modalActions: {
    flexDirection: "row",
    gap: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
  modalButton: {
    flex: 1,
    borderRadius: theme.layout.borderRadius.medium,
    paddingVertical: theme.spacing.sm + theme.spacing.xs,
    alignItems: "center",
    justifyContent: "center",
    minHeight: theme.layout.touchTarget.minimum,
  },
  singleActionButton: {
    flex: undefined,
    alignSelf: 'stretch',
  },
  cancelButton: {
    backgroundColor: theme.colors.secondaryBackground,
  },
  cancelButtonText: {
    ...createTextStyle(theme, 'button', theme.colors.text.secondary),
    fontWeight: "600",
  },
  saveButton: {
    backgroundColor: theme.colors.text.primary,
  },
  saveButtonText: {
    ...createTextStyle(theme, 'button', theme.colors.surface),
    fontWeight: "600",
  },
  categoryPickerContainer: {
    marginBottom: theme.spacing.lg,
  },
  categoryPickerLabel: {
    ...createTextStyle(theme, 'bodyBase'),
    fontWeight: "500",
    marginBottom: theme.spacing.sm,
  },
  categoryPickerScroll: {
    maxHeight: 200,
  },
  categoryPickerOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.layout.borderRadius.medium,
    marginBottom: theme.spacing.xs,
  },
  selectedCategoryOption: {
    backgroundColor: theme.colors.secondaryBackground,
  },
  categoryPickerOptionText: {
    ...createTextStyle(theme, 'bodyBase'),
    marginLeft: theme.spacing.sm,
    flex: 1,
  },
});