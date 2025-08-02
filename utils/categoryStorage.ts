import AsyncStorage from '@react-native-async-storage/async-storage';
import { Category } from './types';

const CATEGORIES_STORAGE_KEY = '@ninja_track_categories';

export const categoryUtils = {
  // Validate and format category name
  formatCategoryName: (name: string): string => {
    // Replace spaces with dashes and remove hashtags
    return name
      .replace(/\s+/g, '-')
      .replace(/#/g, '')
      .toLowerCase()
      .trim();
  },

  // Validate category name
  isValidCategoryName: (name: string): boolean => {
    const formatted = categoryUtils.formatCategoryName(name);
    return formatted.length > 0 && !formatted.includes(' ') && !formatted.includes('#');
  },

  // Generate unique ID
  generateId: (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  },

  // Load all categories
  loadCategories: async (): Promise<Category[]> => {
    try {
      const categoriesJson = await AsyncStorage.getItem(CATEGORIES_STORAGE_KEY);
      if (categoriesJson) {
        const categories = JSON.parse(categoriesJson);
        // Convert createdAt strings back to Date objects
        return categories.map((cat: any) => ({
          ...cat,
          createdAt: new Date(cat.createdAt)
        }));
      }
      return [];
    } catch (error) {
      console.error('Error loading categories:', error);
      return [];
    }
  },

  // Save all categories
  saveCategories: async (categories: Category[]): Promise<void> => {
    try {
      const categoriesJson = JSON.stringify(categories);
      await AsyncStorage.setItem(CATEGORIES_STORAGE_KEY, categoriesJson);
    } catch (error) {
      console.error('Error saving categories:', error);
    }
  },

  // Add a new category
  addCategory: async (name: string, color: string): Promise<Category | null> => {
    const formattedName = categoryUtils.formatCategoryName(name);
    
    if (!categoryUtils.isValidCategoryName(name)) {
      return null;
    }

    const categories = await categoryUtils.loadCategories();
    
    // Check if category with this name already exists
    const existingCategory = categories.find(cat => cat.name === formattedName);
    if (existingCategory) {
      return null;
    }

    const newCategory: Category = {
      id: categoryUtils.generateId(),
      name: formattedName,
      color,
      createdAt: new Date()
    };

    categories.push(newCategory);
    await categoryUtils.saveCategories(categories);
    return newCategory;
  },

  // Update an existing category
  updateCategory: async (id: string, name: string, color: string): Promise<Category | null> => {
    const formattedName = categoryUtils.formatCategoryName(name);
    
    if (!categoryUtils.isValidCategoryName(name)) {
      return null;
    }

    const categories = await categoryUtils.loadCategories();
    const categoryIndex = categories.findIndex(cat => cat.id === id);
    
    if (categoryIndex === -1) {
      return null;
    }

    // Check if another category with this name already exists
    const existingCategory = categories.find(cat => cat.name === formattedName && cat.id !== id);
    if (existingCategory) {
      return null;
    }

    categories[categoryIndex] = {
      ...categories[categoryIndex],
      name: formattedName,
      color
    };

    await categoryUtils.saveCategories(categories);
    return categories[categoryIndex];
  },

  // Delete a category
  deleteCategory: async (id: string): Promise<boolean> => {
    const categories = await categoryUtils.loadCategories();
    const filteredCategories = categories.filter(cat => cat.id !== id);
    
    if (filteredCategories.length === categories.length) {
      return false; // Category not found
    }

    await categoryUtils.saveCategories(filteredCategories);
    return true;
  }
};