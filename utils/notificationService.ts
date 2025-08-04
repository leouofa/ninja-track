import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { reminderUtils } from './reminderStorage';
import { ReminderSettings } from './types';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const notificationService = {
  // Request permissions for notifications
  requestPermissions: async (): Promise<boolean> => {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.warn('Notification permissions not granted');
        return false;
      }

      // For Android, register for push notifications
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('task-reminders', {
          name: 'Task Reminders',
          importance: Notifications.AndroidImportance.DEFAULT,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      return true;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  },

  // Schedule weekly reminder notifications for multiple days
  scheduleWeeklyReminders: async (settings: ReminderSettings): Promise<string[]> => {
    try {
      const hasPermissions = await notificationService.requestPermissions();
      if (!hasPermissions) {
        console.warn('Cannot schedule notifications: permissions not granted');
        return [];
      }

      if (!settings.daysOfWeek || settings.daysOfWeek.length === 0) {
        console.warn('No days selected for reminders');
        return [];
      }

      // Parse the time
      const [hours, minutes] = settings.time.split(':').map(Number);
      
      const notificationIds: string[] = [];

      // Schedule a notification for each selected day
      for (const dayOfWeek of settings.daysOfWeek) {
        // Create the trigger for weekly repeating notification
        const trigger: Notifications.WeeklyTriggerInput = {
          weekday: dayOfWeek === 0 ? 1 : dayOfWeek + 1, // Expo uses 1-7 (Mon-Sun), we use 0-6 (Sun-Sat)
          hour: hours,
          minute: minutes,
          repeats: true,
        };

        const notificationId = await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Task Tracking Reminder 📋',
            body: "Don't forget to track the tasks you've completed this week!",
            data: { 
              type: 'task-reminder',
              settings: settings,
              dayOfWeek: dayOfWeek
            },
            sound: 'default',
          },
          trigger,
        });

        notificationIds.push(notificationId);
        console.log(`Scheduled weekly reminder for day ${dayOfWeek} with ID:`, notificationId);
      }

      return notificationIds;
    } catch (error) {
      console.error('Error scheduling notifications:', error);
      return [];
    }
  },

  // Schedule a single weekly reminder (kept for backwards compatibility)
  scheduleWeeklyReminder: async (settings: ReminderSettings): Promise<string | null> => {
    const ids = await notificationService.scheduleWeeklyReminders(settings);
    return ids.length > 0 ? ids[0] : null;
  },

  // Cancel all scheduled reminders
  cancelAllReminders: async (): Promise<void> => {
    try {
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      
      // Filter for task reminder notifications
      const reminderNotifications = scheduledNotifications.filter(
        notification => notification.content.data?.type === 'task-reminder'
      );

      // Cancel each reminder notification
      for (const notification of reminderNotifications) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
        console.log('Cancelled notification:', notification.identifier);
      }
    } catch (error) {
      console.error('Error cancelling notifications:', error);
    }
  },

  // Update reminder schedule (cancel old and schedule new)
  updateReminderSchedule: async (settings: ReminderSettings): Promise<string[]> => {
    try {
      // First cancel any existing reminders
      await notificationService.cancelAllReminders();
      
      // If reminders are enabled, schedule new ones
      if (settings.enabled) {
        return await notificationService.scheduleWeeklyReminders(settings);
      }
      
      return [];
    } catch (error) {
      console.error('Error updating reminder schedule:', error);
      return [];
    }
  },

  // Get all scheduled reminders (for debugging)
  getScheduledReminders: async (): Promise<Notifications.NotificationRequest[]> => {
    try {
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      return scheduledNotifications.filter(
        notification => notification.content.data?.type === 'task-reminder'
      );
    } catch (error) {
      console.error('Error getting scheduled reminders:', error);
      return [];
    }
  },

  // Initialize notification service (call on app start)
  initialize: async (): Promise<void> => {
    try {
      // Request permissions
      await notificationService.requestPermissions();
      
      // Load current reminder settings and ensure they're scheduled
      const settings = await reminderUtils.loadReminderSettings();
      if (settings && settings.enabled) {
        // Check if we have any scheduled reminders
        const scheduledReminders = await notificationService.getScheduledReminders();
        
        if (scheduledReminders.length === 0) {
          // No reminders scheduled, create them
          await notificationService.scheduleWeeklyReminders(settings);
          console.log('Initialized missing reminder notifications');
        }
      }
    } catch (error) {
      console.error('Error initializing notification service:', error);
    }
  },

  // Handle notification received (when app is open)
  addNotificationReceivedListener: (handler: (notification: Notifications.Notification) => void) => {
    return Notifications.addNotificationReceivedListener(handler);
  },

  // Handle notification response (when user taps notification)
  addNotificationResponseReceivedListener: (handler: (response: Notifications.NotificationResponse) => void) => {
    return Notifications.addNotificationResponseReceivedListener(handler);
  },
};