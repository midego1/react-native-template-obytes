import type { ReactNode } from 'react';
import type { SelectedPlace } from '@/components/ui/place-autocomplete';
import { useForm } from '@tanstack/react-form';

import { router } from 'expo-router';
import { createContext, useCallback, useContext, useState } from 'react';
import { Alert } from 'react-native';
import { z } from 'zod';

import { useCreateActivity } from '@/api/activities/use-create-activity';

const createActivitySchema = z.object({
  title: z
    .string({ message: 'Title is required' })
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  category: z.string({ message: 'Category is required' }).min(1, 'Please select a category'),
  location_name: z.string({ message: 'Location is required' }).min(1, 'Location is required'),
  location_address: z.string().optional(),
  city: z.string({ message: 'City is required' }).min(1, 'City is required'),
  country: z.string({ message: 'Country is required' }).min(1, 'Country is required'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  starts_at: z.date({ message: 'Start time is required' }).optional(),
  ends_at: z.date().optional(),
  max_attendees: z.string().optional(),
  is_flexible_time: z.boolean().optional(),
});

export type FormValues = {
  title: string;
  description: string;
  category: string;
  location_name: string;
  location_address: string;
  city: string;
  country: string;
  latitude: number | undefined;
  longitude: number | undefined;
  starts_at: Date | undefined;
  ends_at: Date | undefined;
  max_attendees: string;
  is_flexible_time: boolean;
};

type WizardContextType = {
  form: any; // Using any to match existing patterns in codebase
  currentStep: number;
  totalSteps: number;
  goNext: () => void;
  goBack: () => void;
  goToStep: (step: number) => void;
  selectedPlace: SelectedPlace | null;
  setSelectedPlace: (place: SelectedPlace | null) => void;
  isManualEntry: boolean;
  setIsManualEntry: (value: boolean) => void;
  selectedDuration: number | null;
  setSelectedDuration: (hours: number | null) => void;
  isPending: boolean;
  handleSubmit: () => void;
};

const WizardContext = createContext<WizardContextType | null>(null);

export function useWizard() {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error('useWizard must be used within a WizardProvider');
  }
  return context;
}

type WizardProviderProps = {
  children: ReactNode;
};

export function WizardProvider({ children }: WizardProviderProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPlace, setSelectedPlace] = useState<SelectedPlace | null>(null);
  const [isManualEntry, setIsManualEntry] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null);

  const { mutate: createActivity, isPending } = useCreateActivity();

  const form = useForm({
    defaultValues: {
      title: '',
      description: '',
      category: '',
      location_name: '',
      location_address: '',
      city: '',
      country: '',
      latitude: undefined as number | undefined,
      longitude: undefined as number | undefined,
      starts_at: undefined as Date | undefined,
      ends_at: undefined as Date | undefined,
      max_attendees: '',
      is_flexible_time: false,
    },
    validators: {
      onChange: createActivitySchema as any,
    },
    onSubmit: async ({ value }) => {
      if (!value.starts_at) {
        Alert.alert('Invalid Date', 'Please enter a valid start date and time');
        return;
      }

      if (value.starts_at < new Date()) {
        Alert.alert('Invalid Date', 'Start time must be in the future');
        return;
      }

      if (value.ends_at && value.ends_at <= value.starts_at) {
        Alert.alert('Invalid Date', 'End time must be after start time');
        return;
      }

      const activityData = {
        title: value.title,
        description: value.description || undefined,
        category: value.category,
        location_name: value.location_name,
        location_address: value.location_address || undefined,
        city: value.city,
        country: value.country,
        latitude: value.latitude,
        longitude: value.longitude,
        starts_at: value.starts_at,
        ends_at: value.ends_at,
        max_attendees: value.max_attendees ? Number.parseInt(value.max_attendees) : undefined,
        is_flexible_time: value.is_flexible_time,
      };

      createActivity(activityData, {
        onSuccess: (activity) => {
          Alert.alert('Success!', 'Your activity has been created', [
            {
              text: 'Back to Feed',
              onPress: () => router.replace('/(app)'),
            },
            {
              text: 'View Activity',
              onPress: () => router.replace(`/activity/${activity.id}`),
            },
          ]);
        },
        onError: (error: any) => {
          Alert.alert('Error', error.message || 'Failed to create activity');
        },
      });
    },
  });

  const goNext = useCallback(() => {
    if (currentStep < 3) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep]);

  const goBack = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const goToStep = useCallback((step: number) => {
    if (step >= 1 && step <= 3) {
      setCurrentStep(step);
    }
  }, []);

  const handleSubmit = useCallback(() => {
    form.handleSubmit();
  }, [form]);

  return (
    <WizardContext.Provider
      value={{
        form,
        currentStep,
        totalSteps: 3,
        goNext,
        goBack,
        goToStep,
        selectedPlace,
        setSelectedPlace,
        isManualEntry,
        setIsManualEntry,
        selectedDuration,
        setSelectedDuration,
        isPending,
        handleSubmit,
      }}
    >
      {children}
    </WizardContext.Provider>
  );
}
