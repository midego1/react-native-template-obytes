import {
  generateSessionToken,
  getPlaceDetails,
  placesAutocomplete,
} from '../google-places';

// Mock the environment
jest.mock('../../../env', () => ({
  __esModule: true,
  default: {
    EXPO_PUBLIC_GOOGLE_PLACES_API_KEY: 'test-api-key',
  },
}));

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('google-places', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateSessionToken', () => {
    it('should generate a valid UUID-like string', () => {
      const token = generateSessionToken();

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBe(36);
      // UUID format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
      expect(token).toMatch(
        /^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i,
      );
    });

    it('should generate unique tokens', () => {
      const token1 = generateSessionToken();
      const token2 = generateSessionToken();

      expect(token1).not.toBe(token2);
    });
  });

  describe('placesAutocomplete', () => {
    it('should return empty array when input is too short', async () => {
      const result = await placesAutocomplete('a');

      expect(result).toEqual([]);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should return empty array for empty input', async () => {
      const result = await placesAutocomplete('');

      expect(result).toEqual([]);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should call Places API with correct parameters', async () => {
      const mockResponse = {
        suggestions: [
          {
            placePrediction: {
              placeId: 'place-123',
              text: { text: 'Starbucks, Seattle, WA' },
              structuredFormat: {
                mainText: { text: 'Starbucks' },
                secondaryText: { text: 'Seattle, WA, USA' },
              },
            },
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await placesAutocomplete('starbucks');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://places.googleapis.com/v1/places:autocomplete',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': 'test-api-key',
          }),
          body: expect.stringContaining('"input":"starbucks"'),
        }),
      );

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        placeId: 'place-123',
        name: 'Starbucks',
        address: 'Seattle, WA, USA',
      });
    });

    it('should include session token when provided', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ suggestions: [] }),
      });

      await placesAutocomplete('coffee', 'session-token-123');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining('"sessionToken":"session-token-123"'),
        }),
      );
    });

    it('should limit results to 5 suggestions', async () => {
      const mockResponse = {
        suggestions: Array.from({ length: 10 })
          .fill(null)
          .map((_, i) => ({
            placePrediction: {
              placeId: `place-${i}`,
              text: { text: `Place ${i}` },
              structuredFormat: {
                mainText: { text: `Place ${i}` },
                secondaryText: { text: `Address ${i}` },
              },
            },
          })),
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await placesAutocomplete('test');

      expect(result).toHaveLength(5);
    });

    it('should return empty array when API returns error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        text: () => Promise.resolve('API Error'),
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = await placesAutocomplete('test');

      expect(result).toEqual([]);
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should return empty array on network error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = await placesAutocomplete('test');

      expect(result).toEqual([]);
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should handle response with no suggestions', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      });

      const result = await placesAutocomplete('xyz123');

      expect(result).toEqual([]);
    });
  });

  describe('getPlaceDetails', () => {
    it('should fetch place details with correct parameters', async () => {
      const mockResponse = {
        displayName: { text: 'Starbucks Reserve Roastery' },
        formattedAddress: '1124 Pike St, Seattle, WA 98101, USA',
        addressComponents: [
          { longText: 'Seattle', shortText: 'Seattle', types: ['locality'] },
          {
            longText: 'United States',
            shortText: 'US',
            types: ['country'],
          },
        ],
        location: {
          latitude: 47.6144,
          longitude: -122.3301,
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await getPlaceDetails('place-123');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://places.googleapis.com/v1/places/place-123',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'X-Goog-Api-Key': 'test-api-key',
            'X-Goog-FieldMask':
              'displayName,formattedAddress,addressComponents,location',
          }),
        }),
      );

      expect(result).toEqual({
        name: 'Starbucks Reserve Roastery',
        address: '1124 Pike St, Seattle, WA 98101, USA',
        city: 'Seattle',
        country: 'United States',
        latitude: 47.6144,
        longitude: -122.3301,
      });
    });

    it('should include session token header when provided', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            displayName: { text: 'Test' },
            addressComponents: [],
          }),
      });

      await getPlaceDetails('place-123', 'session-token-456');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Goog-Session-Token': 'session-token-456',
          }),
        }),
      );
    });

    it('should fall back to administrative_area_level_1 when no locality', async () => {
      const mockResponse = {
        displayName: { text: 'Remote Location' },
        formattedAddress: 'Some Remote Address',
        addressComponents: [
          {
            longText: 'California',
            shortText: 'CA',
            types: ['administrative_area_level_1'],
          },
          {
            longText: 'United States',
            shortText: 'US',
            types: ['country'],
          },
        ],
        location: { latitude: 36.0, longitude: -120.0 },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await getPlaceDetails('place-456');

      expect(result).toEqual({
        name: 'Remote Location',
        address: 'Some Remote Address',
        city: 'California',
        country: 'United States',
        latitude: 36.0,
        longitude: -120.0,
      });
    });

    it('should return null on API error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        text: () => Promise.resolve('Not found'),
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = await getPlaceDetails('invalid-place');

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should return null on network error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = await getPlaceDetails('place-123');

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should handle missing location coordinates', async () => {
      const mockResponse = {
        displayName: { text: 'Test Place' },
        formattedAddress: 'Test Address',
        addressComponents: [
          { longText: 'Test City', shortText: 'TC', types: ['locality'] },
          { longText: 'Test Country', shortText: 'XX', types: ['country'] },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await getPlaceDetails('place-789');

      expect(result).toEqual({
        name: 'Test Place',
        address: 'Test Address',
        city: 'Test City',
        country: 'Test Country',
        latitude: undefined,
        longitude: undefined,
      });
    });
  });
});
