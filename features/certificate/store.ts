import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CertificateFormValues } from './schema';
import { getDefaultFormValues } from './utils';

type ViewMode = 'landing' | 'builder' | 'summary';

interface CertificateState {
  formValues: CertificateFormValues;
  viewMode: ViewMode;
  currentStep: number;
  hasSavedData: boolean;
  isSubmitted: boolean;

  setFormValues: (values: CertificateFormValues) => void;
  setViewMode: (mode: ViewMode) => void;
  setCurrentStep: (step: number) => void;
  setHasSavedData: (hasData: boolean) => void;
  submitForm: () => void;
  reset: () => void;
}

export const useCertificateStore = create<CertificateState>()(
  persist(
    (set) => ({
      formValues: getDefaultFormValues(),
      viewMode: 'landing',
      currentStep: 0,
      hasSavedData: false,
      isSubmitted: false,

      setFormValues: (values) => set({ formValues: values, hasSavedData: true }),
      setViewMode: (mode) => set({ viewMode: mode }),
      setCurrentStep: (step) => set({ currentStep: step }),
      setHasSavedData: (hasData) => set({ hasSavedData: hasData }),
      submitForm: () => set({ isSubmitted: true, viewMode: 'summary' }),
      reset: () =>
        set({
          formValues: getDefaultFormValues(),
          viewMode: 'landing',
          currentStep: 0,
          hasSavedData: false,
          isSubmitted: false,
        }),
    }),
    {
      name: 'certificate-storage-v2', // Changed key to avoid conflict with old format if needed
      partialize: (state) => ({
        formValues: state.formValues,
        viewMode: state.viewMode,
        currentStep: state.currentStep,
        hasSavedData: state.hasSavedData,
        isSubmitted: state.isSubmitted,
      }),
    },
  ),
);
