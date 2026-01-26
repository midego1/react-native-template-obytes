import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui';
import { ACTIVITY_CATEGORIES } from '@/types/activity';

type CategorySelectorProps = {
  value: string;
  onChange: (category: string) => void;
  error?: string;
};

export function CategorySelector({ value, onChange, error }: CategorySelectorProps) {
  return (
    <View className="mb-4">
      <Text className="mb-2 font-semibold text-gray-900 dark:text-gray-100">
        Category *
      </Text>
      <View className="flex-row flex-wrap gap-2">
        {ACTIVITY_CATEGORIES.map(cat => (
          <Pressable
            key={cat.value}
            onPress={() => onChange(cat.value)}
            className={`rounded-full px-4 py-2 ${
              value === cat.value
                ? 'bg-indigo-500 dark:bg-indigo-600'
                : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
            }`}
          >
            <Text
              className={
                value === cat.value
                  ? 'font-semibold text-white'
                  : 'text-gray-700 dark:text-gray-300'
              }
            >
              {cat.emoji}
              {' '}
              {cat.label}
            </Text>
          </Pressable>
        ))}
      </View>
      {error && (
        <Text className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</Text>
      )}
    </View>
  );
}
