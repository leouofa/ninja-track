import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { TimeGrouping } from '../utils/reportsUtils';
import { createTextStyle, useTheme } from '../utils/theme';

interface TimeGroupingToggleProps {
  selectedGrouping: TimeGrouping;
  onGroupingChange: (grouping: TimeGrouping) => void;
}

const TimeGroupingToggle: React.FC<TimeGroupingToggleProps> = ({
  selectedGrouping,
  onGroupingChange
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const options: { value: TimeGrouping; label: string }[] = [
    { value: 'days', label: 'Days' },
    { value: 'weeks', label: 'Weeks' },
    { value: 'months', label: 'Months' }
  ];

  return (
    <View style={styles.container}>
      {options.map((option, index) => {
        const isSelected = selectedGrouping === option.value;
        const isFirst = index === 0;
        const isLast = index === options.length - 1;

        return (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.option,
              isSelected && styles.selectedOption,
              isFirst && styles.firstOption,
              isLast && styles.lastOption,
            ]}
            onPress={() => onGroupingChange(option.value)}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.optionText,
              isSelected && styles.selectedOptionText
            ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: theme.colors.background,
    borderRadius: theme.layout.borderRadius.medium,
    padding: 2,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginHorizontal: theme.spacing.container,
    marginBottom: theme.spacing.lg,
  },
  option: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.layout.borderRadius.small,
    minHeight: theme.layout.touchTarget.minimum,
  },
  selectedOption: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.subtle,
  },
  firstOption: {
    borderTopLeftRadius: theme.layout.borderRadius.medium - 2,
    borderBottomLeftRadius: theme.layout.borderRadius.medium - 2,
  },
  lastOption: {
    borderTopRightRadius: theme.layout.borderRadius.medium - 2,
    borderBottomRightRadius: theme.layout.borderRadius.medium - 2,
  },
  optionText: {
    ...createTextStyle(theme, 'bodyBase', theme.colors.text.secondary),
    fontWeight: '500',
  },
  selectedOptionText: {
    ...createTextStyle(theme, 'bodyBase', theme.colors.text.primary),
    fontWeight: '600',
  },
});

export default TimeGroupingToggle;