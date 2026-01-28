import { useEffect } from 'react';
import { usePushNotifications } from '@/hooks/use-push-notifications';

/**
 * Initialize push notifications on app startup
 * This component doesn't render anything, it just sets up notifications
 */
export function NotificationInitializer() {
  const { permissionStatus } = usePushNotifications();

  useEffect(() => {
    // Notifications are initialized in the hook
    // This component just ensures the hook is called
  }, []);

  return null;
}
