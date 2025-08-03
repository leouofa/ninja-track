import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { categoryUtils } from '../../utils/categoryStorage';
import { createTextStyle, useTheme } from '../../utils/theme';
import { Category } from '../../utils/types';

const PREDEFINED_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
  '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43',
  '#FC427B', '#0ABDE3', '#C44569', '#F8B500', '#6C5CE7'
];

export default function Categories() {
  const { theme } = useTheme();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState(PREDEFINED_COLORS[0]);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');
  
  const styles = createStyles(theme);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const loadedCategories = await categoryUtils.loadCategories();
    setCategories(loadedCategories);
  };

  const handleAddCategory = async () => {
    if (newCategoryName.trim() === '') {
      Alert.alert('Error', 'Please enter a category name');
      return;
    }

    const result = await categoryUtils.addCategory(newCategoryName, newCategoryColor);
    if (result) {
      await loadCategories();
      setNewCategoryName('');
      setNewCategoryColor(PREDEFINED_COLORS[0]);
    } else {
      Alert.alert('Error', 'Category name already exists or is invalid');
    }
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setEditName(category.name);
    setEditColor(category.color);
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory) return;

    if (editName.trim() === '') {
      Alert.alert('Error', 'Please enter a category name');
      return;
    }

    const result = await categoryUtils.updateCategory(editingCategory.id, editName, editColor);
    if (result) {
      await loadCategories();
      setEditingCategory(null);
      setEditName('');
      setEditColor('');
    } else {
      Alert.alert('Error', 'Category name already exists or is invalid');
    }
  };

  const handleDeleteCategory = (category: Category) => {
    Alert.alert(
      'Delete Category',
      `Are you sure you want to delete "${category.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await categoryUtils.deleteCategory(category.id);
            await loadCategories();
          },
        },
      ]
    );
  };

  const formatNameAsUserTypes = (text: string) => {
    return categoryUtils.formatCategoryName(text);
  };

  const renderColorPicker = (selectedColor: string, onColorSelect: (color: string) => void) => (
    <View style={styles.colorPicker}>
      <Text style={styles.colorPickerLabel}>Color:</Text>
      <View style={styles.colorOptions}>
        {PREDEFINED_COLORS.map((color) => (
          <TouchableOpacity
            key={color}
            style={[
              styles.colorOption,
              { backgroundColor: color },
              selectedColor === color && styles.selectedColor,
            ]}
            onPress={() => onColorSelect(color)}
          />
        ))}
      </View>
    </View>
  );

  const renderCategoryItem = ({ item }: { item: Category }) => (
    <View style={styles.categoryItem}>
      <View style={[styles.categoryColor, { backgroundColor: item.color }]} />
      <Text style={styles.categoryName}>{item.name}</Text>
      <View style={styles.categoryActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleEditCategory(item)}
          activeOpacity={0.98}
        >
          <Ionicons name="pencil" size={16} color={theme.colors.accent} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDeleteCategory(item)}
          activeOpacity={0.98}
        >
          <Ionicons name="trash" size={16} color={theme.colors.semantic.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <Text style={styles.sectionDescription}>
          Manage your tracking categories. Names cannot contain spaces (replaced with dashes) or hashtags.
        </Text>

        {/* Add New Category */}
        <View style={styles.addCategoryForm}>
          <Text style={styles.formLabel}>Add New Category</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Enter category name"
            value={newCategoryName}
            onChangeText={(text) => {
              const formatted = formatNameAsUserTypes(text);
              setNewCategoryName(formatted);
            }}
            onSubmitEditing={handleAddCategory}
            returnKeyType="done"
          />
          {renderColorPicker(newCategoryColor, setNewCategoryColor)}
          <TouchableOpacity 
            style={styles.addButton} 
            onPress={handleAddCategory}
            activeOpacity={0.98}
          >
            <Text style={styles.addButtonText}>Add Category</Text>
          </TouchableOpacity>
        </View>

        {/* Categories List */}
        <View style={styles.categoriesList}>
          <Text style={styles.formLabel}>Your Categories ({categories.length})</Text>
          {categories.length === 0 ? (
            <Text style={styles.emptyText}>No categories yet. Add your first one above!</Text>
          ) : (
            <FlatList
              data={categories}
              renderItem={renderCategoryItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          )}
        </View>
      </ScrollView>

      {/* Edit Category Modal */}
      {editingCategory && (
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Category</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Category name"
              value={editName}
              onChangeText={(text) => {
                const formatted = formatNameAsUserTypes(text);
                setEditName(formatted);
              }}
              onSubmitEditing={handleUpdateCategory}
              returnKeyType="done"
            />
            {renderColorPicker(editColor, setEditColor)}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setEditingCategory(null)}
                activeOpacity={0.98}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleUpdateCategory}
                activeOpacity={0.98}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
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
  addCategoryForm: {
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
    paddingVertical: theme.spacing.sm + theme.spacing.xs, // 14pt vertical per style guide
    ...createTextStyle(theme, 'bodyBase'),
    backgroundColor: theme.colors.surface,
    marginBottom: theme.spacing.lg,
    minHeight: theme.layout.touchTarget.recommended, // 48pt per style guide
  },
  colorPicker: {
    marginBottom: theme.spacing.lg,
  },
  colorPickerLabel: {
    ...createTextStyle(theme, 'bodyBase'),
    fontWeight: "500",
    marginBottom: theme.spacing.sm,
  },
  colorOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedColor: {
    borderColor: theme.colors.accent,
    borderWidth: 3,
  },
  addButton: {
    backgroundColor: theme.colors.accent,
    borderRadius: theme.layout.borderRadius.medium,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm + theme.spacing.xs, // 14pt per style guide
    alignItems: "center",
    minHeight: theme.layout.touchTarget.recommended, // 48pt per style guide
    justifyContent: "center",
  },
  addButtonText: {
    ...createTextStyle(theme, 'button', theme.colors.surface),
    fontWeight: "600",
  },
  categoriesList: {
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
  categoryItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    minHeight: theme.layout.touchTarget.minimum + theme.spacing.lg, // List item per style guide
  },
  categoryColor: {
    width: theme.spacing.xxl,
    height: theme.spacing.xxl,
    borderRadius: theme.spacing.md,
    marginRight: theme.spacing.md,
  },
  categoryName: {
    flex: 1,
    ...createTextStyle(theme, 'bodyBase'),
  },
  categoryActions: {
    flexDirection: "row",
    gap: theme.spacing.sm,
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
  modal: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.layout.borderRadius.large,
    padding: theme.spacing.xl,
    margin: theme.spacing.xl,
    width: "90%",
    maxWidth: 400,
    ...theme.shadows.subtle,
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
    paddingVertical: theme.spacing.sm + theme.spacing.xs, // 14pt per style guide
    alignItems: "center",
    justifyContent: "center",
    minHeight: theme.layout.touchTarget.minimum,
  },
  cancelButton: {
    backgroundColor: theme.colors.secondaryBackground,
  },
  cancelButtonText: {
    ...createTextStyle(theme, 'button', theme.colors.text.secondary),
    fontWeight: "600",
  },
  saveButton: {
    backgroundColor: theme.colors.accent,
  },
  saveButtonText: {
    ...createTextStyle(theme, 'button', theme.colors.surface),
    fontWeight: "600",
  },
});