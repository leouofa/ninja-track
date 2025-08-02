import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { categoryUtils } from '../utils/categoryStorage';
import { Category } from '../utils/types';
import { useTheme, createTextStyle, createSpacing } from '../utils/theme';

export default function Home() {
  const { theme } = useTheme();
  const [categories, setCategories] = useState<Category[]>([]);

  const loadCategories = async () => {
    const loadedCategories = await categoryUtils.loadCategories();
    setCategories(loadedCategories);
  };

  // Reload categories when the screen is focused (user comes back from settings)
  useFocusEffect(
    React.useCallback(() => {
      loadCategories();
    }, [])
  );

  const styles = createStyles(theme);
  const spacing = createSpacing(theme);

  const renderCategoryItem = ({ item }: { item: Category }) => (
    <TouchableOpacity 
      style={styles.categoryCard}
      activeOpacity={0.98} // Per style guide - Scale down 98% on press
    >
      <View style={[styles.categoryColor, { backgroundColor: item.color }]} />
      <View style={styles.categoryInfo}>
        <Text style={styles.categoryName}>{item.name}</Text>
        <Text style={styles.categoryDate}>
          Created {item.createdAt.toLocaleDateString()}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={theme.colors.text.muted} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.subtitle}>Your productivity tracking companion</Text>
        
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
  subtitle: {
    ...createTextStyle(theme, 'bodyBase', theme.colors.text.secondary),
    textAlign: "center",
    marginBottom: theme.spacing.xxxl,
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
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.subtle,
    // Interactive card per style guide
    minHeight: theme.layout.touchTarget.minimum,
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
  categoryDate: {
    ...createTextStyle(theme, 'bodySmall', theme.colors.text.secondary),
  },
});
