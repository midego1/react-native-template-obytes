import { fireEvent, render } from '@testing-library/react-native';
import * as React from 'react';

import { DurationPresets } from '../duration-presets';

describe('DurationPresets', () => {
  const mockOnSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render all duration options', () => {
    const { getByText } = render(
      <DurationPresets
        startTime={new Date()}
        selectedDuration={null}
        onSelect={mockOnSelect}
      />,
    );

    expect(getByText('1hr')).toBeTruthy();
    expect(getByText('2hr')).toBeTruthy();
    expect(getByText('3hr')).toBeTruthy();
    expect(getByText('Half day')).toBeTruthy();
  });

  it('should render Duration label', () => {
    const { getByText } = render(
      <DurationPresets
        startTime={new Date()}
        selectedDuration={null}
        onSelect={mockOnSelect}
      />,
    );

    expect(getByText('Duration')).toBeTruthy();
  });

  it('should call onSelect with correct hours and end time when pressed', () => {
    const startTime = new Date(2026, 0, 27, 14, 0);
    const { getByText } = render(
      <DurationPresets
        startTime={startTime}
        selectedDuration={null}
        onSelect={mockOnSelect}
      />,
    );

    fireEvent.press(getByText('2hr'));

    expect(mockOnSelect).toHaveBeenCalledWith(2, expect.any(Date));
    const endTime = mockOnSelect.mock.calls[0][1];
    expect(endTime.getHours()).toBe(16); // 14 + 2 = 16
  });

  it('should not call onSelect when disabled', () => {
    const { getByText } = render(
      <DurationPresets
        startTime={new Date()}
        selectedDuration={null}
        onSelect={mockOnSelect}
        disabled={true}
      />,
    );

    fireEvent.press(getByText('1hr'));

    expect(mockOnSelect).not.toHaveBeenCalled();
  });

  it('should not call onSelect when no start time', () => {
    const { getByText } = render(
      <DurationPresets
        startTime={undefined}
        selectedDuration={null}
        onSelect={mockOnSelect}
      />,
    );

    fireEvent.press(getByText('1hr'));

    expect(mockOnSelect).not.toHaveBeenCalled();
  });

  it('should show helper text when no start time selected', () => {
    const { getByText } = render(
      <DurationPresets
        startTime={undefined}
        selectedDuration={null}
        onSelect={mockOnSelect}
      />,
    );

    expect(getByText('Select a start time first')).toBeTruthy();
  });

  it('should not show helper text when start time is provided', () => {
    const { queryByText } = render(
      <DurationPresets
        startTime={new Date()}
        selectedDuration={null}
        onSelect={mockOnSelect}
      />,
    );

    expect(queryByText('Select a start time first')).toBeNull();
  });
});
