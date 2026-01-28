import {
  act,
  fireEvent,
  render,
  waitFor,
} from '@testing-library/react-native';
import * as React from 'react';

import * as googlePlaces from '@/lib/google-places';
import { PlaceAutocomplete } from '../place-autocomplete';

// Mock the google-places module
jest.mock('@/lib/google-places', () => ({
  placesAutocomplete: jest.fn(),
  getPlaceDetails: jest.fn(),
  generateSessionToken: jest.fn(() => 'mock-session-token'),
}));

// Mock timers for debounce testing
jest.useFakeTimers();

describe('placeAutocomplete', () => {
  const mockOnPlaceSelect = jest.fn();
  const mockOnManualEntry = jest.fn();

  const defaultProps = {
    onPlaceSelect: mockOnPlaceSelect,
    onManualEntry: mockOnManualEntry,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (googlePlaces.placesAutocomplete as jest.Mock).mockResolvedValue([]);
    (googlePlaces.getPlaceDetails as jest.Mock).mockResolvedValue(null);
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
  });

  it('should render with default placeholder', () => {
    const { getByPlaceholderText } = render(
      <PlaceAutocomplete {...defaultProps} />,
    );

    expect(getByPlaceholderText('Search for a place...')).toBeTruthy();
  });

  it('should render with custom placeholder', () => {
    const { getByPlaceholderText } = render(
      <PlaceAutocomplete {...defaultProps} placeholder="Find a location" />,
    );

    expect(getByPlaceholderText('Find a location')).toBeTruthy();
  });

  it('should render label when provided', () => {
    const { getByText } = render(
      <PlaceAutocomplete {...defaultProps} label="Location" />,
    );

    expect(getByText('Location')).toBeTruthy();
  });

  it('should render error message when provided', () => {
    const { getByText } = render(
      <PlaceAutocomplete {...defaultProps} error="Please select a location" />,
    );

    expect(getByText('Please select a location')).toBeTruthy();
  });

  it('should not search when input is less than 2 characters', async () => {
    const { getByPlaceholderText } = render(
      <PlaceAutocomplete {...defaultProps} />,
    );

    const input = getByPlaceholderText('Search for a place...');
    fireEvent.changeText(input, 'a');

    await act(async () => {
      jest.advanceTimersByTime(300);
    });

    expect(googlePlaces.placesAutocomplete).not.toHaveBeenCalled();
  });

  it('should debounce search by 300ms', async () => {
    const { getByPlaceholderText } = render(
      <PlaceAutocomplete {...defaultProps} />,
    );

    const input = getByPlaceholderText('Search for a place...');

    fireEvent.changeText(input, 'star');

    // Should not call API immediately
    expect(googlePlaces.placesAutocomplete).not.toHaveBeenCalled();

    // Advance timer by 299ms
    await act(async () => {
      jest.advanceTimersByTime(299);
    });
    expect(googlePlaces.placesAutocomplete).not.toHaveBeenCalled();

    // Advance timer by 1ms more (300ms total)
    await act(async () => {
      jest.advanceTimersByTime(1);
    });
    expect(googlePlaces.placesAutocomplete).toHaveBeenCalledWith(
      'star',
      'mock-session-token',
    );
  });

  it('should display suggestions when API returns results', async () => {
    const mockSuggestions = [
      { placeId: '1', name: 'Starbucks', address: 'Seattle, WA' },
      { placeId: '2', name: 'Starbucks Reserve', address: 'Pike St, Seattle' },
    ];

    (googlePlaces.placesAutocomplete as jest.Mock).mockResolvedValue(
      mockSuggestions,
    );

    const { getByPlaceholderText, findByText } = render(
      <PlaceAutocomplete {...defaultProps} />,
    );

    const input = getByPlaceholderText('Search for a place...');
    fireEvent.changeText(input, 'starbucks');

    await act(async () => {
      jest.advanceTimersByTime(300);
    });

    expect(await findByText('Starbucks')).toBeTruthy();
    expect(await findByText('Starbucks Reserve')).toBeTruthy();
  });

  it('should show manual entry link with suggestions', async () => {
    const mockSuggestions = [
      { placeId: '1', name: 'Test Place', address: 'Test Address' },
    ];

    (googlePlaces.placesAutocomplete as jest.Mock).mockResolvedValue(
      mockSuggestions,
    );

    const { getByPlaceholderText, findByText } = render(
      <PlaceAutocomplete {...defaultProps} />,
    );

    fireEvent.changeText(
      getByPlaceholderText('Search for a place...'),
      'test',
    );

    await act(async () => {
      jest.advanceTimersByTime(300);
    });

    expect(
      await findByText('Can\'t find your place? Enter manually'),
    ).toBeTruthy();
  });

  it('should call onManualEntry when manual entry link is pressed', async () => {
    const mockSuggestions = [
      { placeId: '1', name: 'Test Place', address: 'Test Address' },
    ];

    (googlePlaces.placesAutocomplete as jest.Mock).mockResolvedValue(
      mockSuggestions,
    );

    const { getByPlaceholderText, findByText } = render(
      <PlaceAutocomplete {...defaultProps} />,
    );

    fireEvent.changeText(
      getByPlaceholderText('Search for a place...'),
      'test',
    );

    await act(async () => {
      jest.advanceTimersByTime(300);
    });

    const manualEntryLink = await findByText(
      'Can\'t find your place? Enter manually',
    );
    fireEvent.press(manualEntryLink);

    expect(mockOnManualEntry).toHaveBeenCalled();
  });

  it('should show "No places found" message when search returns empty', async () => {
    (googlePlaces.placesAutocomplete as jest.Mock).mockImplementation(
      () => Promise.resolve([]),
    );

    const { getByPlaceholderText, getByText, queryByText } = render(
      <PlaceAutocomplete {...defaultProps} />,
    );

    const input = getByPlaceholderText('Search for a place...');

    await act(async () => {
      fireEvent(input, 'focus');
      fireEvent.changeText(input, 'xyz123nonexistent');
      jest.advanceTimersByTime(300);
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(getByText('No places found')).toBeTruthy();
    });
  });

  it('should call getPlaceDetails when a suggestion is selected', async () => {
    const mockSuggestions = [
      { placeId: 'place-123', name: 'Starbucks', address: 'Seattle, WA' },
    ];

    const mockDetails = {
      name: 'Starbucks',
      address: '1124 Pike St, Seattle, WA',
      city: 'Seattle',
      country: 'United States',
      latitude: 47.6144,
      longitude: -122.3301,
    };

    (googlePlaces.placesAutocomplete as jest.Mock).mockResolvedValue(
      mockSuggestions,
    );
    (googlePlaces.getPlaceDetails as jest.Mock).mockResolvedValue(mockDetails);

    const { getByPlaceholderText, findByText } = render(
      <PlaceAutocomplete {...defaultProps} />,
    );

    fireEvent.changeText(
      getByPlaceholderText('Search for a place...'),
      'starbucks',
    );

    await act(async () => {
      jest.advanceTimersByTime(300);
    });

    const suggestion = await findByText('Starbucks');
    fireEvent.press(suggestion);

    await waitFor(() => {
      expect(googlePlaces.getPlaceDetails).toHaveBeenCalledWith(
        'place-123',
        'mock-session-token',
      );
    });
  });

  it('should call onPlaceSelect with place details when selection is successful', async () => {
    const mockSuggestions = [
      { placeId: 'place-123', name: 'Starbucks', address: 'Seattle, WA' },
    ];

    const mockDetails = {
      name: 'Starbucks Reserve',
      address: '1124 Pike St, Seattle, WA',
      city: 'Seattle',
      country: 'United States',
      latitude: 47.6144,
      longitude: -122.3301,
    };

    (googlePlaces.placesAutocomplete as jest.Mock).mockResolvedValue(
      mockSuggestions,
    );
    (googlePlaces.getPlaceDetails as jest.Mock).mockResolvedValue(mockDetails);

    const { getByPlaceholderText, findByText } = render(
      <PlaceAutocomplete {...defaultProps} />,
    );

    fireEvent.changeText(
      getByPlaceholderText('Search for a place...'),
      'starbucks',
    );

    await act(async () => {
      jest.advanceTimersByTime(300);
    });

    const suggestion = await findByText('Starbucks');
    fireEvent.press(suggestion);

    await waitFor(() => {
      expect(mockOnPlaceSelect).toHaveBeenCalledWith({
        name: 'Starbucks Reserve',
        address: '1124 Pike St, Seattle, WA',
        city: 'Seattle',
        country: 'United States',
        latitude: 47.6144,
        longitude: -122.3301,
      });
    });
  });

  it('should clear input after successful selection', async () => {
    const mockSuggestions = [
      { placeId: 'place-123', name: 'Starbucks', address: 'Seattle, WA' },
    ];

    const mockDetails = {
      name: 'Starbucks',
      address: '1124 Pike St',
      city: 'Seattle',
      country: 'United States',
    };

    (googlePlaces.placesAutocomplete as jest.Mock).mockResolvedValue(
      mockSuggestions,
    );
    (googlePlaces.getPlaceDetails as jest.Mock).mockResolvedValue(mockDetails);

    const { getByPlaceholderText, findByText } = render(
      <PlaceAutocomplete {...defaultProps} />,
    );

    const input = getByPlaceholderText('Search for a place...');
    fireEvent.changeText(input, 'starbucks');

    await act(async () => {
      jest.advanceTimersByTime(300);
    });

    const suggestion = await findByText('Starbucks');
    fireEvent.press(suggestion);

    await waitFor(() => {
      expect(input.props.value).toBe('');
    });
  });

  it('should generate new session token after successful selection', async () => {
    // Clear the generateSessionToken mock before this specific test
    (googlePlaces.generateSessionToken as jest.Mock).mockClear();

    const mockSuggestions = [
      { placeId: 'place-123', name: 'Coffee Shop', address: '123 Main St' },
    ];
    const mockDetails = {
      name: 'Coffee Shop',
      address: '123 Main St',
      city: 'Test City',
      country: 'Test Country',
    };

    (googlePlaces.placesAutocomplete as jest.Mock).mockResolvedValue(
      mockSuggestions,
    );
    (googlePlaces.getPlaceDetails as jest.Mock).mockResolvedValue(mockDetails);

    const { getByPlaceholderText, findByText } = render(
      <PlaceAutocomplete {...defaultProps} />,
    );

    // Token generated once at component mount
    const initialCallCount = (googlePlaces.generateSessionToken as jest.Mock)
      .mock
      .calls
      .length;

    fireEvent.changeText(getByPlaceholderText('Search for a place...'), 'coffee');

    await act(async () => {
      jest.advanceTimersByTime(300);
    });

    fireEvent.press(await findByText('Coffee Shop'));

    await waitFor(() => {
      expect(mockOnPlaceSelect).toHaveBeenCalled();
    });

    // After selection, a new token should be generated
    const finalCallCount = (googlePlaces.generateSessionToken as jest.Mock).mock.calls.length;
    expect(finalCallCount).toBeGreaterThan(initialCallCount);
  });

  it('should show clear button when input has text', async () => {
    const { getByPlaceholderText, findByText } = render(
      <PlaceAutocomplete {...defaultProps} />,
    );

    const input = getByPlaceholderText('Search for a place...');
    fireEvent.changeText(input, 'test');

    // Clear button shows "✕"
    expect(await findByText('✕')).toBeTruthy();
  });

  it('should clear input when clear button is pressed', async () => {
    const { getByPlaceholderText, findByText } = render(
      <PlaceAutocomplete {...defaultProps} />,
    );

    const input = getByPlaceholderText('Search for a place...');
    fireEvent.changeText(input, 'test');

    const clearButton = await findByText('✕');
    fireEvent.press(clearButton);

    expect(input.props.value).toBe('');
  });

  it('should not show manual entry option when onManualEntry is not provided', async () => {
    const mockSuggestions = [
      { placeId: '1', name: 'Test Place', address: 'Test Address' },
    ];

    (googlePlaces.placesAutocomplete as jest.Mock).mockResolvedValue(
      mockSuggestions,
    );

    const { getByPlaceholderText, findByText, queryByText } = render(
      <PlaceAutocomplete onPlaceSelect={mockOnPlaceSelect} />,
    );

    fireEvent.changeText(getByPlaceholderText('Search for a place...'), 'test');

    await act(async () => {
      jest.advanceTimersByTime(300);
    });

    // Wait for suggestions to appear
    expect(await findByText('Test Place')).toBeTruthy();

    // Manual entry link should not be present
    expect(
      queryByText('Can\'t find your place? Enter manually'),
    ).toBeNull();
  });
});
