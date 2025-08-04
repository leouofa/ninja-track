import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { notificationUtils } from '../../utils/notificationUtils';
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
  const [settings, setSettings] = useState<ReminderSettings | null>(null);
  const [showDayPicker, setShowDayPicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [loading, setLoading] = useState(true);
  const [nextReminder, setNextReminder] = useState<Date | null>(null);
  const [hasNotificationPermissions, setHasNotificationPermissions] = useState(false);

  const styles = createStyles(theme);

  useEffect(() => {
    loadSettings();
    checkNotificationPermissions();
  }, []);

  useEffect(() => {
    if (settings?.enabled) {
      loadNextReminder();
    } else {
      setNextReminder(null);
    }
  }, [settings]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const loadedSettings = await reminderUtils.loadReminderSettings();
      
      if (loadedSettings) {
        setSettings(loadedSettings);
      } else {
        // Create default settings
        const defaultSettings = reminderUtils.getDefaultSettings();
        const newSettings = await reminderUtils.updateReminderSettings(
          defaultSettings.enabled,
          defaultSettings.dayOfWeek,
          defaultSettings.time
        );
        setSettings(newSettings);
      }
    } catch (error) {
      console.error('Error loading reminder settings:', error);
      Alert.alert('Error', 'Failed to load reminder settings');
    } finally {
      setLoading(false);
    }
  };

  const checkNotificationPermissions = async () => {
    try {
      const hasPermissions = await notificationUtils.areNotificationsEnabled();
      setHasNotificationPermissions(hasPermissions);
    } catch (error) {
      console.error('Error checking notification permissions:', error);
    }
  };

  const loadNextReminder = async () => {
    try {
      const nextReminderDate = await notificationUtils.getNextScheduledReminder();
      setNextReminder(nextReminderDate);
    } catch (error) {
      console.error('Error loading next reminder:', error);
    }
  };

  const handleToggleEnabled = async (enabled: boolean) => {
    if (!settings) return;

    try {
      // Check and request notification permissions if enabling
      if (enabled) {
        const hasPermissions = await notificationUtils.requestPermissions();
        if (!hasPermissions) {
          Alert.alert(
            'Notification Permission Required',
            'Please enable notifications in your device settings to receive reminders.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Settings', onPress: () => {
                // Note: Opening app settings would require additional setup
                console.log('User should open app settings');
              }}
            ]
          );
          return;
        }
        setHasNotificationPermissions(true);
      }

      const updatedSettings = await reminderUtils.updateReminderSettings(
        enabled,
        settings.dayOfWeek,
        settings.time
      );
      setSettings(updatedSettings);

      // Update notification scheduling
      await notificationUtils.updateReminderNotifications(updatedSettings);

      if (enabled) {
        Alert.alert(
          'Reminders Enabled',
          `You will receive reminders on ${reminderUtils.getDayName(settings.dayOfWeek)} at ${formatTimeDisplay(settings.time)}`
        );
      } else {
        Alert.alert(
          'Reminders Disabled',
          'You will no longer receive task tracking reminders.'
        );
      }
    } catch (error) {
      console.error('Error updating reminder settings:', error);
      Alert.alert('Error', 'Failed to update reminder settings');
    }
  };

  const handleDayChange = async (dayOfWeek: number) => {
    if (!settings) return;

    try {
      const updatedSettings = await reminderUtils.updateReminderSettings(
        settings.enabled,
        dayOfWeek,
        settings.time
      );
      setSettings(updatedSettings);
      setShowDayPicker(false);

      // Update notification scheduling if enabled
      if (settings.enabled) {
        await notificationUtils.updateReminderNotifications(updatedSettings);
      }
    } catch (error) {
      console.error('Error updating day selection:', error);
      Alert.alert('Error', 'Failed to update day selection');
    }
  };

  const handleTimeChange = async (event: any, selectedDate?: Date) => {
    if (!settings) return;

    // On Android, hide picker first
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }

    if (selectedDate && event.type !== 'dismissed') {
      try {
        const hours = selectedDate.getHours().toString().padStart(2, '0');
        const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
        const timeString = `${hours}:${minutes}`;

        const updatedSettings = await reminderUtils.updateReminderSettings(
          settings.enabled,
          settings.dayOfWeek,
          timeString
        );
        setSettings(updatedSettings);

        // On iOS, hide picker after selection
        if (Platform.OS === 'ios') {
          setShowTimePicker(false);
        }

        // Update notification scheduling if enabled
        if (settings.enabled) {
          await notificationUtils.updateReminderNotifications(updatedSettings);
        }
      } catch (error) {
        console.error('Error updating time selection:', error);
        Alert.alert('Error', 'Failed to update time selection');
      }
    } else {
      // User cancelled, just hide picker
      setShowTimePicker(false);
    }
  };

  // Convert time string to Date object for DateTimePicker
  const getTimeAsDate = (timeString: string): Date => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  const formatTimeDisplay = (time: string): string => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatNextReminderDate = (date: Date): string => {
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Tomorrow';
    } else if (diffDays <= 7) {
      return `In ${diffDays} days`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const handleTestNotification = async () => {
    try {
      await notificationUtils.sendTestNotification();
      Alert.alert('Test Sent', 'A test notification has been sent!');
    } catch (error) {
      console.error('Error sending test notification:', error);
      Alert.alert('Error', 'Failed to send test notification. Please check your notification permissions.');
    }
  };

  const renderToggleSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Enable Reminders</Text>
      <Text style={styles.sectionDescription}>
        Get reminded to track tasks you've completed
      </Text>
      
      <View style={styles.toggleRow}>
        <View style={styles.toggleContent}>
          <Text style={styles.toggleLabel}>Task Tracking Reminders</Text>
          <Text style={styles.toggleDescription}>
            Receive notifications to track your completed tasks
          </Text>
        </View>
        <Switch
          value={settings?.enabled || false}
          onValueChange={handleToggleEnabled}
          trackColor={{ 
            false: theme.colors.border, 
            true: theme.colors.accent 
          }}
          thumbColor={settings?.enabled ? theme.colors.surface : theme.colors.surface}
          ios_backgroundColor={theme.colors.border}
        />
      </View>
    </View>
  );

  const renderDayPicker = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Reminder Day</Text>
      <Text style={styles.sectionDescription}>
        Choose which day of the week to receive reminders
      </Text>
      
      <TouchableOpacity
        style={[styles.picker, !settings?.enabled && styles.pickerDisabled]}
        onPress={() => settings?.enabled && setShowDayPicker(true)}
        disabled={!settings?.enabled}
      >
        <View style={styles.pickerContent}>
          <Text style={[styles.pickerLabel, !settings?.enabled && styles.pickerLabelDisabled]}>
            Day of Week
          </Text>
          <Text style={[styles.pickerValue, !settings?.enabled && styles.pickerValueDisabled]}>
            {settings ? reminderUtils.getDayName(settings.dayOfWeek) : 'Monday'}
          </Text>
        </View>
        <Ionicons 
          name="chevron-forward" 
          size={20} 
          color={settings?.enabled ? theme.colors.text.secondary : theme.colors.text.muted} 
        />
      </TouchableOpacity>
    </View>
  );

  const renderTimePicker = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Reminder Time</Text>
      <Text style={styles.sectionDescription}>
        Choose what time to receive the reminder
      </Text>
      
      <TouchableOpacity
        style={[styles.picker, !settings?.enabled && styles.pickerDisabled]}
        onPress={() => settings?.enabled && setShowTimePicker(true)}
        disabled={!settings?.enabled}
      >
        <View style={styles.pickerContent}>
          <Text style={[styles.pickerLabel, !settings?.enabled && styles.pickerLabelDisabled]}>
            Time
          </Text>
          <Text style={[styles.pickerValue, !settings?.enabled && styles.pickerValueDisabled]}>
            {settings ? formatTimeDisplay(settings.time) : '9:00 AM'}
          </Text>
        </View>
        <Ionicons 
          name="chevron-forward" 
          size={20} 
          color={settings?.enabled ? theme.colors.text.secondary : theme.colors.text.muted} 
        />
      </TouchableOpacity>
    </View>
  );

  const renderDayPickerModal = () => {
    if (!settings) return null;

    return (
      <View style={styles.modal}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Select Day</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={settings.dayOfWeek}
              onValueChange={(value) => handleDayChange(value)}
              style={styles.nativePicker}
            >
              {DAYS_OF_WEEK.map((day) => (
                <Picker.Item 
                  key={day.value} 
                  label={day.label} 
                  value={day.value}
                  color={theme.colors.text.primary}
                />
              ))}
            </Picker>
          </View>
          <TouchableOpacity
            style={[styles.modalButton, styles.cancelButton]}
            onPress={() => setShowDayPicker(false)}
          >
            <Text style={styles.cancelButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderTimePickerModal = () => {
    if (!settings) return null;

    if (Platform.OS === 'ios') {
      return (
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Time</Text>
            <DateTimePicker
              value={getTimeAsDate(settings.time)}
              mode="time"
              display="spinner"
              onChange={handleTimeChange}
              style={styles.timePicker}
            />
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setShowTimePicker(false)}
            >
              <Text style={styles.cancelButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    // Android will show the native time picker automatically
    return (
      <DateTimePicker
        value={getTimeAsDate(settings.time)}
        mode="time"
        display="default"
        onChange={handleTimeChange}
      />
    );
  };

  const renderNextReminderSection = () => {
    if (!settings?.enabled || !nextReminder) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Next Reminder</Text>
        <View style={styles.nextReminderInfo}>
          <Ionicons name="time-outline" size={20} color={theme.colors.accent} />
          <View style={styles.nextReminderText}>
            <Text style={styles.nextReminderDate}>
              {formatNextReminderDate(nextReminder)}
            </Text>
            <Text style={styles.nextReminderTime}>
              {formatTimeDisplay(settings.time)} on {reminderUtils.getDayName(settings.dayOfWeek)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderTestSection = () => {
    if (!settings?.enabled) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Test Notification</Text>
        <Text style={styles.sectionDescription}>
          Send a test notification to make sure everything is working correctly
        </Text>
        
        <TouchableOpacity
          style={[styles.testButton, !hasNotificationPermissions && styles.testButtonDisabled]}
          onPress={handleTestNotification}
          disabled={!hasNotificationPermissions}
        >
          <Ionicons name="notifications-outline" size={16} color={theme.colors.surface} />
          <Text style={styles.testButtonText}>Send Test Notification</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading reminder settings...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <Text style={styles.pageDescription}>
          Set up reminders to help you remember to track tasks you've completed.
        </Text>

        {renderToggleSection()}
        {renderDayPicker()}
        {renderTimePicker()}
        {renderNextReminderSection()}
        {renderTestSection()}
      </ScrollView>

      {/* Day Picker Modal */}
      {showDayPicker && renderDayPickerModal()}

      {/* Time Picker Modal */}
      {showTimePicker && renderTimePickerModal()}
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
  pageDescription: {
    ...createTextStyle(theme, 'bodyBase', theme.colors.text.secondary),
    marginBottom: theme.spacing.xl,
    lineHeight: 22,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...createTextStyle(theme, 'bodyBase', theme.colors.text.secondary),
  },
  section: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.layout.borderRadius.large,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.subtle,
  },
  sectionTitle: {
    ...createTextStyle(theme, 'bodyLarge'),
    fontWeight: '600',
    marginBottom: theme.spacing.sm,
  },
  sectionDescription: {
    ...createTextStyle(theme, 'bodySmall', theme.colors.text.secondary),
    marginBottom: theme.spacing.lg,
    lineHeight: 20,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleContent: {
    flex: 1,
    marginRight: theme.spacing.lg,
  },
  toggleLabel: {
    ...createTextStyle(theme, 'bodyBase'),
    fontWeight: '500',
    marginBottom: theme.spacing.xs,
  },
  toggleDescription: {
    ...createTextStyle(theme, 'bodySmall', theme.colors.text.secondary),
    lineHeight: 18,
  },
  picker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.layout.borderRadius.medium,
    backgroundColor: theme.colors.surface,
    minHeight: theme.layout.touchTarget.recommended,
  },
  pickerDisabled: {
    opacity: 0.5,
  },
  pickerContent: {
    flex: 1,
  },
  pickerLabel: {
    ...createTextStyle(theme, 'bodySmall', theme.colors.text.secondary),
    marginBottom: theme.spacing.xs / 2,
  },
  pickerLabelDisabled: {
    color: theme.colors.text.muted,
  },
  pickerValue: {
    ...createTextStyle(theme, 'bodyBase'),
    fontWeight: '500',
  },
  pickerValueDisabled: {
    color: theme.colors.text.muted,
  },
  pickerWrapper: {
    backgroundColor: theme.colors.surface,
    marginVertical: theme.spacing.md,
  },
  nativePicker: {
    backgroundColor: theme.colors.surface,
    color: theme.colors.text.primary,
    ...(Platform.OS === 'ios' && {
      marginVertical: -8, // Adjust for iOS picker padding
    }),
  },
  modal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.layout.borderRadius.large,
    padding: theme.spacing.xl,
    margin: theme.spacing.xl,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
    ...theme.shadows.subtle,
  },
  modalTitle: {
    ...createTextStyle(theme, 'h4'),
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  timePicker: {
    width: '100%',
    marginVertical: theme.spacing.lg,
  },
  modalButton: {
    borderRadius: theme.layout.borderRadius.medium,
    paddingVertical: theme.spacing.sm + theme.spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: theme.layout.touchTarget.minimum,
  },
  cancelButton: {
    backgroundColor: theme.colors.secondaryBackground,
  },
  cancelButtonText: {
    ...createTextStyle(theme, 'button', theme.colors.text.secondary),
    fontWeight: '600',
  },
  nextReminderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.secondaryBackground,
    borderRadius: theme.layout.borderRadius.medium,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  nextReminderText: {
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  nextReminderDate: {
    ...createTextStyle(theme, 'bodyBase'),
    fontWeight: '600',
    marginBottom: theme.spacing.xs / 2,
  },
  nextReminderTime: {
    ...createTextStyle(theme, 'bodySmall', theme.colors.text.secondary),
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.accent,
    borderRadius: theme.layout.borderRadius.medium,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    minHeight: theme.layout.touchTarget.recommended,
    gap: theme.spacing.sm,
  },
  testButtonDisabled: {
    opacity: 0.5,
  },
  testButtonText: {
    ...createTextStyle(theme, 'button', theme.colors.surface),
    fontWeight: '600',
  },
});