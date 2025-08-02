import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { categoryUtils } from '../utils/categoryStorage';
import { Category } from '../utils/types';

export default function Home() {
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

  const renderCategoryItem = ({ item }: { item: Category }) => (
    <TouchableOpacity style={styles.categoryCard}>
      <View style={[styles.categoryColor, { backgroundColor: item.color }]} />
      <View style={styles.categoryInfo}>
        <Text style={styles.categoryName}>{item.name}</Text>
        <Text style={styles.categoryDate}>
          Created {item.createdAt.toLocaleDateString()}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome to Ninja Track</Text>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.subtitle}>Your productivity tracking companion</Text>
        
        <View style={styles.categoriesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Categories</Text>
            <Text style={styles.categoryCount}>({categories.length})</Text>
          </View>
          
          {categories.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="folder-outline" size={48} color="#C7C7CC" />
              <Text style={styles.emptyTitle}>No categories yet</Text>
              <Text style={styles.emptyDescription}>
                Go to Settings to create your first category and start tracking!
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
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1D1D1F",
    textAlign: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  subtitle: {
    fontSize: 16,
    color: "#8E8E93",
    textAlign: "center",
    marginBottom: 30,
  },
  categoriesSection: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1D1D1F",
  },
  categoryCount: {
    fontSize: 18,
    color: "#8E8E93",
    marginLeft: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#8E8E93",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    color: "#C7C7CC",
    textAlign: "center",
    lineHeight: 22,
  },
  categoriesList: {
    paddingBottom: 20,
  },
  categoryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E5EA",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  categoryColor: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 16,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1D1D1F",
    marginBottom: 4,
  },
  categoryDate: {
    fontSize: 14,
    color: "#8E8E93",
  },
});
