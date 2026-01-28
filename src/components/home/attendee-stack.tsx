import * as React from 'react';

import { Image, Text, View } from '../ui';

type AttendeeStackProps = {
  avatars: (string | undefined)[];
  totalCount: number;
  maxDisplay?: number;
};

export function AttendeeStack({
  avatars,
  totalCount,
  maxDisplay = 3,
}: AttendeeStackProps) {
  const displayAvatars = avatars.filter(Boolean).slice(0, maxDisplay) as string[];

  if (totalCount === 0) {
    return null;
  }

  return (
    <View className="flex-row items-center">
      {/* Stacked Avatars */}
      <View className="flex-row">
        {displayAvatars.map((avatar, index) => (
          <View
            key={`${avatar}-${index}`}
            className="-ml-2 first:ml-0"
            style={{ zIndex: maxDisplay - index }}
          >
            <Image
              source={{ uri: avatar }}
              className="size-7 rounded-full border-2 border-white"
              contentFit="cover"
            />
          </View>
        ))}
        {displayAvatars.length === 0 && (
          <View className="size-7 items-center justify-center rounded-full bg-pink-100">
            <Text className="text-xs">👤</Text>
          </View>
        )}
      </View>

      {/* Count Label */}
      <Text className="ml-2 text-sm text-gray-500">
        {totalCount}
        {' '}
        going
      </Text>
    </View>
  );
}
