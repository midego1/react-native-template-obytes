import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useRegisterPushToken } from '@/api/notifications/use-register-push-token';
import {
  addNotificationReceivedListener,
  addNotificationResponseListener,
  requestNotificationPermissions,
  setupNotificationChannels,
} from '@/lib/notifications';

/**
 * Main hook for setting up push notifications
 * Handles permissions, token registration, and notification routing
 */
export function usePushNotifications() {
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'undetermined'>(
    'undetermined',
  );
  const router = useRouter();
  const { mutate: registerToken } = useRegisterPushToken();

  // Initialize notifications
  useEffect(() => {
    setupNotificationChannels();
    initializeNotifications();

    // Set up notification handlers
    const responseSubscription = addNotificationResponseListener((response) => {
      handleNotificationTap(response);
    });

    const receivedSubscription = addNotificationReceivedListener((notification) => {
      // Handle notification received while app is foregrounded
      console.log('Notification received:', notification);
    });

    return () => {
      responseSubscription.remove();
      receivedSubscription.remove();
    };
  }, []);

  const initializeNotifications = async () => {
    const token = await requestNotificationPermissions();

    if (token) {
      setPushToken(token);
      setPermissionStatus('granted');
      registerToken(token);
    }
    else {
      setPermissionStatus('denied');
    }
  };

  const handleNotificationTap = (response: Notifications.NotificationResponse) => {
    const data = response.notification.request.content.data;

    // Route based on notification type
    if (data.type === 'message' && data.conversationId) {
      router.push(`/chats/${data.conversationId}`);
    }
    else if (data.type === 'crew_request' && data.userId) {
      router.push(`/user/${data.userId}`);
    }
    else if (data.type === 'activity' && data.activityId) {
      router.push(`/activity/${data.activityId}`);
    }
  };

  const requestPermissions = async () => {
    await initializeNotifications();
  };

  return {
    pushToken,
    permissionStatus,
    requestPermissions,
  };
}
