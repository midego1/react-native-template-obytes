import * as Location from 'expo-location';
import { useCallback, useEffect, useState } from 'react';

type LocationData = {
  latitude: number;
  longitude: number;
};

type UseUserLocationReturn = {
  location: LocationData | null;
  error: string | null;
  loading: boolean;
  permissionStatus: Location.PermissionStatus | null;
  requestPermission: () => Promise<boolean>;
  refreshLocation: () => Promise<void>;
};

// Default location (Kuala Lumpur) for fallback
const DEFAULT_LOCATION: LocationData = {
  latitude: 3.139,
  longitude: 101.6869,
};

export function useUserLocation(): UseUserLocationReturn {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [permissionStatus, setPermissionStatus]
    = useState<Location.PermissionStatus | null>(null);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setPermissionStatus(status);
      return status === Location.PermissionStatus.GRANTED;
    }
    catch {
      setError('Failed to request location permission');
      return false;
    }
  }, []);

  const refreshLocation = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      setPermissionStatus(status);

      if (status !== Location.PermissionStatus.GRANTED) {
        // Use default location if permission not granted
        setLocation(DEFAULT_LOCATION);
        setLoading(false);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });
    }
    catch {
      setError('Failed to get location');
      setLocation(DEFAULT_LOCATION);
    }
    finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshLocation();
  }, [refreshLocation]);

  return {
    location,
    error,
    loading,
    permissionStatus,
    requestPermission,
    refreshLocation,
  };
}
