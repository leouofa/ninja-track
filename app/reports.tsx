import { StyleSheet, Text, View } from "react-native";
import { useTheme, createTextStyle } from '../utils/theme';
import { Ionicons } from '@expo/vector-icons';

export default function Reports() {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.comingSoonSection}>
          <Ionicons name="analytics-outline" size={64} color={theme.colors.text.muted} />
          <Text style={styles.subtitle}>Your productivity reports and analytics will appear here.</Text>
          <Text style={styles.placeholder}>Coming soon...</Text>
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
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: theme.spacing.container,
  },
  comingSoonSection: {
    alignItems: "center",
    paddingHorizontal: theme.spacing.xl,
  },
  subtitle: {
    ...createTextStyle(theme, 'bodyBase', theme.colors.text.secondary),
    textAlign: "center",
    marginTop: theme.spacing.xxl,
    marginBottom: theme.spacing.lg,
    lineHeight: 22,
  },
  placeholder: {
    ...createTextStyle(theme, 'bodySmall', theme.colors.text.muted),
    fontStyle: "italic",
  },
});