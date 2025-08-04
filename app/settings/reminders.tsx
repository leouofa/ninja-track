import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { notificationService } from '../../utils/notificationService';
import { reminderUtils } from '../../utils/reminderStorage';
import { createTextStyle, useTheme } from '../../utils/theme';
import { ReminderSettings } from '../../utils/types';

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday', short: 'Sun' },
  { value: 1, label: 'Monday', short: 'Mon' },
  { value: 2, label: 'Tuesday', short: 'Tue' },
  { value: 3, label: 'Wednesday', short: 'Wed' },
  { value: 4, label: 'Thursday', short: 'Thu' },
  { value: 5, label: 'Friday', short: 'Fri' },
  { value: 6, label: 'Saturday', short: 'Sat' },
];

export default function Reminders() {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  
  const [settings, setSettings] = useState<ReminderSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Load initial settings
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      let reminderSettings = await reminderUtils.loadReminderSettings();
      if (!reminderSettings) {
        reminderSettings = reminderUtils.createDefaultSettings();
        await reminderUtils.saveReminderSettings(reminderSettings);
      }
      setSettings(reminderSettings);
    } catch (error) {
      console.error('Error loading reminder settings:', error);
      Alert.alert('Error', 'Failed to load reminder settings');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleEnabled = useCallback(async () => {
    if (!settings) return;
    
    try {
      const updatedSettings = await reminderUtils.toggleReminderEnabled();
      if (updatedSettings) {
        setSettings(updatedSettings);
        
        if (updatedSettings.enabled) {
          const notificationIds = await notificationService.scheduleWeeklyReminders(updatedSettings);
          if (notificationIds.length > 0) {
            Alert.alert('Reminders Enabled', 'You will receive reminders to track your completed tasks.');
          } else {
            Alert.alert('Permission Required', 'Please enable notifications in your device settings to receive reminders.');
          }
        } else {
          await notificationService.cancelAllReminders();
          Alert.alert('Reminders Disabled', 'You will no longer receive task tracking reminders.');
        }
      }
    } catch (error) {
      console.error('Error toggling reminder:', error);
      Alert.alert('Error', 'Failed to update reminder settings');
    }
  }, [settings]);

  const handleDayToggle = useCallback(async (dayOfWeek: number) => {
    if (!settings) return;

    try {
      const updatedSettings = await reminderUtils.toggleReminderDay(dayOfWeek);
      if (updatedSettings) {
        setSettings(updatedSettings);
        // Reschedule notifications if enabled
        if (updatedSettings.enabled) {
          await notificationService.updateReminderSchedule(updatedSettings);
        }
      }
    } catch (error) {
      console.error('Error updating reminder day:', error);
      Alert.alert('Error', 'Failed to update reminder day');
    }
  }, [settings]);

  const handleTimeChange = useCallback(async (event: any, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    
    if (selectedTime && settings) {
      const hours = selectedTime.getHours().toString().padStart(2, '0');
      const minutes = selectedTime.getMinutes().toString().padStart(2, '0');
      const timeString = `${hours}:${minutes}`;
      
      try {
        const updatedSettings = await reminderUtils.setReminderTime(timeString);
        if (updatedSettings) {
          setSettings(updatedSettings);
          // Reschedule notification if enabled
          if (updatedSettings.enabled) {
            await notificationService.updateReminderSchedule(updatedSettings);
          }
        }
      } catch (error) {
        console.error('Error updating reminder time:', error);
        Alert.alert('Error', 'Failed to update reminder time');
      }
    }
  }, [settings]);

  const getCurrentTimeAsDate = (): Date => {
    if (!settings) return new Date();
    
    const [hours, minutes] = settings.time.split(':');
    const date = new Date();
    date.setHours(parseInt(hours, 10));
    date.setMinutes(parseInt(minutes, 10));
    date.setSeconds(0);
    date.setMilliseconds(0);
    return date;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading reminders...</Text>
        </View>
      </View>
    );
  }

  if (!settings) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load reminder settings</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadSettings}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <Text style={styles.subtitle}>
          Configure reminders to help you track tasks you've completed throughout the week.
        </Text>

        {/* Enable/Disable Toggle */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reminder Status</Text>
          <View style={styles.toggleContainer}>
            <View style={styles.toggleIcon}>
              <Ionicons 
                name={settings.enabled ? "notifications" : "notifications-off"} 
                size={24} 
                color={theme.colors.accent} 
              />
            </View>
            <View style={styles.toggleContent}>
              <Text style={styles.toggleTitle}>Enable Reminders</Text>
              <Text style={styles.toggleDescription}>
                {settings.enabled 
                  ? "You'll receive weekly reminders to track your tasks" 
                  : "Turn on to receive weekly task tracking reminders"
                }
              </Text>
            </View>
            <Switch
              value={settings.enabled}
              onValueChange={handleToggleEnabled}
              trackColor={{ 
                false: theme.colors.border, 
                true: theme.colors.accent 
              }}
              thumbColor={settings.enabled ? theme.colors.surface : theme.colors.surface}
              ios_backgroundColor={theme.colors.border}
            />
          </View>
        </View>

        {/* Day Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reminder Days</Text>
          <Text style={styles.sectionDescription}>
            Choose which days of the week you'd like to receive reminders
          </Text>
          <View style={styles.daySelector}>
            {DAYS_OF_WEEK.map((day) => {
              const isSelected = settings.daysOfWeek?.includes(day.value) || false;
              return (
                <TouchableOpacity
                  key={day.value}
                  style={[
                    styles.dayOption,
                    isSelected && styles.dayOptionSelected
                  ]}
                  onPress={() => handleDayToggle(day.value)}
                  disabled={!settings.enabled}
                >
                  <View style={styles.dayOptionContent}>
                    <Text style={[
                      styles.dayOptionText,
                      isSelected && styles.dayOptionTextSelected,
                      !settings.enabled && styles.dayOptionTextDisabled
                    ]}>
                      {day.short}
                    </Text>
                    {isSelected && (
                      <Ionicons 
                        name="checkmark" 
                        size={12} 
                        color={settings.enabled ? theme.colors.surface : theme.colors.text.disabled}
                        style={styles.dayCheckmark}
                      />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
          <Text style={styles.selectedDayText}>
            Selected: {reminderUtils.formatDaysOfWeek(settings.daysOfWeek || [])}
          </Text>
        </View>

        {/* Time Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reminder Time</Text>
          <Text style={styles.sectionDescription}>
            Choose what time you'd like to receive the reminder
          </Text>
          <TouchableOpacity
            style={[styles.timeSelector, !settings.enabled && styles.timeSelectorDisabled]}
            onPress={() => setShowTimePicker(true)}
            disabled={!settings.enabled}
          >
            <View style={styles.timeSelectorIcon}>
              <Ionicons name="time" size={24} color={theme.colors.accent} />
            </View>
            <View style={styles.timeSelectorContent}>
              <Text style={[styles.timeSelectorText, !settings.enabled && styles.timeSelectorTextDisabled]}>
                {reminderUtils.formatTime(settings.time)}
              </Text>
              <Text style={[styles.timeSelectorDescription, !settings.enabled && styles.timeSelectorTextDisabled]}>
                Tap to change time
              </Text>
            </View>
            <Ionicons 
              name="chevron-forward" 
              size={20} 
              color={settings.enabled ? theme.colors.text.muted : theme.colors.text.disabled} 
            />
          </TouchableOpacity>
        </View>

        {/* Current Settings Summary */}
        {settings.enabled && settings.daysOfWeek && settings.daysOfWeek.length > 0 && (
          <View style={styles.summarySection}>
            <Text style={styles.summaryTitle}>Reminder Schedule</Text>
            <View style={styles.summaryCard}>
              <Ionicons name="calendar" size={20} color={theme.colors.accent} style={styles.summaryIcon} />
              <Text style={styles.summaryText}>
                {reminderUtils.formatDaysOfWeek(settings.daysOfWeek)} at{' '}
                {reminderUtils.formatTime(settings.time)}
              </Text>
            </View>
          </View>
        )}

        {/* Time Picker Modal */}
        {showTimePicker && (
          <DateTimePicker
            value={getCurrentTimeAsDate()}
            mode="time"
            is24Hour={false}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleTimeChange}
          />
        )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...createTextStyle(theme, 'bodyLarge', theme.colors.text.secondary),
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.container,
  },
  errorText: {
    ...createTextStyle(theme, 'bodyLarge', theme.colors.text.secondary),
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  retryButton: {
    backgroundColor: theme.colors.accent,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.layout.borderRadius.medium,
  },
  retryButtonText: {
    ...createTextStyle(theme, 'bodyLarge', theme.colors.surface),
    fontWeight: '600',
  },
  section: {
    marginBottom: theme.spacing.xxxl,
  },
  sectionTitle: {
    ...createTextStyle(theme, 'headingSmall'),
    marginBottom: theme.spacing.sm,
  },
  sectionDescription: {
    ...createTextStyle(theme, 'bodySmall', theme.colors.text.secondary),
    marginBottom: theme.spacing.lg,
  },
  toggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.layout.borderRadius.large,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.subtle,
  },
  toggleIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.secondaryBackground,
    justifyContent: "center",
    alignItems: "center",
    marginRight: theme.spacing.md,
  },
  toggleContent: {
    flex: 1,
  },
  toggleTitle: {
    ...createTextStyle(theme, 'bodyLarge'),
    fontWeight: "600",
    marginBottom: theme.spacing.xs / 2,
  },
  toggleDescription: {
    ...createTextStyle(theme, 'bodySmall', theme.colors.text.secondary),
  },
  daySelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  dayOption: {
    flex: 1,
    minWidth: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayOptionSelected: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accent,
  },
  dayOptionContent: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  dayOptionText: {
    ...createTextStyle(theme, 'bodySmall'),
    fontWeight: '600',
  },
  dayOptionTextSelected: {
    color: theme.colors.surface,
  },
  dayOptionTextDisabled: {
    color: theme.colors.text.disabled,
  },
  dayCheckmark: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: theme.colors.accent,
    borderRadius: 6,
    width: 12,
    height: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedDayText: {
    ...createTextStyle(theme, 'bodySmall', theme.colors.text.muted),
    textAlign: 'center',
  },
  timeSelector: {
    flexDirection: "row",
    alignItems: "center",
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.layout.borderRadius.large,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.subtle,
  },
  timeSelectorDisabled: {
    opacity: 0.6,
  },
  timeSelectorIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.secondaryBackground,
    justifyContent: "center",
    alignItems: "center",
    marginRight: theme.spacing.md,
  },
  timeSelectorContent: {
    flex: 1,
  },
  timeSelectorText: {
    ...createTextStyle(theme, 'bodyLarge'),
    fontWeight: "600",
    marginBottom: theme.spacing.xs / 2,
  },
  timeSelectorTextDisabled: {
    color: theme.colors.text.disabled,
  },
  timeSelectorDescription: {
    ...createTextStyle(theme, 'bodySmall', theme.colors.text.secondary),
  },
  summarySection: {
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.xxxl,
  },
  summaryTitle: {
    ...createTextStyle(theme, 'headingSmall'),
    marginBottom: theme.spacing.md,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.accent + '15', // 15% opacity
    borderRadius: theme.layout.borderRadius.large,
    borderWidth: 1,
    borderColor: theme.colors.accent + '30', // 30% opacity
  },
  summaryIcon: {
    marginRight: theme.spacing.md,
  },
  summaryText: {
    ...createTextStyle(theme, 'bodyLarge'),
    fontWeight: '600',
    flex: 1,
  },
});