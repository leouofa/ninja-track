import AsyncStorage from '@react-native-async-storage/async-storage';
import { ReminderSettings } from './types';

const REMINDER_SETTINGS_STORAGE_KEY = '@ninja_track_reminder_settings';

export const reminderUtils = {
  // Generate unique ID
  generateId: (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  },

  // Format time string (ensures HH:MM format)
  formatTime: (time: string): string => {
    // If time is already in HH:MM format, return as is
    if (/^\d{2}:\d{2}$/.test(time)) {
      return time;
    }
    
    // If time is in H:MM format, add leading zero
    if (/^\d{1}:\d{2}$/.test(time)) {
      return '0' + time;
    }
    
    // Default to 09:00 if invalid
    return '09:00';
  },



  // Validate time format
  isValidTimeFormat: (time: string): boolean => {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  },



  // Load reminder settings
  loadReminderSettings: async (): Promise<ReminderSettings | null> => {
    try {
      const settingsJson = await AsyncStorage.getItem(REMINDER_SETTINGS_STORAGE_KEY);
      if (settingsJson) {
        const settings = JSON.parse(settingsJson);
        // Convert date strings back to Date objects
        return {
          ...settings,
          createdAt: new Date(settings.createdAt),
          updatedAt: new Date(settings.updatedAt)
        };
      }
      return null;
    } catch (error) {
      console.error('Error loading reminder settings:', error);
      return null;
    }
  },

  // Save reminder settings
  saveReminderSettings: async (settings: ReminderSettings): Promise<void> => {
    try {
      const settingsJson = JSON.stringify(settings);
      await AsyncStorage.setItem(REMINDER_SETTINGS_STORAGE_KEY, settingsJson);
    } catch (error) {
      console.error('Error saving reminder settings:', error);
      throw error;
    }
  },

  // Create or update reminder settings
  updateReminderSettings: async (
    enabled: boolean,
    time: string
  ): Promise<ReminderSettings> => {
    try {
      const formattedTime = reminderUtils.formatTime(time);
      if (!reminderUtils.isValidTimeFormat(formattedTime)) {
        throw new Error('Invalid time format');
      }

      // Load existing settings or create new
      let existingSettings = await reminderUtils.loadReminderSettings();
      
      const now = new Date();
      const settings: ReminderSettings = {
        id: existingSettings?.id || reminderUtils.generateId(),
        enabled,
        time: formattedTime,
        createdAt: existingSettings?.createdAt || now,
        updatedAt: now
      };

      await reminderUtils.saveReminderSettings(settings);
      return settings;
    } catch (error) {
      console.error('Error updating reminder settings:', error);
      throw error;
    }
  },

  // Get default reminder settings
  getDefaultSettings: (): Omit<ReminderSettings, 'id' | 'createdAt' | 'updatedAt'> => {
    return {
      enabled: false,
      time: '09:00'
    };
  },

  // Clear reminder settings
  clearReminderSettings: async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(REMINDER_SETTINGS_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing reminder settings:', error);
      throw error;
    }
  }
};