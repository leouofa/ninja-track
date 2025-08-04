import AsyncStorage from '@react-native-async-storage/async-storage';
import { ReminderSettings } from './types';

const REMINDER_SETTINGS_KEY = '@ninja_track_reminder_settings';

export const reminderUtils = {
  // Generate unique ID
  generateId: (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  },

  // Get day name from number
  getDayName: (dayOfWeek: number): string => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayOfWeek] || 'Unknown';
  },

  // Get day names from array of numbers
  getDayNames: (daysOfWeek: number[]): string[] => {
    return daysOfWeek.map(day => reminderUtils.getDayName(day));
  },

  // Format multiple days for display
  formatDaysOfWeek: (daysOfWeek: number[]): string => {
    if (daysOfWeek.length === 0) return 'None';
    if (daysOfWeek.length === 7) return 'Every day';
    
    const sortedDays = [...daysOfWeek].sort();
    const dayNames = reminderUtils.getDayNames(sortedDays);
    
    if (dayNames.length === 1) return dayNames[0];
    if (dayNames.length === 2) return `${dayNames[0]} and ${dayNames[1]}`;
    
    const lastDay = dayNames.pop();
    return `${dayNames.join(', ')}, and ${lastDay}`;
  },

  // Format time from 24-hour to 12-hour format
  formatTime: (time: string): string => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  },

  // Load reminder settings
  loadReminderSettings: async (): Promise<ReminderSettings | null> => {
    try {
      const settingsJson = await AsyncStorage.getItem(REMINDER_SETTINGS_KEY);
      if (settingsJson) {
        const settings = JSON.parse(settingsJson);
        
        // Migrate old single dayOfWeek to new daysOfWeek array
        if (settings.dayOfWeek !== undefined && settings.daysOfWeek === undefined) {
          settings.daysOfWeek = [settings.dayOfWeek];
          delete settings.dayOfWeek;
          
          // Save the migrated settings
          await reminderUtils.saveReminderSettings({
            ...settings,
            createdAt: new Date(settings.createdAt),
            updatedAt: new Date()
          });
          
          console.log('Migrated reminder settings from single day to multiple days');
        }
        
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
      await AsyncStorage.setItem(REMINDER_SETTINGS_KEY, settingsJson);
    } catch (error) {
      console.error('Error saving reminder settings:', error);
    }
  },

  // Create default reminder settings
  createDefaultSettings: (): ReminderSettings => {
    const now = new Date();
    return {
      id: reminderUtils.generateId(),
      enabled: false,
      daysOfWeek: [1], // Monday by default
      time: '19:00', // 7:00 PM
      createdAt: now,
      updatedAt: now
    };
  },

  // Update reminder settings
  updateReminderSettings: async (updates: Partial<Omit<ReminderSettings, 'id' | 'createdAt'>>): Promise<ReminderSettings | null> => {
    try {
      let currentSettings = await reminderUtils.loadReminderSettings();
      
      if (!currentSettings) {
        currentSettings = reminderUtils.createDefaultSettings();
      }

      const updatedSettings: ReminderSettings = {
        ...currentSettings,
        ...updates,
        updatedAt: new Date()
      };

      await reminderUtils.saveReminderSettings(updatedSettings);
      return updatedSettings;
    } catch (error) {
      console.error('Error updating reminder settings:', error);
      return null;
    }
  },

  // Toggle reminder enabled/disabled
  toggleReminderEnabled: async (): Promise<ReminderSettings | null> => {
    const currentSettings = await reminderUtils.loadReminderSettings();
    const enabled = currentSettings ? !currentSettings.enabled : true;
    return await reminderUtils.updateReminderSettings({ enabled });
  },

  // Set reminder days of week
  setReminderDays: async (daysOfWeek: number[]): Promise<ReminderSettings | null> => {
    // Validate all days
    const validDays = daysOfWeek.filter(day => day >= 0 && day <= 6);
    if (validDays.length !== daysOfWeek.length) {
      console.error('Invalid days of week:', daysOfWeek);
      return null;
    }
    
    // Remove duplicates and sort
    const uniqueDays = [...new Set(validDays)].sort();
    return await reminderUtils.updateReminderSettings({ daysOfWeek: uniqueDays });
  },

  // Toggle a specific day on/off
  toggleReminderDay: async (dayOfWeek: number): Promise<ReminderSettings | null> => {
    if (dayOfWeek < 0 || dayOfWeek > 6) {
      console.error('Invalid day of week:', dayOfWeek);
      return null;
    }

    const currentSettings = await reminderUtils.loadReminderSettings();
    if (!currentSettings) {
      // Create new settings with this day selected
      return await reminderUtils.updateReminderSettings({ daysOfWeek: [dayOfWeek] });
    }

    const currentDays = currentSettings.daysOfWeek || [];
    const dayIndex = currentDays.indexOf(dayOfWeek);
    
    let newDays: number[];
    if (dayIndex >= 0) {
      // Day is selected, remove it
      newDays = currentDays.filter(day => day !== dayOfWeek);
    } else {
      // Day is not selected, add it
      newDays = [...currentDays, dayOfWeek].sort();
    }

    return await reminderUtils.updateReminderSettings({ daysOfWeek: newDays });
  },

  // Set reminder time
  setReminderTime: async (time: string): Promise<ReminderSettings | null> => {
    // Validate time format (HH:MM)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(time)) {
      console.error('Invalid time format:', time);
      return null;
    }
    return await reminderUtils.updateReminderSettings({ time });
  }
};