import type { Region } from 'react-native-maps';
import type { Activity } from '@/types/activity';
import * as React from 'react';
import { useImperativeHandle, useRef } from 'react';

import { Platform, StyleSheet } from 'react-native';
import MapView, { PROVIDER_DEFAULT } from 'react-native-maps';

import { View } from '../ui';
import { ActivityMarker } from './activity-marker';

type MapViewComponentProps = {
  activities: Activity[];
  initialRegion?: Region;
  onRegionChange?: (region: Region) => void;
  onMarkerPress?: (activity: Activity) => void;
  showsUserLocation?: boolean;
};

export type MapViewRef = {
  animateToRegion: (region: Region, duration?: number) => void;
  fitToCoordinates: (coordinates: { latitude: number; longitude: number }[]) => void;
};

// Default region (Kuala Lumpur)
const DEFAULT_REGION: Region = {
  latitude: 3.139,
  longitude: 101.6869,
  latitudeDelta: 0.1,
  longitudeDelta: 0.1,
};

export function MapViewComponent({ ref, activities, initialRegion = DEFAULT_REGION, onRegionChange, onMarkerPress, showsUserLocation = true }: MapViewComponentProps & { ref?: React.RefObject<MapViewRef | null> }) {
  const mapRef = useRef<MapView>(null);

  useImperativeHandle(ref, () => ({
    animateToRegion: (region: Region, duration = 500) => {
      mapRef.current?.animateToRegion(region, duration);
    },
    fitToCoordinates: (coordinates) => {
      if (coordinates.length > 0) {
        mapRef.current?.fitToCoordinates(coordinates, {
          edgePadding: { top: 100, right: 50, bottom: 300, left: 50 },
          animated: true,
        });
      }
    },
  }));

  // Filter activities that have coordinates
  const activitiesWithLocation = activities.filter(
    a => a.latitude && a.longitude,
  );

  return (
    <View className="flex-1">
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={Platform.OS === 'ios' ? PROVIDER_DEFAULT : PROVIDER_DEFAULT}
        initialRegion={initialRegion}
        onRegionChangeComplete={onRegionChange}
        showsUserLocation={showsUserLocation}
        showsMyLocationButton={false}
        showsCompass={false}
        mapType="standard"
      >
        {activitiesWithLocation.map(activity => (
          <ActivityMarker
            key={activity.id}
            activity={activity}
            onPress={onMarkerPress}
          />
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});
