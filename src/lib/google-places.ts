import Env from '../../env';

const API_KEY = Env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY;
const BASE_URL = 'https://places.googleapis.com/v1';

export type PlaceSuggestion = {
  placeId: string;
  name: string;
  address: string;
};

export type PlaceDetails = {
  name: string;
  address?: string;
  city: string;
  country: string;
  latitude?: number;
  longitude?: number;
};

type AutocompleteResponse = {
  suggestions?: Array<{
    placePrediction?: {
      placeId: string;
      text: {
        text: string;
      };
      structuredFormat?: {
        mainText: {
          text: string;
        };
        secondaryText?: {
          text: string;
        };
      };
    };
  }>;
};

type PlaceDetailsResponse = {
  displayName?: {
    text: string;
  };
  formattedAddress?: string;
  addressComponents?: Array<{
    longText: string;
    shortText: string;
    types: string[];
  }>;
  location?: {
    latitude: number;
    longitude: number;
  };
};

/**
 * Generate a session token for billing optimization
 * Using the same token for autocomplete and subsequent place details
 * groups them into a single session for billing purposes
 */
export function generateSessionToken(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Search for places using Google Places Autocomplete API (New)
 */
export async function placesAutocomplete(
  input: string,
  sessionToken?: string,
): Promise<PlaceSuggestion[]> {
  if (!API_KEY) {
    if (__DEV__) {
      console.warn('Google Places API key not configured');
    }
    return [];
  }

  if (!input || input.length < 2) {
    return [];
  }

  try {
    const response = await fetch(`${BASE_URL}/places:autocomplete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': API_KEY,
        ...(sessionToken && { 'X-Goog-FieldMask': '*' }),
      },
      body: JSON.stringify({
        input,
        languageCode: 'en',
        ...(sessionToken && { sessionToken }),
      }),
    });

    if (!response.ok) {
      if (__DEV__) {
        const errorText = await response.text();
        console.error('Places Autocomplete error:', errorText);
      }
      return [];
    }

    const data: AutocompleteResponse = await response.json();

    // Debug: log autocomplete response
    if (__DEV__) {
      console.log('Autocomplete response:', JSON.stringify(data, null, 2));
    }

    if (!data.suggestions) {
      return [];
    }

    return data.suggestions
      .filter(s => s.placePrediction)
      .map(s => ({
        placeId: s.placePrediction!.placeId,
        name: s.placePrediction!.structuredFormat?.mainText?.text || s.placePrediction!.text.text,
        address:
          s.placePrediction!.structuredFormat?.secondaryText?.text || s.placePrediction!.text.text,
      }))
      .slice(0, 5);
  }
  catch (error) {
    if (__DEV__) {
      console.error('Places Autocomplete fetch error:', error);
    }
    return [];
  }
}

/**
 * Get detailed information about a place
 */
export async function getPlaceDetails(
  placeId: string,
  sessionToken?: string,
): Promise<PlaceDetails | null> {
  if (!API_KEY) {
    if (__DEV__) {
      console.warn('Google Places API key not configured');
    }
    return null;
  }

  try {
    const response = await fetch(`${BASE_URL}/places/${placeId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': API_KEY,
        'X-Goog-FieldMask':
          'displayName,formattedAddress,addressComponents,location',
        ...(sessionToken && { 'X-Goog-Session-Token': sessionToken }),
      },
    });

    if (!response.ok) {
      if (__DEV__) {
        const errorText = await response.text();
        console.error('Place Details error:', errorText);
      }
      return null;
    }

    const data: PlaceDetailsResponse = await response.json();

    // Debug: log the raw response
    if (__DEV__) {
      console.log('Place Details response:', JSON.stringify(data, null, 2));
    }

    // Extract city and country from address components
    let city = '';
    let country = '';

    if (data.addressComponents) {
      for (const component of data.addressComponents) {
        if (component.types.includes('locality')) {
          city = component.longText;
        }
        else if (
          component.types.includes('administrative_area_level_1')
          && !city
        ) {
          // Fallback to administrative area if no locality
          city = component.longText;
        }
        else if (
          component.types.includes('sublocality_level_1')
          && !city
        ) {
          // Fallback to sublocality for cities like NYC boroughs
          city = component.longText;
        }
        else if (
          component.types.includes('postal_town')
          && !city
        ) {
          // Fallback for UK addresses
          city = component.longText;
        }
        else if (component.types.includes('country')) {
          country = component.longText;
        }
      }
    }

    const result = {
      name: data.displayName?.text || '',
      address: data.formattedAddress,
      city,
      country,
      latitude: data.location?.latitude,
      longitude: data.location?.longitude,
    };

    // Debug: log parsed result
    if (__DEV__) {
      console.log('Parsed place details:', result);
    }

    return result;
  }
  catch (error) {
    if (__DEV__) {
      console.error('Place Details fetch error:', error);
    }
    return null;
  }
}
