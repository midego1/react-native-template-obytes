import { router } from 'expo-router';
import * as React from 'react';
import { Pressable } from 'react-native';

import { Image, Text, View } from '../ui';

type TravelersCardProps = {
  count?: number;
  avatars?: string[];
};

export function TravelersCard({ count = 100, avatars = [] }: TravelersCardProps) {
  // Use placeholder avatars if none provided
  const displayAvatars = avatars.length > 0 ? avatars.slice(0, 3) : [];

  return (
    <Pressable
      onPress={() => router.push('/crew')}
      className="flex-row items-center rounded-full bg-white/95 px-3 py-2 shadow-md active:opacity-80"
    >
      {/* Stacked Avatars */}
      <View className="mr-2 flex-row">
        {displayAvatars.map((avatar, index) => (
          <View
            key={avatar}
            className="-ml-2 first:ml-0"
            style={{ zIndex: displayAvatars.length - index }}
          >
            <Image
              source={{ uri: avatar }}
              className="size-8 rounded-full border-2 border-white"
              contentFit="cover"
            />
          </View>
        ))}
        {displayAvatars.length === 0 && (
          <View className="size-8 items-center justify-center rounded-full bg-gray-100">
            <Text className="text-sm">👤</Text>
          </View>
        )}
      </View>

      {/* Count Badge */}
      <View className="mr-1 rounded-full bg-pink-500 px-2 py-0.5">
        <Text className="text-xs font-bold text-white">
          {count > 99 ? '100+' : count}
        </Text>
      </View>

      {/* Label */}
      <Text className="mr-1 text-sm font-medium text-gray-700">
        Travelers Here
      </Text>

      {/* Arrow */}
      <Text className="text-gray-400">›</Text>
    </Pressable>
  );
}
