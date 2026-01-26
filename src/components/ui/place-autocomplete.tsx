import type { PlaceSuggestion } from '@/lib/google-places';
import * as React from 'react';
import {
  ActivityIndicator,
  I18nManager,
  Keyboard,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { tv } from 'tailwind-variants';
import {
  generateSessionToken,
  getPlaceDetails,
  placesAutocomplete,
} from '@/lib/google-places';

import colors from './colors';
import { Text } from './text';

const inputTv = tv({
  slots: {
    container: 'mb-2',
    label: 'text-grey-100 mb-1 text-lg dark:text-neutral-100',
    input:
      'font-inter mt-0 rounded-xl border-[0.5px] border-neutral-300 bg-neutral-100 px-4 py-3 text-base/5 font-medium dark:border-neutral-700 dark:bg-neutral-800 dark:text-white',
  },
  variants: {
    focused: {
      true: {
        input: 'border-neutral-400 dark:border-neutral-300',
      },
    },
    error: {
      true: {
        input: 'border-danger-600',
        label: 'text-danger-600 dark:text-danger-600',
      },
    },
  },
  defaultVariants: {
    focused: false,
    error: false,
  },
});

export type SelectedPlace = {
  placeId?: string;
  name: string;
  address?: string;
  city: string;
  country: string;
  latitude?: number;
  longitude?: number;
};

export type PlaceAutocompleteProps = {
  label?: string;
  placeholder?: string;
  error?: string;
  onPlaceSelect: (place: SelectedPlace) => void;
  onManualEntry?: () => void;
  onFocus?: () => void;
  testID?: string;
};

// eslint-disable-next-line max-lines-per-function
export function PlaceAutocomplete({
  label,
  placeholder = 'Search for a place...',
  error,
  onPlaceSelect,
  onManualEntry,
  onFocus: onFocusProp,
  testID,
}: PlaceAutocompleteProps) {
  const [query, setQuery] = React.useState('');
  const [suggestions, setSuggestions] = React.useState<PlaceSuggestion[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const [isFocused, setIsFocused] = React.useState(false);
  const sessionTokenRef = React.useRef<string>(generateSessionToken());
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const styles = inputTv({
    error: Boolean(error),
    focused: isFocused,
  });

  const handleSearch = React.useCallback(async (input: string) => {
    if (input.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoading(true);
    try {
      const results = await placesAutocomplete(input, sessionTokenRef.current);
      setSuggestions(results);
      setShowSuggestions(results.length > 0 || input.length >= 2);
    }
    catch {
      setSuggestions([]);
    }
    finally {
      setIsLoading(false);
    }
  }, []);

  const handleInputChange = React.useCallback(
    (text: string) => {
      setQuery(text);

      // Clear existing debounce
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      if (text.length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      // Debounce search by 300ms
      debounceRef.current = setTimeout(() => {
        handleSearch(text);
      }, 300);
    },
    [handleSearch],
  );

  const handleSelectPlace = React.useCallback(
    async (suggestion: PlaceSuggestion) => {
      setIsLoading(true);
      setShowSuggestions(false);
      setSuggestions([]);
      Keyboard.dismiss();

      try {
        const details = await getPlaceDetails(suggestion.placeId, sessionTokenRef.current);

        if (details) {
          // Generate new session token for next search
          sessionTokenRef.current = generateSessionToken();

          const placeData = {
            placeId: suggestion.placeId,
            name: details.name || suggestion.name,
            address: details.address,
            city: details.city,
            country: details.country,
            latitude: details.latitude,
            longitude: details.longitude,
          };
          onPlaceSelect(placeData);

          // Clear the input after selection
          setQuery('');
        }
        else {
          // Fallback: use suggestion data if details fetch fails
          onPlaceSelect({
            placeId: suggestion.placeId,
            name: suggestion.name,
            address: suggestion.address,
            city: '',
            country: '',
          });
          setQuery('');
        }
      }
      catch {
        // Silently handle errors
      }
      finally {
        setIsLoading(false);
      }
    },
    [onPlaceSelect],
  );

  const handleClear = React.useCallback(() => {
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
  }, []);

  const handleFocus = React.useCallback(() => {
    setIsFocused(true);
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
    onFocusProp?.();
  }, [suggestions.length, onFocusProp]);

  const handleBlur = React.useCallback(() => {
    setIsFocused(false);
    // Don't auto-hide suggestions on blur - let user tap on them
  }, []);

  // Cleanup debounce on unmount
  React.useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <View className={styles.container()}>
      {label && (
        <Text testID={testID ? `${testID}-label` : undefined} className={styles.label()}>
          {label}
        </Text>
      )}

      {/* Input container */}
      <View className="flex-row items-center">
        <TextInput
          testID={testID}
          value={query}
          onChangeText={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          placeholderTextColor={colors.neutral[400]}
          className={`${styles.input()} flex-1`}
          style={StyleSheet.flatten([
            { writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr' },
            { textAlign: I18nManager.isRTL ? 'right' : 'left' },
          ])}
          autoCorrect={false}
          autoCapitalize="none"
        />

        {isLoading && (
          <View className="absolute right-4">
            <ActivityIndicator size="small" color={colors.neutral[400]} />
          </View>
        )}

        {query.length > 0 && !isLoading && (
          <TouchableOpacity
            onPress={handleClear}
            className="absolute right-4 p-1"
            activeOpacity={0.7}
          >
            <Text className="text-neutral-400">✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Suggestions list - rendered inline, not absolute */}
      {showSuggestions && (
        <View className="mt-2 rounded-xl border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800">
          {suggestions.length > 0 ? (
            <>
              {suggestions.map((suggestion, index) => (
                <TouchableOpacity
                  key={suggestion.placeId}
                  onPress={() => handleSelectPlace(suggestion)}
                  activeOpacity={0.7}
                  className={`px-4 py-3 ${
                    index < suggestions.length - 1
                      ? 'border-b border-neutral-100 dark:border-neutral-700'
                      : ''
                  }`}
                >
                  <Text className="font-medium text-neutral-900 dark:text-white">
                    {suggestion.name}
                  </Text>
                  <Text className="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">
                    {suggestion.address}
                  </Text>
                </TouchableOpacity>
              ))}

              {/* Manual entry link */}
              {onManualEntry && (
                <TouchableOpacity
                  onPress={() => {
                    setShowSuggestions(false);
                    Keyboard.dismiss();
                    onManualEntry();
                  }}
                  activeOpacity={0.7}
                  className="border-t border-neutral-200 px-4 py-3 dark:border-neutral-600"
                >
                  <Text className="text-center text-sm text-indigo-600 dark:text-indigo-400">
                    Can't find your place? Enter manually
                  </Text>
                </TouchableOpacity>
              )}
            </>
          ) : (
            // No results state
            <View className="p-4">
              <Text className="mb-2 text-center text-sm text-neutral-500 dark:text-neutral-400">
                No places found
              </Text>
              {onManualEntry && (
                <TouchableOpacity onPress={onManualEntry} activeOpacity={0.7}>
                  <Text className="text-center text-sm text-indigo-600 dark:text-indigo-400">
                    Enter location manually
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      )}

      {error && (
        <Text
          testID={testID ? `${testID}-error` : undefined}
          className="text-sm text-danger-400 dark:text-danger-600"
        >
          {error}
        </Text>
      )}
    </View>
  );
}
