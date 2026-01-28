import { router } from 'expo-router';
import * as React from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { Text } from '../ui';

export function CreateFab() {
  return (
    <Pressable
      onPress={() => router.push('/create-activity')}
      className="size-14 items-center justify-center rounded-full bg-pink-500 active:bg-pink-600"
      style={styles.fab}
    >
      <Text className="text-3xl font-light text-white">+</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
});
