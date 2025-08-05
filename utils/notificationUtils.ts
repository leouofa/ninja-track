import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { ReminderSettings } from './types';

// Check if we're on a platform that supports notifications
const isNotificationSupported = Platform.OS === 'ios' || Platform.OS === 'android';

// Configure notification handler (only on supported platforms)
if (isNotificationSupported) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export const notificationUtils = {
  // Request notification permissions
  requestPermissions: async (): Promise<boolean> => {
    if (!isNotificationSupported) {
      console.log('Notifications not supported on this platform');
      return false;
    }

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        return false;
      }

      // For Android, configure notification channel
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('reminders', {
          name: 'Task Reminders',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
          sound: 'default',
        });
      }

      return true;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  },

  // Check if notifications are enabled
  areNotificationsEnabled: async (): Promise<boolean> => {
    if (!isNotificationSupported) {
      return false;
    }

    try {
      const { status } = await Notifications.getPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error checking notification permissions:', error);
      return false;
    }
  },

  // Schedule daily reminder notification
  scheduleReminderNotification: async (settings: ReminderSettings): Promise<string | null> => {
    if (!isNotificationSupported) {
      console.log('Notifications not supported on this platform - skipping scheduling');
      return null;
    }

    try {
      if (!settings.enabled) {
        return null;
      }

      // Cancel existing reminder notifications
      await notificationUtils.cancelReminderNotifications();

      // Check permissions
      const hasPermissions = await notificationUtils.requestPermissions();
      if (!hasPermissions) {
        throw new Error('Notification permissions not granted');
      }

      // Parse time
      const [hours, minutes] = settings.time.split(':').map(Number);

      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Time to Track Your Tasks! 📝',
          body: 'Don\'t forget to log the tasks you\'ve completed today.',
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.HIGH,
          data: {
            type: 'reminder',
            source: 'ninja-track',
          },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: hours,
          minute: minutes,
          repeats: true,
        },
      });

      return identifier;
    } catch (error) {
      console.error('Error scheduling reminder notification:', error);
      throw error;
    }
  },

  // Cancel all reminder notifications
  cancelReminderNotifications: async (): Promise<void> => {
    if (!isNotificationSupported) {
      console.log('Notifications not supported on this platform - skipping cancellation');
      return;
    }

    try {
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      
      // Filter and cancel reminder notifications
      const reminderNotifications = scheduledNotifications.filter(
        notification => notification.content.data?.type === 'reminder'
      );

      for (const notification of reminderNotifications) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }
    } catch (error) {
      console.error('Error canceling reminder notifications:', error);
    }
  },

  // Get next scheduled reminder
  getNextScheduledReminder: async (): Promise<Date | null> => {
    if (!isNotificationSupported) {
      return null;
    }

    try {
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      
      const reminderNotifications = scheduledNotifications.filter(
        notification => notification.content.data?.type === 'reminder'
      );

      if (reminderNotifications.length === 0) {
        return null;
      }

      // Find the next reminder
      let nextDate: Date | null = null;
      
      for (const notification of reminderNotifications) {
        const trigger = notification.trigger as any;
        
        if (trigger.type === 'daily') {
          // Calculate next occurrence
          const now = new Date();
          const targetHour = trigger.hour;
          const targetMinute = trigger.minute;
          
          const next = new Date();
          next.setHours(targetHour, targetMinute, 0, 0);
          
          // If the time has already passed today, schedule for tomorrow
          if (now.getTime() > next.getTime()) {
            next.setDate(next.getDate() + 1);
          }
          
          if (!nextDate || next.getTime() < nextDate.getTime()) {
            nextDate = next;
          }
        }
      }

      return nextDate;
    } catch (error) {
      console.error('Error getting next scheduled reminder:', error);
      return null;
    }
  },

  // Update reminder notifications when settings change
  updateReminderNotifications: async (settings: ReminderSettings): Promise<void> => {
    try {
      if (settings.enabled) {
        await notificationUtils.scheduleReminderNotification(settings);
      } else {
        await notificationUtils.cancelReminderNotifications();
      }
    } catch (error) {
      console.error('Error updating reminder notifications:', error);
      throw error;
    }
  },

  // Test notification (for development/testing)
  sendTestNotification: async (): Promise<void> => {
    if (!isNotificationSupported) {
      throw new Error('Notifications are not supported on this platform (web). Please use the app on iOS or Android to test notifications.');
    }

    try {
      const hasPermissions = await notificationUtils.requestPermissions();
      if (!hasPermissions) {
        throw new Error('Notification permissions not granted');
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Test Reminder 📝',
          body: 'This is a test notification from Ninja Track.',
          sound: 'default',
          data: {
            type: 'test',
            source: 'ninja-track',
          },
        },
        trigger: null, // Send immediately
      });
    } catch (error) {
      console.error('Error sending test notification:', error);
      throw error;
    }
  },
};