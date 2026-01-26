import { Stack } from 'expo-router';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';

import {
  StepPreview,
  StepWhatWhere,
  StepWhen,
  useWizard,
  WizardProvider,
} from '@/components/create-activity';
import { Button, StepIndicator } from '@/components/ui';

function WizardNavigation() {
  const { currentStep, goNext, goBack, handleSubmit, isPending, form } = useWizard();

  return (
    <form.Subscribe
      selector={(state: any) => state.values}
      children={(values: any) => {
        // Compute canProceed based on current step
        let canProceed = false;
        if (currentStep === 1) {
          const hasTitle = values.title.length >= 3;
          const hasCategory = values.category.length > 0;
          const hasLocation = values.location_name.length > 0 && values.city.length > 0;
          canProceed = hasTitle && hasCategory && hasLocation;
        } else if (currentStep === 2) {
          canProceed = !!values.starts_at;
        } else {
          canProceed = true;
        }

        return (
          <View className="border-t border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
            <View className="flex-row gap-3">
              {currentStep > 1 && (
                <View className="flex-1">
                  <Button label="Back" variant="outline" onPress={goBack} />
                </View>
              )}
              <View className="flex-1">
                {currentStep < 3 ? (
                  <Button
                    label={currentStep === 2 ? 'Preview' : 'Next'}
                    onPress={goNext}
                    disabled={!canProceed}
                  />
                ) : (
                  <Button
                    label="Create Activity"
                    onPress={handleSubmit}
                    loading={isPending}
                  />
                )}
              </View>
            </View>
          </View>
        );
      }}
    />
  );
}

function WizardContent() {
  const { currentStep, totalSteps } = useWizard();

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View className="flex-1 bg-gray-50 dark:bg-gray-900">
        <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 20 }}
          keyboardShouldPersistTaps="handled"
        >
          {currentStep === 1 && <StepWhatWhere />}
          {currentStep === 2 && <StepWhen />}
          {currentStep === 3 && <StepPreview />}
        </ScrollView>
        <WizardNavigation />
      </View>
    </KeyboardAvoidingView>
  );
}

export default function CreateActivityScreen() {
  return (
    <WizardProvider>
      <Stack.Screen
        options={{
          title: 'Create Activity',
          headerBackTitle: 'Cancel',
        }}
      />
      <WizardContent />
    </WizardProvider>
  );
}
