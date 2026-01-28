import type { Activity, ActivityCategory } from '@/types/activity';
import BottomSheet, { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import * as React from 'react';
import { useCallback, useImperativeHandle, useMemo, useRef } from 'react';

import { TextInput } from 'react-native';

import { Text, View } from '../ui';
import { ActivityListItem } from './activity-list-item';
import { CategoryChips } from './category-chips';

type ActivitiesBottomSheetProps = {
  activities: Activity[];
  isLoading?: boolean;
  totalCount: number;
  selectedCategory: ActivityCategory | 'all' | 'popular';
  onSelectCategory: (category: ActivityCategory | 'all' | 'popular') => void;
  onSearchChange?: (text: string) => void;
  searchQuery?: string;
};

export type ActivitiesBottomSheetRef = {
  expand: () => void;
  collapse: () => void;
  snapToIndex: (index: number) => void;
};

export function ActivitiesBottomSheet({ ref, activities, isLoading, totalCount, selectedCategory, onSelectCategory, onSearchChange, searchQuery = '' }: ActivitiesBottomSheetProps & { ref?: React.RefObject<ActivitiesBottomSheetRef | null> }) {
  const bottomSheetRef = useRef<BottomSheet>(null);

  // Snap points: collapsed shows header, mid shows some items, expanded is full
  const snapPoints = useMemo(() => ['35%', '70%', '90%'], []);

  useImperativeHandle(ref, () => ({
    expand: () => bottomSheetRef.current?.expand(),
    collapse: () => bottomSheetRef.current?.collapse(),
    snapToIndex: (index: number) => bottomSheetRef.current?.snapToIndex(index),
  }));

  const renderItem = useCallback(
    ({ item }: { item: Activity }) => <ActivityListItem activity={item} />,
    [],
  );

  const keyExtractor = useCallback((item: Activity) => item.id, []);

  const ListHeaderComponent = useMemo(
    () => (
      <View className="pb-4">
        {/* Title */}
        <Text className="mb-4 text-center text-xl font-bold text-gray-900">
          {totalCount}
          {' '}
          {totalCount === 1 ? 'activity' : 'activities'}
          {' '}
          in this area
        </Text>

        {/* Search Bar */}
        <View className="mx-4 mb-4 flex-row items-center rounded-xl bg-gray-100 px-4 py-3">
          <Text className="mr-2 text-gray-400">🔍</Text>
          <TextInput
            value={searchQuery}
            onChangeText={onSearchChange}
            placeholder="Search activities..."
            placeholderTextColor="#9CA3AF"
            className="flex-1 text-base text-gray-900"
          />
        </View>

        {/* Category Chips */}
        <CategoryChips
          selectedCategory={selectedCategory}
          onSelectCategory={onSelectCategory}
          totalCount={totalCount}
        />
      </View>
    ),
    [totalCount, searchQuery, onSearchChange, selectedCategory, onSelectCategory],
  );

  const ListEmptyComponent = useMemo(
    () => (
      <View className="items-center justify-center py-12">
        {isLoading
          ? (
              <Text className="text-gray-500">Loading activities...</Text>
            )
          : (
              <>
                <Text className="mb-2 text-4xl">🔍</Text>
                <Text className="text-gray-500">No activities found</Text>
              </>
            )}
      </View>
    ),
    [isLoading],
  );

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={0}
      snapPoints={snapPoints}
      enablePanDownToClose={false}
      backgroundStyle={{ backgroundColor: '#F9FAFB', borderRadius: 24 }}
      handleIndicatorStyle={{ backgroundColor: '#D1D5DB', width: 40 }}
    >
      <BottomSheetFlatList
        data={activities}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={ListHeaderComponent}
        ListEmptyComponent={ListEmptyComponent}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      />
    </BottomSheet>
  );
}
