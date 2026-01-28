import type { SelectedPlace } from '@/components/ui/place-autocomplete';
import { useCallback, useRef } from 'react';
import { Linking, Pressable, ScrollView, View } from 'react-native';

import { Input, PlaceAutocomplete, Text } from '@/components/ui';
import { getFieldError } from '@/components/ui/form-utils';

import { CategorySelector } from './category-selector';
import { useWizard } from './wizard-context';

export function StepWhatWhere() {
  const {
    form,
    selectedPlace,
    setSelectedPlace,
    isManualEntry,
    setIsManualEntry,
  } = useWizard();

  const scrollViewRef = useRef<ScrollView>(null);
  const locationSectionY = useRef<number>(0);

  const handleLocationFocus = useCallback(() => {
    scrollViewRef.current?.scrollTo({ y: locationSectionY.current, animated: true });
  }, []);

  const handleOpenInMaps = useCallback(() => {
    if (!selectedPlace)
      return;

    let url: string;
    if (selectedPlace.placeId) {
      const query = encodeURIComponent(selectedPlace.name);
      url = `https://www.google.com/maps/search/?api=1&query=${query}&query_place_id=${selectedPlace.placeId}`;
    }
    else if (selectedPlace.latitude && selectedPlace.longitude) {
      url = `https://www.google.com/maps/search/?api=1&query=${selectedPlace.latitude},${selectedPlace.longitude}`;
    }
    else {
      const query = encodeURIComponent(
        `${selectedPlace.name}, ${selectedPlace.address || ''} ${selectedPlace.city}, ${selectedPlace.country}`,
      );
      url = `https://www.google.com/maps/search/?api=1&query=${query}`;
    }

    Linking.openURL(url);
  }, [selectedPlace]);

  const handlePlaceSelect = useCallback(
    (place: SelectedPlace) => {
      setSelectedPlace(place);
      form.setFieldValue('location_name', place.name);
      form.setFieldValue('location_address', place.address || '');
      form.setFieldValue('city', place.city);
      form.setFieldValue('country', place.country);
      form.setFieldValue('latitude', place.latitude);
      form.setFieldValue('longitude', place.longitude);
    },
    [form, setSelectedPlace],
  );

  const handleManualEntry = useCallback(() => {
    setIsManualEntry(true);
    setSelectedPlace(null);
  }, [setIsManualEntry, setSelectedPlace]);

  const handleChangeLocation = useCallback(() => {
    setSelectedPlace(null);
    setIsManualEntry(false);
    form.setFieldValue('location_name', '');
    form.setFieldValue('location_address', '');
    form.setFieldValue('city', '');
    form.setFieldValue('country', '');
    form.setFieldValue('latitude', undefined);
    form.setFieldValue('longitude', undefined);
  }, [form, setIsManualEntry, setSelectedPlace]);

  const handleBackToSearch = useCallback(() => {
    setIsManualEntry(false);
  }, [setIsManualEntry]);

  const getLocationError = () => {
    if (selectedPlace || isManualEntry)
      return undefined;
    const cityError = form.getFieldValue('city') === '' && form.state.isSubmitted;
    const nameError = form.getFieldValue('location_name') === '' && form.state.isSubmitted;
    if (cityError || nameError) {
      return 'Please select a location';
    }
    return undefined;
  };

  return (
    <View className="p-4">
      {/* Title */}
      <form.Field
        name="title"
        children={(field: any) => (
          <View className="mb-4">
            <Text className="mb-2 font-semibold text-gray-900 dark:text-gray-100">
              What's the plan? *
            </Text>
            <Input
              placeholder="Coffee & coworking"
              value={field.state.value}
              onChangeText={field.handleChange}
              onBlur={field.handleBlur}
              error={getFieldError(field)}
            />
          </View>
        )}
      />

      {/* Description - right after title */}
      <form.Field
        name="description"
        children={(field: any) => (
          <View className="mb-4">
            <Text className="mb-2 font-semibold text-gray-900 dark:text-gray-100">
              Description (optional)
            </Text>
            <Input
              placeholder="Tell people what to expect..."
              value={field.state.value}
              onChangeText={field.handleChange}
              onBlur={field.handleBlur}
              multiline
              numberOfLines={3}
              error={getFieldError(field)}
            />
          </View>
        )}
      />

      {/* Location Section */}
      <View
        className="mb-4"
        onLayout={(event) => {
          locationSectionY.current = event.nativeEvent.layout.y;
        }}
      >
        <Text className="mb-2 font-semibold text-gray-900 dark:text-gray-100">
          Where? *
        </Text>

        {/* Selected Place Card */}
        {selectedPlace && !isManualEntry && (
          <View className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-800">
            <View className="flex-row items-start justify-between">
              <View className="flex-1">
                <Text className="text-lg font-semibold text-neutral-900 dark:text-white">
                  {selectedPlace.name}
                </Text>
                {selectedPlace.address && (
                  <Text className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                    {selectedPlace.address}
                  </Text>
                )}
              </View>
              <Pressable
                onPress={handleChangeLocation}
                className="ml-2 rounded-lg bg-neutral-100 px-3 py-1.5 dark:bg-neutral-700"
              >
                <Text className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                  Change
                </Text>
              </Pressable>
            </View>
            <View className="mt-1 flex-row items-center justify-between">
              <Text className="text-sm text-neutral-600 dark:text-neutral-300">
                {selectedPlace.city}
                ,
                {selectedPlace.country}
              </Text>
              <Pressable onPress={handleOpenInMaps}>
                <Text className="text-sm text-indigo-600 dark:text-indigo-400">
                  View in Maps
                </Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Place Autocomplete */}
        {!selectedPlace && !isManualEntry && (
          <PlaceAutocomplete
            placeholder="Search for a place..."
            onPlaceSelect={handlePlaceSelect}
            onManualEntry={handleManualEntry}
            onFocus={handleLocationFocus}
            error={getLocationError()}
          />
        )}

        {/* Manual Entry Mode */}
        {isManualEntry && (
          <View>
            <Pressable onPress={handleBackToSearch} className="mb-3">
              <Text className="text-sm text-indigo-600 dark:text-indigo-400">
                ← Back to search
              </Text>
            </Pressable>

            <form.Field
              name="location_name"
              children={(field: any) => (
                <View className="mb-3">
                  <Input
                    label="Location Name *"
                    placeholder="Starbucks Reserve"
                    value={field.state.value}
                    onChangeText={field.handleChange}
                    onBlur={field.handleBlur}
                    error={getFieldError(field)}
                  />
                </View>
              )}
            />

            <form.Field
              name="location_address"
              children={(field: any) => (
                <View className="mb-3">
                  <Input
                    label="Address (optional)"
                    placeholder="1124 Pike St"
                    value={field.state.value}
                    onChangeText={field.handleChange}
                    onBlur={field.handleBlur}
                    error={getFieldError(field)}
                  />
                </View>
              )}
            />

            <View className="flex-row gap-2">
              <form.Field
                name="city"
                children={(field: any) => (
                  <View className="flex-1">
                    <Input
                      label="City *"
                      placeholder="Seattle"
                      value={field.state.value}
                      onChangeText={field.handleChange}
                      onBlur={field.handleBlur}
                      error={getFieldError(field)}
                    />
                  </View>
                )}
              />

              <form.Field
                name="country"
                children={(field: any) => (
                  <View className="flex-1">
                    <Input
                      label="Country *"
                      placeholder="United States"
                      value={field.state.value}
                      onChangeText={field.handleChange}
                      onBlur={field.handleBlur}
                      error={getFieldError(field)}
                    />
                  </View>
                )}
              />
            </View>
          </View>
        )}
      </View>

      {/* Divider */}
      <View className="my-4 h-px bg-gray-200 dark:bg-gray-700" />

      {/* Category */}
      <form.Field
        name="category"
        children={(field: any) => (
          <CategorySelector
            value={field.state.value}
            onChange={field.handleChange}
            error={getFieldError(field)}
          />
        )}
      />
    </View>
  );
}
