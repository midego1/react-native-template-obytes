import type { ActivityCategory } from '@/types/activity';
import * as React from 'react';

import { Pressable, ScrollView } from 'react-native';
import { ACTIVITY_CATEGORIES } from '@/types/activity';

import { Text } from '../ui';

type CategoryChipsProps = {
  selectedCategory: ActivityCategory | 'all' | 'popular';
  onSelectCategory: (category: ActivityCategory | 'all' | 'popular') => void;
  activityCounts?: Record<string, number>;
  totalCount?: number;
};

const SPECIAL_CATEGORIES = [
  { value: 'popular' as const, label: 'Popular', emoji: '🔥' },
  { value: 'all' as const, label: 'All', emoji: '' },
];

export function CategoryChips({
  selectedCategory,
  onSelectCategory,
  activityCounts = {},
  totalCount = 0,
}: CategoryChipsProps) {
  const allCategories = [
    ...SPECIAL_CATEGORIES,
    ...ACTIVITY_CATEGORIES,
  ];

  const getCount = (value: string) => {
    if (value === 'all')
      return totalCount;
    if (value === 'popular')
      return null; // Don't show count for popular
    return activityCounts[value] || 0;
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
    >
      {allCategories.map((category) => {
        const isSelected = selectedCategory === category.value;
        const count = getCount(category.value);

        return (
          <Pressable
            key={category.value}
            onPress={() => onSelectCategory(category.value)}
            className={`flex-row items-center rounded-full px-4 py-2 ${
              isSelected
                ? 'bg-pink-500'
                : category.value === 'popular'
                  ? 'border border-pink-300 bg-white'
                  : 'bg-white'
            }`}
          >
            {category.emoji && (
              <Text className="mr-1">{category.emoji}</Text>
            )}
            <Text
              className={`font-medium ${
                isSelected
                  ? 'text-white'
                  : category.value === 'popular'
                    ? 'text-pink-500'
                    : 'text-gray-700'
              }`}
            >
              {category.label}
            </Text>
            {count !== null && count > 0 && (
              <Text
                className={`ml-1 ${
                  isSelected ? 'text-white/80' : 'text-gray-400'
                }`}
              >
                (
                {count}
                )
              </Text>
            )}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
