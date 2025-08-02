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
import { Category } from '../../utils/types';

const PREDEFINED_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
  '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43',
  '#FC427B', '#0ABDE3', '#C44569', '#F8B500', '#6C5CE7'
];

export default function Categories() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState(PREDEFINED_COLORS[0]);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');

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
        >
          <Ionicons name="pencil" size={16} color="#007AFF" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDeleteCategory(item)}
        >
          <Ionicons name="trash" size={16} color="#FF3B30" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Categories</Text>
        <View style={styles.placeholder} />
      </View>
      
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
          />
          {renderColorPicker(newCategoryColor, setNewCategoryColor)}
          <TouchableOpacity style={styles.addButton} onPress={handleAddCategory}>
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
            />
            {renderColorPicker(editColor, setEditColor)}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setEditingCategory(null)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleUpdateCategory}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1D1D1F",
  },
  placeholder: {
    width: 32, // Same width as back button for centering
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionDescription: {
    fontSize: 14,
    color: "#8E8E93",
    marginBottom: 20,
  },
  addCategoryForm: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  formLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1D1D1F",
    marginBottom: 12,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#E5E5EA",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#FFFFFF",
    marginBottom: 16,
  },
  colorPicker: {
    marginBottom: 16,
  },
  colorPickerLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1D1D1F",
    marginBottom: 8,
  },
  colorOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedColor: {
    borderColor: "#007AFF",
    borderWidth: 3,
  },
  addButton: {
    backgroundColor: "#007AFF",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  categoriesList: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E5E5EA",
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "#8E8E93",
    textAlign: "center",
    fontStyle: "italic",
    paddingVertical: 20,
  },
  categoryItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F7",
  },
  categoryColor: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 12,
  },
  categoryName: {
    flex: 1,
    fontSize: 16,
    color: "#1D1D1F",
  },
  categoryActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: "#F2F2F7",
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
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    margin: 20,
    width: "90%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1D1D1F",
    marginBottom: 16,
    textAlign: "center",
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#F2F2F7",
  },
  cancelButtonText: {
    color: "#8E8E93",
    fontSize: 16,
    fontWeight: "600",
  },
  saveButton: {
    backgroundColor: "#007AFF",
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});