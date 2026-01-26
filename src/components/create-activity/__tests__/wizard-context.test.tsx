import { act, renderHook, waitFor } from '@testing-library/react-native';
import * as React from 'react';

import { useWizard, WizardProvider } from '../wizard-context';

// Mock dependencies
jest.mock('@/api/activities/use-create-activity', () => ({
  useCreateActivity: () => ({
    mutate: jest.fn(),
    isPending: false,
  }),
}));

jest.mock('expo-router', () => ({
  router: {
    replace: jest.fn(),
  },
}));

describe('WizardContext', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <WizardProvider>{children}</WizardProvider>
  );

  it('should start at step 1', () => {
    const { result } = renderHook(() => useWizard(), { wrapper });

    expect(result.current.currentStep).toBe(1);
  });

  it('should have 3 total steps', () => {
    const { result } = renderHook(() => useWizard(), { wrapper });

    expect(result.current.totalSteps).toBe(3);
  });

  it('should provide form with empty initial values', () => {
    const { result } = renderHook(() => useWizard(), { wrapper });

    // Form should start with empty values
    expect(result.current.form.state.values.title).toBe('');
    expect(result.current.form.state.values.category).toBe('');
  });

  it('should allow goToStep to navigate directly', () => {
    const { result } = renderHook(() => useWizard(), { wrapper });

    act(() => {
      result.current.goToStep(2);
    });

    expect(result.current.currentStep).toBe(2);
  });

  it('should allow goBack from step 2 to step 1', () => {
    const { result } = renderHook(() => useWizard(), { wrapper });

    // Go directly to step 2
    act(() => {
      result.current.goToStep(2);
    });
    expect(result.current.currentStep).toBe(2);

    // Go back to step 1
    act(() => {
      result.current.goBack();
    });
    expect(result.current.currentStep).toBe(1);
  });

  it('should not go back when on step 1', () => {
    const { result } = renderHook(() => useWizard(), { wrapper });

    act(() => {
      result.current.goBack();
    });

    expect(result.current.currentStep).toBe(1);
  });

  it('should not allow goToStep outside valid range', () => {
    const { result } = renderHook(() => useWizard(), { wrapper });

    act(() => {
      result.current.goToStep(0);
    });
    expect(result.current.currentStep).toBe(1);

    act(() => {
      result.current.goToStep(4);
    });
    expect(result.current.currentStep).toBe(1);
  });

  it('should manage selectedPlace state', () => {
    const { result } = renderHook(() => useWizard(), { wrapper });

    const testPlace = {
      name: 'Test Place',
      city: 'Test City',
      country: 'Test Country',
    };

    act(() => {
      result.current.setSelectedPlace(testPlace);
    });

    expect(result.current.selectedPlace).toEqual(testPlace);
  });

  it('should manage isManualEntry state', () => {
    const { result } = renderHook(() => useWizard(), { wrapper });

    expect(result.current.isManualEntry).toBe(false);

    act(() => {
      result.current.setIsManualEntry(true);
    });

    expect(result.current.isManualEntry).toBe(true);
  });

  it('should manage selectedDuration state', () => {
    const { result } = renderHook(() => useWizard(), { wrapper });

    expect(result.current.selectedDuration).toBeNull();

    act(() => {
      result.current.setSelectedDuration(2);
    });

    expect(result.current.selectedDuration).toBe(2);
  });

  it('should have form with default values', () => {
    const { result } = renderHook(() => useWizard(), { wrapper });

    expect(result.current.form.state.values.title).toBe('');
    expect(result.current.form.state.values.category).toBe('');
    expect(result.current.form.state.values.location_name).toBe('');
    expect(result.current.form.state.values.city).toBe('');
    expect(result.current.form.state.values.starts_at).toBeUndefined();
  });

  it('should allow setting form values', async () => {
    const { result } = renderHook(() => useWizard(), { wrapper });

    act(() => {
      result.current.form.setFieldValue('title', 'Test Activity');
    });

    await waitFor(() => {
      expect(result.current.form.state.values.title).toBe('Test Activity');
    });
  });

  it('should allow setting date values', async () => {
    const { result } = renderHook(() => useWizard(), { wrapper });
    const testDate = new Date(2026, 0, 27, 14, 0);

    act(() => {
      result.current.form.setFieldValue('starts_at', testDate);
    });

    await waitFor(() => {
      expect(result.current.form.state.values.starts_at).toEqual(testDate);
    });
  });

  it('should have handleSubmit function', () => {
    const { result } = renderHook(() => useWizard(), { wrapper });

    expect(typeof result.current.handleSubmit).toBe('function');
  });

  it('should have isPending state', () => {
    const { result } = renderHook(() => useWizard(), { wrapper });

    expect(result.current.isPending).toBe(false);
  });

  it('should navigate through all steps using goToStep', () => {
    const { result } = renderHook(() => useWizard(), { wrapper });

    expect(result.current.currentStep).toBe(1);

    act(() => {
      result.current.goToStep(2);
    });
    expect(result.current.currentStep).toBe(2);

    act(() => {
      result.current.goToStep(3);
    });
    expect(result.current.currentStep).toBe(3);

    act(() => {
      result.current.goToStep(1);
    });
    expect(result.current.currentStep).toBe(1);
  });

  it('should throw error when useWizard is used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      renderHook(() => useWizard());
    }).toThrow('useWizard must be used within a WizardProvider');

    consoleSpy.mockRestore();
  });
});
