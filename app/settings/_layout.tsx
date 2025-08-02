import { Stack } from 'expo-router';

export default function SettingsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // We're handling headers in individual screens
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="categories" />
    </Stack>
  );
}