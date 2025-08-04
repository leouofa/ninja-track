import { Stack } from 'expo-router';
import { useTheme } from '../../utils/theme';

export default function SettingsLayout() {
  const { theme } = useTheme();
  
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: theme.colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
        },
        headerTintColor: theme.colors.text.primary,
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: 'bold',
          color: theme.colors.text.primary,
        },
        headerBackTitleVisible: true,
        headerBackTitle: 'Settings',
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{
          title: 'Settings',
          headerShown: true,
        }}
      />
      <Stack.Screen 
        name="categories" 
        options={{
          title: 'Categories',
          headerBackTitle: 'Settings',
        }}
      />
      <Stack.Screen 
        name="tasks" 
        options={{
          title: 'Tasks',
          headerBackTitle: 'Settings',
        }}
      />
      <Stack.Screen 
        name="reminders" 
        options={{
          title: 'Reminders',
          headerBackTitle: 'Settings',
        }}
      />
    </Stack>
  );
}