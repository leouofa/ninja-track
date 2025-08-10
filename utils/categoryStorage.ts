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

  // Load all categories (sorted by order). Performs a one-time migration if order is missing.
  loadCategories: async (): Promise<Category[]> => {
    try {
      const categoriesJson = await AsyncStorage.getItem(CATEGORIES_STORAGE_KEY);
      if (categoriesJson) {
        const parsed: any[] = JSON.parse(categoriesJson);
        let categories: Category[] = parsed.map((cat: any) => ({
          ...cat,
          // If order is missing, will be migrated below. Use -1 sentinel pre-migration.
          order: typeof cat.order === 'number' ? cat.order : -1,
          createdAt: new Date(cat.createdAt)
        }));

        const needsOrderMigration = categories.some((cat) => cat.order < 0);
        if (needsOrderMigration) {
          // Assign order based on createdAt (oldest first)
          const migrated = [...categories]
            .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
            .map((cat, index) => ({ ...cat, order: index }));
          categories = migrated;
          // Persist migrated order
          await categoryUtils.saveCategories(categories);
        }

        // Always return sorted by order
        return [...categories].sort((a, b) => a.order - b.order);
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
      // Normalize order indexes to be sequential starting at 0 before save
      const normalized = [...categories]
        .sort((a, b) => a.order - b.order)
        .map((cat, index) => ({ ...cat, order: index }));
      const categoriesJson = JSON.stringify(normalized);
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
      order: categories.length,
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
  },

  // Reorder categories by an array of category IDs. IDs not present will be appended in original relative order.
  reorderCategoriesByIds: async (orderedIds: string[]): Promise<Category[]> => {
    const categories = await categoryUtils.loadCategories();
    const idToCategory = new Map(categories.map(c => [c.id, c] as const));
    const seen = new Set<string>();

    const ordered: Category[] = [];
    for (const id of orderedIds) {
      const cat = idToCategory.get(id);
      if (cat && !seen.has(id)) {
        ordered.push(cat);
        seen.add(id);
      }
    }
    // Append any categories not included in orderedIds, preserving their current order
    for (const cat of categories) {
      if (!seen.has(cat.id)) {
        ordered.push(cat);
      }
    }

    // Assign sequential order and save
    const normalized = ordered.map((cat, index) => ({ ...cat, order: index }));
    await categoryUtils.saveCategories(normalized);
    return normalized;
  },

  // Move a category by delta (-1 for up, +1 for down)
  moveCategory: async (id: string, delta: number): Promise<Category[]> => {
    const categories = await categoryUtils.loadCategories();
    const sorted = [...categories].sort((a, b) => a.order - b.order);
    const currentIndex = sorted.findIndex(c => c.id === id);
    if (currentIndex === -1) return sorted;
    const targetIndex = currentIndex + delta;
    if (targetIndex < 0 || targetIndex >= sorted.length) return sorted;
    const temp = sorted[currentIndex];
    sorted[currentIndex] = sorted[targetIndex];
    sorted[targetIndex] = temp;
    const normalized = sorted.map((cat, index) => ({ ...cat, order: index }));
    await categoryUtils.saveCategories(normalized);
    return normalized;
  }
};