import { View } from 'react-native';

import { Text } from './text';

type StepIndicatorProps = {
  currentStep: number;
  totalSteps: number;
  labels?: string[];
};

const DEFAULT_LABELS = ['Details', 'Time', 'Preview'];

export function StepIndicator({
  currentStep,
  totalSteps,
  labels = DEFAULT_LABELS,
}: StepIndicatorProps) {
  return (
    <View className="px-4 py-3">
      {/* Step circles and labels */}
      <View className="flex-row justify-between">
        {labels.slice(0, totalSteps).map((label, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;

          return (
            <View key={label} className="items-center flex-1">
              <View
                className={`w-8 h-8 rounded-full items-center justify-center mb-1 ${
                  isCompleted
                    ? 'bg-indigo-500 dark:bg-indigo-600'
                    : isCurrent
                      ? 'bg-indigo-500 dark:bg-indigo-600'
                      : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                {isCompleted
                  ? (
                      <Text className="text-white text-sm">✓</Text>
                    )
                  : (
                      <Text
                        className={`text-sm font-semibold ${
                          isCurrent ? 'text-white' : 'text-gray-500 dark:text-gray-400'
                        }`}
                      >
                        {stepNumber}
                      </Text>
                    )}
              </View>
              <Text
                className={`text-xs ${
                  isCurrent || isCompleted
                    ? 'font-semibold text-indigo-600 dark:text-indigo-400'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
