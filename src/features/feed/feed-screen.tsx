import type { ActivitiesBottomSheetRef } from '@/components/home';
import type { MapViewRef } from '@/components/map';
import type { Activity, ActivityCategory } from '@/types/activity';
import { router } from 'expo-router';
import * as React from 'react';
import { useCallback, useMemo, useRef, useState } from 'react';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useActivities } from '@/api/activities/use-activities';
import {
  ActivitiesBottomSheet,
  CategoryChips,
  CreateFab,
  ErrorView,
  HomeHeader,
  ListToggleButton,
  LocationButton,
  SparkleButton,
  TravelersCard,
} from '@/components/home';
import { MapViewComponent } from '@/components/map';
import { FocusAwareStatusBar, View } from '@/components/ui';
import { useUserLocation } from '@/hooks/use-user-location';

type ViewMode = 'map' | 'list';

export function FeedScreen() {
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapViewRef>(null);
  const bottomSheetRef = useRef<ActivitiesBottomSheetRef>(null);

  const [viewMode, setViewMode] = useState<ViewMode>('map');
  const [selectedCategory, setSelectedCategory] = useState<ActivityCategory | 'all' | 'popular'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { location, refreshLocation } = useUserLocation();

  const { data, isPending, isError, refetch } = useActivities({
    status: 'active',
    limit: 50,
    category: selectedCategory === 'all' || selectedCategory === 'popular' ? undefined : selectedCategory,
  });

  const filteredActivities = useMemo(() => {
    const activities = data?.activities || [];
    if (!searchQuery.trim())
      return activities;
    const query = searchQuery.toLowerCase();
    return activities.filter(
      activity =>
        activity.title.toLowerCase().includes(query)
        || activity.description?.toLowerCase().includes(query)
        || activity.location_name.toLowerCase().includes(query),
    );
  }, [data?.activities, searchQuery]);

  const initialRegion = useMemo(() => {
    if (location) {
      return { latitude: location.latitude, longitude: location.longitude, latitudeDelta: 0.1, longitudeDelta: 0.1 };
    }
    return { latitude: 3.139, longitude: 101.6869, latitudeDelta: 0.1, longitudeDelta: 0.1 };
  }, [location]);

  const handleMarkerPress = useCallback((activity: Activity) => {
    router.push(`/activity/${activity.id}`);
  }, []);

  const handleLocationPress = useCallback(() => {
    if (location) {
      mapRef.current?.animateToRegion({ latitude: location.latitude, longitude: location.longitude, latitudeDelta: 0.05, longitudeDelta: 0.05 });
    }
    else {
      refreshLocation();
    }
  }, [location, refreshLocation]);

  const handleToggleView = useCallback(() => {
    if (viewMode === 'map') {
      bottomSheetRef.current?.snapToIndex(2);
      setViewMode('list');
    }
    else {
      bottomSheetRef.current?.snapToIndex(0);
      setViewMode('map');
    }
  }, [viewMode]);

  if (isError) {
    return <ErrorView onRetry={refetch} />;
  }

  return (
    <View className="flex-1 bg-gray-50">
      <FocusAwareStatusBar />
      <MapViewComponent ref={mapRef} activities={filteredActivities} initialRegion={initialRegion} onMarkerPress={handleMarkerPress} showsUserLocation />
      <HomeHeader />
      <View className="absolute left-4" style={{ top: insets.top + 70 }}>
        <SparkleButton />
      </View>
      <View className="absolute right-4" style={{ top: insets.top + 70 }}>
        <TravelersCard count={100} />
      </View>
      {viewMode === 'map' && (
        <View className="absolute inset-x-0" style={{ top: insets.top + 130 }}>
          <CategoryChips selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} totalCount={data?.count || 0} />
        </View>
      )}
      <View className="absolute right-4" style={{ bottom: 180 }}>
        <LocationButton onPress={handleLocationPress} />
      </View>
      <View className="absolute left-1/2 -translate-x-1/2" style={{ bottom: 130 }}>
        <ListToggleButton viewMode={viewMode} onPress={handleToggleView} />
      </View>
      <View className="absolute right-4" style={{ bottom: 120 }}>
        <CreateFab />
      </View>
      <ActivitiesBottomSheet
        ref={bottomSheetRef}
        activities={filteredActivities}
        isLoading={isPending}
        totalCount={data?.count || 0}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
    </View>
  );
}
