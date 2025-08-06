import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import React from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { exportUtils } from '../../utils/exportUtils';
import { createTextStyle, useTheme } from '../../utils/theme';

interface SettingsMenuItem {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  route?: string;
  action?: () => void;
}

export default function Settings() {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const styles = createStyles(theme);

  const handleExport = async () => {
    try {
      await exportUtils.exportToCSV();
      Alert.alert(
        'Export Successful',
        'Your task completion data has been exported successfully.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert(
        'Export Failed',
        'There was an error exporting your data. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const SETTINGS_MENU_ITEMS: SettingsMenuItem[] = [
    {
      id: 'categories',
      title: 'Categories',
      description: 'Manage your tracking categories',
      icon: 'folder-outline',
      route: '/settings/categories',
    },
    {
      id: 'tasks',
      title: 'Tasks',
      description: 'Manage your tasks within categories',
      icon: 'list-outline',
      route: '/settings/tasks',
    },
    {
      id: 'reminders',
      title: 'Reminders',
      description: 'Set up task tracking reminders',
      icon: 'notifications-outline',
      route: '/settings/reminders',
    },
    {
      id: 'export',
      title: 'Export Data',
      description: 'Export your task completion data to CSV',
      icon: 'download-outline',
      action: handleExport,
    },
  ];

  const renderMenuItem = (item: SettingsMenuItem) => {
    if (item.route) {
      return (
        <Link key={item.id} href={item.route as any} asChild>
          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.98}
          >
            <View style={styles.menuItemIcon}>
              <Ionicons name={item.icon} size={24} color={theme.colors.accent} />
            </View>
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemTitle}>{item.title}</Text>
              <Text style={styles.menuItemDescription}>{item.description}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.text.muted} />
          </TouchableOpacity>
        </Link>
      );
    } else {
      return (
        <TouchableOpacity
          key={item.id}
          style={styles.menuItem}
          activeOpacity={0.98}
          onPress={item.action}
        >
          <View style={styles.menuItemIcon}>
            <Ionicons name={item.icon} size={24} color={theme.colors.accent} />
          </View>
          <View style={styles.menuItemContent}>
            <Text style={styles.menuItemTitle}>{item.title}</Text>
            <Text style={styles.menuItemDescription}>{item.description}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.text.muted} />
        </TouchableOpacity>
      );
    }
  };

  const renderThemeToggle = () => (
    <View style={styles.menuItem}>
      <View style={styles.menuItemIcon}>
        <Ionicons 
          name={isDarkMode ? "sunny" : "moon"} 
          size={24} 
          color={theme.colors.accent} 
        />
      </View>
      <View style={styles.menuItemContent}>
        <Text style={styles.menuItemTitle}>Theme</Text>
        <Text style={styles.menuItemDescription}>
          {isDarkMode ? "Dark mode" : "Light mode"}
        </Text>
      </View>
      <Switch
        value={isDarkMode}
        onValueChange={toggleTheme}
        trackColor={{ 
          false: theme.colors.border, 
          true: theme.colors.accent 
        }}
        thumbColor={isDarkMode ? theme.colors.surface : theme.colors.surface}
        ios_backgroundColor={theme.colors.border}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <Text style={styles.subtitle}>
          Configure your Ninja Track preferences and account settings.
        </Text>

        <View style={styles.menuSection}>
          {SETTINGS_MENU_ITEMS.map(renderMenuItem)}
          {renderThemeToggle()}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Ninja Track v1.0.0</Text>
        </View>
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
    paddingHorizontal: theme.spacing.container,
    paddingTop: theme.spacing.section,
  },
  subtitle: {
    ...createTextStyle(theme, 'bodyBase', theme.colors.text.secondary),
    textAlign: "center",
    marginBottom: theme.spacing.xxxl,
    lineHeight: 22,
  },
  menuSection: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.layout.borderRadius.large,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: "hidden",
    ...theme.shadows.subtle,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    minHeight: theme.layout.touchTarget.minimum + theme.spacing.lg, // List item per style guide
  },
  menuItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.secondaryBackground,
    justifyContent: "center",
    alignItems: "center",
    marginRight: theme.spacing.md,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemTitle: {
    ...createTextStyle(theme, 'bodyLarge'),
    fontWeight: "600",
    marginBottom: theme.spacing.xs / 2,
  },
  menuItemDescription: {
    ...createTextStyle(theme, 'bodySmall', theme.colors.text.secondary),
  },
  footer: {
    marginTop: theme.spacing.xxxl + theme.spacing.sm,
    paddingVertical: theme.spacing.xl,
    alignItems: "center",
  },
  footerText: {
    ...createTextStyle(theme, 'bodySmall', theme.colors.text.muted),
  },
});