import * as React from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { Text } from '../ui';

type LocationButtonProps = {
  onPress: () => void;
};

export function LocationButton({ onPress }: LocationButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      className="size-12 items-center justify-center rounded-full bg-white active:bg-gray-100"
      style={styles.controlButton}
    >
      <Text className="text-xl">📍</Text>
    </Pressable>
  );
}

type ListToggleButtonProps = {
  viewMode: 'map' | 'list';
  onPress: () => void;
};

export function ListToggleButton({ viewMode, onPress }: ListToggleButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center rounded-full bg-white px-4 py-2 active:bg-gray-100"
      style={styles.controlButton}
    >
      <Text className="mr-1">
        {viewMode === 'map'
          ? '☰'
          : '🗺️'}
      </Text>
      <Text className="font-medium text-gray-700">
        {viewMode === 'map'
          ? 'List'
          : 'Map'}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  controlButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
});
