import { render } from '@testing-library/react-native';
import * as React from 'react';

import { StepIndicator } from '../step-indicator';

describe('StepIndicator', () => {
  it('should render with default labels', () => {
    const { getByText } = render(
      <StepIndicator currentStep={1} totalSteps={3} />,
    );

    expect(getByText('Details')).toBeTruthy();
    expect(getByText('Time')).toBeTruthy();
    expect(getByText('Preview')).toBeTruthy();
  });

  it('should render with custom labels', () => {
    const { getByText } = render(
      <StepIndicator
        currentStep={1}
        totalSteps={3}
        labels={['Step A', 'Step B', 'Step C']}
      />,
    );

    expect(getByText('Step A')).toBeTruthy();
    expect(getByText('Step B')).toBeTruthy();
    expect(getByText('Step C')).toBeTruthy();
  });

  it('should show current step number', () => {
    const { getByText } = render(
      <StepIndicator currentStep={2} totalSteps={3} />,
    );

    // Step 1 should show checkmark (completed)
    expect(getByText('✓')).toBeTruthy();
    // Step 2 should show number (current)
    expect(getByText('2')).toBeTruthy();
    // Step 3 should show number (pending)
    expect(getByText('3')).toBeTruthy();
  });

  it('should show checkmark for completed steps', () => {
    const { getAllByText } = render(
      <StepIndicator currentStep={3} totalSteps={3} />,
    );

    // Steps 1 and 2 should be completed with checkmarks
    const checkmarks = getAllByText('✓');
    expect(checkmarks).toHaveLength(2);
  });

  it('should render correct number of steps', () => {
    const { getByText, queryByText } = render(
      <StepIndicator currentStep={1} totalSteps={2} labels={['One', 'Two', 'Three']} />,
    );

    expect(getByText('One')).toBeTruthy();
    expect(getByText('Two')).toBeTruthy();
    expect(queryByText('Three')).toBeNull();
  });
});
