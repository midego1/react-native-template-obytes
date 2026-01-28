import * as React from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { Text, View } from '../ui';

type SparkleButtonProps = {
  onPress?: () => void;
};

export function SparkleButton({ onPress }: SparkleButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      className="size-12 items-center justify-center rounded-full bg-white active:bg-gray-100"
      style={styles.button}
    >
      <View className="items-center justify-center">
        <Text className="text-2xl">✨</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
});
