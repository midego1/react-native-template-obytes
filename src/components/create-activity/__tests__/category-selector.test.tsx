import { fireEvent, render } from '@testing-library/react-native';
import * as React from 'react';

import { CategorySelector } from '../category-selector';

describe('CategorySelector', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render all category options', () => {
    const { getByText } = render(
      <CategorySelector value="" onChange={mockOnChange} />,
    );

    expect(getByText(/Coffee/)).toBeTruthy();
    expect(getByText(/Food/)).toBeTruthy();
    expect(getByText(/Drinks/)).toBeTruthy();
    expect(getByText(/Nightlife/)).toBeTruthy();
    expect(getByText(/Adventure/)).toBeTruthy();
    expect(getByText(/Sports/)).toBeTruthy();
    expect(getByText(/Culture/)).toBeTruthy();
    expect(getByText(/Coworking/)).toBeTruthy();
    expect(getByText(/Sightseeing/)).toBeTruthy();
    expect(getByText(/Other/)).toBeTruthy();
  });

  it('should render Category label', () => {
    const { getByText } = render(
      <CategorySelector value="" onChange={mockOnChange} />,
    );

    expect(getByText('Category *')).toBeTruthy();
  });

  it('should call onChange when category is pressed', () => {
    const { getByText } = render(
      <CategorySelector value="" onChange={mockOnChange} />,
    );

    fireEvent.press(getByText(/Coffee/));

    expect(mockOnChange).toHaveBeenCalledWith('coffee');
  });

  it('should display error message when provided', () => {
    const { getByText } = render(
      <CategorySelector
        value=""
        onChange={mockOnChange}
        error="Please select a category"
      />,
    );

    expect(getByText('Please select a category')).toBeTruthy();
  });

  it('should not display error when not provided', () => {
    const { queryByText } = render(
      <CategorySelector value="" onChange={mockOnChange} />,
    );

    expect(queryByText('Please select a category')).toBeNull();
  });

  it('should handle selecting different categories', () => {
    const { getByText } = render(
      <CategorySelector value="" onChange={mockOnChange} />,
    );

    fireEvent.press(getByText(/Sports/));
    expect(mockOnChange).toHaveBeenCalledWith('sports');

    fireEvent.press(getByText(/Culture/));
    expect(mockOnChange).toHaveBeenCalledWith('culture');
  });
});
