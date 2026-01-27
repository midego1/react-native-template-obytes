import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Only import on native platforms (web doesn't support these)
const Device = Platform.OS !== 'web' ? require('expo-device') : null;
const Notifications = Platform.OS !== 'web' ? require('expo-notifications') : null;

/**
 * Configure notification handling behavior
 */
if (Platform.OS !== 'web' && Notifications) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}

/**
 * Request notification permissions
 * Returns the push token if permissions are granted
 */
export async function requestNotificationPermissions(): Promise<string | null> {
  // Web doesn't support push notifications
  if (Platform.OS === 'web' || !Device || !Notifications) {
    if (__DEV__) {
      console.warn('Push notifications not supported on web');
    }
    return null;
  }

  // Notifications don't work on simulators
  if (!Device.isDevice) {
    if (__DEV__) {
      console.warn('Push notifications only work on physical devices');
    }
    return null;
  }

  // Check existing permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  // Request permissions if not granted
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    if (__DEV__) {
      console.warn('Notification permissions not granted');
    }
    return null;
  }

  // Get push token
  try {
    const token = await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig?.extra?.eas?.projectId,
    });
    return token.data;
  }
  catch (error) {
    if (__DEV__) {
      console.error('Failed to get push token:', error);
    }
    return null;
  }
}

/**
 * Configure notification channels for Android
 */
export async function setupNotificationChannels() {
  if (Platform.OS === 'web' || !Notifications)
    return;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('messages', {
      name: 'Messages',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#6366F1',
    });

    await Notifications.setNotificationChannelAsync('crew-requests', {
      name: 'Crew Requests',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#6366F1',
    });

    await Notifications.setNotificationChannelAsync('activities', {
      name: 'Activities',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#6366F1',
    });
  }
}

/**
 * Handle notification tap
 * Returns the notification data
 */
export function addNotificationResponseListener(
  handler: (response: any) => void,
): any {
  if (Platform.OS === 'web' || !Notifications) {
    return { remove: () => {} };
  }
  return Notifications.addNotificationResponseReceivedListener(handler);
}

/**
 * Handle notification received while app is foregrounded
 */
export function addNotificationReceivedListener(
  handler: (notification: any) => void,
): any {
  if (Platform.OS === 'web' || !Notifications) {
    return { remove: () => {} };
  }
  return Notifications.addNotificationReceivedListener(handler);
}

/**
 * Clear all notifications
 */
export async function clearAllNotifications() {
  if (Platform.OS === 'web' || !Notifications)
    return;
  await Notifications.dismissAllNotificationsAsync();
}

/**
 * Get current badge count
 */
export async function getBadgeCount(): Promise<number> {
  if (Platform.OS === 'web' || !Notifications)
    return 0;
  return await Notifications.getBadgeCountAsync();
}

/**
 * Set badge count
 */
export async function setBadgeCount(count: number) {
  if (Platform.OS === 'web' || !Notifications)
    return;
  await Notifications.setBadgeCountAsync(count);
}
