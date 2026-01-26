import { View } from 'react-native';
import { Text } from '@/components/ui';

type UnreadBadgeProps = {
  count: number;
};

export function UnreadBadge({ count }: UnreadBadgeProps) {
  if (count === 0)
    return null;

  const displayCount = count > 99 ? '99+' : count.toString();

  return (
    <View className="absolute -right-1 -top-1 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5">
      <Text className="text-xs font-bold text-white">{displayCount}</Text>
    </View>
  );
}
