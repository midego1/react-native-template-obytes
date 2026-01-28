import type { Activity } from '@/types/activity';
import * as React from 'react';
import { memo } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { Marker } from 'react-native-maps';
import { ACTIVITY_CATEGORIES } from '@/types/activity';

import { Image, Text, View } from '../ui';

type ActivityMarkerProps = {
  activity: Activity;
  onPress?: (activity: Activity) => void;
};

function ActivityMarkerComponent({ activity, onPress }: ActivityMarkerProps) {
  const category = ACTIVITY_CATEGORIES.find(
    c => c.value === activity.category,
  );
  const emoji = category?.emoji || '📍';

  if (!activity.latitude || !activity.longitude) {
    return null;
  }

  return (
    <Marker
      coordinate={{
        latitude: activity.latitude,
        longitude: activity.longitude,
      }}
      onPress={() => onPress?.(activity)}
      tracksViewChanges={false}
    >
      <Pressable style={styles.markerContainer}>
        <View className="items-center justify-center rounded-full bg-white p-2 shadow-md">
          {activity.host?.avatar_url
            ? (
                <View className="relative">
                  <Image
                    source={{ uri: activity.host.avatar_url }}
                    className="size-10 rounded-full"
                    contentFit="cover"
                  />
                  <View className="absolute -right-1 -bottom-1 rounded-full bg-white p-0.5">
                    <Text className="text-xs">{emoji}</Text>
                  </View>
                </View>
              )
            : (
                <Text className="text-2xl">{emoji}</Text>
              )}
        </View>
        {activity.attendee_count && activity.attendee_count > 1 && (
          <View className="absolute -top-1 -right-1 size-5 items-center justify-center rounded-full bg-gray-700">
            <Text className="text-xs font-bold text-white">
              {activity.attendee_count}
            </Text>
          </View>
        )}
      </Pressable>
    </Marker>
  );
}

const styles = StyleSheet.create({
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export const ActivityMarker = memo(ActivityMarkerComponent);
