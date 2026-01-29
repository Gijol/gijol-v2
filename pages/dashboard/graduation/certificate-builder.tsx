'use client';

import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronRight, ChevronLeft, Check, Menu } from 'lucide-react';
import dynamic from 'next/dynamic';

import { certificateFormSchema, CertificateFormValues } from '@/features/certificate/schema';
import { SECTION_TITLES } from '@/features/certificate/consts';
import { getDefaultFormValues } from '@/features/certificate/utils';
import { useCertificateStore } from '@/features/certificate/store';

// UI Components
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { useToast } from '@/components/ui/use-toast';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

// Dynamic Section Components - loaded lazily
const UserInfoSection = dynamic(
  () =>
    import('@/features/certificate/components/sections/user-info-section').then((mod) => ({
      default: mod.UserInfoSection,
    })),
  { loading: () => <SectionLoader /> },
);
const BasicCreditsSection = dynamic(
  () =>
    import('@/features/certificate/components/sections/basic-credits-section').then((mod) => ({
      default: mod.BasicCreditsSection,
    })),
  { loading: () => <SectionLoader /> },
);
const MajorCreditsSection = dynamic(
  () =>
    import('@/features/certificate/components/sections/major-credits-section').then((mod) => ({
      default: mod.MajorCreditsSection,
    })),
  { loading: () => <SectionLoader /> },
);
const NoCreditSection = dynamic(
  () =>
    import('@/features/certificate/components/sections/no-credit-section').then((mod) => ({
      default: mod.NoCreditSection,
    })),
  { loading: () => <SectionLoader /> },
);
const OtherCreditsSection = dynamic(
  () =>
    import('@/features/certificate/components/sections/other-credits-section').then((mod) => ({
      default: mod.OtherCreditsSection,
    })),
  { loading: () => <SectionLoader /> },
);
const ReviewSection = dynamic(
  () =>
    import('@/features/certificate/components/sections/review-section').then((mod) => ({ default: mod.ReviewSection })),
  { loading: () => <SectionLoader /> },
);

// View Components - views are also dynamically imported
const LandingView = dynamic(
  () => import('@/features/certificate/components/views/landing-view').then((mod) => ({ default: mod.LandingView })),
  { loading: () => <PageLoader /> },
);
const SummaryView = dynamic(
  () => import('@/features/certificate/components/views/summary-view').then((mod) => ({ default: mod.SummaryView })),
  { loading: () => <PageLoader /> },
);

import { SidebarStepper } from '@/features/certificate/components/sidebar-stepper';

// Loading components
const SectionLoader = () => (
  <div className="flex h-48 items-center justify-center">
    <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-blue-500" />
  </div>
);

const PageLoader = () => (
  <div className="flex min-h-screen items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-blue-500" />
  </div>
);

export default function CertificateBuilder() {
  const {
    formValues,
    viewMode,
    currentStep,
    setFormValues,
    setViewMode,
    setCurrentStep,
    hasSavedData,
    isSubmitted,
    submitForm,
    reset,
  } = useCertificateStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const form = useForm<CertificateFormValues>({
    resolver: zodResolver(certificateFormSchema),
    defaultValues: formValues, // Initialize with store values
    mode: 'onChange',
  });

  // Sync form changes to store using subscription to avoid re-render loops
  useEffect(() => {
    const subscription = form.watch((value) => {
      if (viewMode === 'builder') {
        setFormValues(value as CertificateFormValues);
      }
    });
    return () => subscription.unsubscribe();
  }, [form, setFormValues, viewMode]);

  // Watch values for UI calculations (completedSteps)
  const values = form.watch();

  // Handle Initialization / hydration check
  // Zustand persist usually handles hydration automatically, but we might need to reset form if store was empty
  useEffect(() => {
    // If store has values, update form
    if (hasSavedData) {
      form.reset(formValues);
    }

    // Redirect logic based on store state on mount
    if (isSubmitted) {
      // If submitted, ensure we are in summary mode
      // setViewMode('summary'); // Already persisted in store
    } else {
      // If not submitted, ensure we are in landing or builder based on persisted viewMode
      // If stored viewMode is summary but not submitted (shouldn't happen), reset to landing
    }
  }, []); // Run once on mount

  // Calculate completed steps based on form validation
  const completedSteps = useMemo(() => {
    const user = values.USER;
    const bc = values.B_C;
    const mrf = values.M_R_F;
    const nc = values.NC;
    const ou = values.OU;

    // Step 0: User Info - check required fields
    const step0Complete = !!(
      user.date &&
      user.semester &&
      user.affiliation &&
      user.studentNumber &&
      user.name &&
      user.contact
    );

    // Step 1: Basic Credits - check if any credit was entered
    const step1Complete = !!(
      bc.languageBasics.total > 0 ||
      bc.humanitiesAndSocial.total > 0 ||
      bc.software.total > 0 ||
      bc.basicScience.total > 0 ||
      bc.gistFreshman.total > 0 ||
      bc.gistMajorExploration.total > 0 ||
      bc.freshmanSeminar.total > 0
    );

    // Step 2: Major Credits - check if any credit was entered
    const step2Complete = !!(
      mrf.majorRequired.total > 0 ||
      mrf.majorElective.total > 0 ||
      mrf.thesisResearch.total > 0 ||
      mrf.universityCommonSubjects.total > 0 ||
      mrf.humanitiesAndSocial.total > 0 ||
      mrf.languageSelectionSoftware.total > 0 ||
      mrf.basicScienceSelection.total > 0 ||
      mrf.otherMajor.total > 0 ||
      mrf.graduateSchoolSubjects.total > 0
    );

    // Step 3: No Credit - check if any was entered
    const step3Complete = !!(nc.arts.total > 0 || nc.sports.total > 0 || nc.colloquium.total > 0);

    // Step 4: Other Units - optional, always considered "complete" if visited
    const step4Complete = true; // Optional section

    // Step 5: Review - complete when all previous are complete
    const step5Complete = step0Complete && step1Complete && step2Complete && step3Complete;

    return [step0Complete, step1Complete, step2Complete, step3Complete, step4Complete, step5Complete];
  }, [values]);

  const handleStart = () => {
    setViewMode('builder');
  };

  const handleReset = () => {
    if (confirm('모든 입력 정보가 삭제됩니다. 계속하시겠습니까?')) {
      reset();
      form.reset(getDefaultFormValues());
      // view mode and step reset handled by store.reset()
    }
  };

  const handleStepClick = (index: number) => {
    setCurrentStep(index);
  };

  const nextStep = () => {
    if (currentStep < SECTION_TITLES.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    const isValid = await form.trigger();
    if (isValid) {
      submitForm(); // Updates state to submitted and viewMode to summary
      window.scrollTo({ top: 0, behavior: 'smooth' });
      toast({
        title: '작성 완료',
        description: '입력하신 내역을 확인해주세요.',
      });
    } else {
      toast({
        title: '입력값 확인',
        description: '필수 항목을 빠짐없이 입력해주세요.',
        variant: 'destructive',
      });
    }
  };

  const handleExport = async () => {
    setIsGenerating(true);
    const data = form.getValues();
    const stdNum = parseInt(data.USER.studentNumber.substring(0, 4));
    const isAfter = !isNaN(stdNum) ? stdNum >= 2021 : true;

    try {
      const { generateCertificateExcel, downloadExcel } = await import('@/features/certificate/export-excel');
      const blob = await generateCertificateExcel(data, isAfter);
      const filename = `졸업이수요건확인서_${data.USER.name || 'export'}.xlsx`;
      downloadExcel(blob, filename);
      toast({
        title: '다운로드 시작',
        description: '엑셀 파일 생성이 완료되었습니다.',
      });
    } catch (error) {
      console.error(error);
      toast({
        title: '오류',
        description: '엑셀 생성에 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Ensure component is mounted before rendering mainly to avoid hydration mismatches with persist
  // (Optional depending on how strict nextjs is, but good practice with localstorage)
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null; // or a loading spinner

  // Render Logic
  if (viewMode === 'landing') {
    return <LandingView onStart={handleStart} hasSavedData={hasSavedData} />;
  }

  if (viewMode === 'summary') {
    return (
      <Form {...form}>
        <SummaryView
          onEdit={() => setViewMode('builder')}
          onExport={handleExport}
          onReset={handleReset}
          isGenerating={isGenerating}
        />
      </Form>
    );
  }

  // Builder Mode
  const currentSection = SECTION_TITLES[currentStep];
  const isLastStep = currentStep === SECTION_TITLES.length - 1;
  const studentNumber = form.watch('USER.studentNumber');
  const isLaterThan2021 = studentNumber ? parseInt(studentNumber.substring(0, 4)) >= 2021 : true;

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Form {...form}>
        <form className="flex min-h-screen">
          {/* Desktop Sidebar (Hidden on Mobile) */}
          <aside className="sticky top-0 hidden h-fit w-72 shrink-0 flex-col rounded-2xl border border-slate-300 bg-white p-4 shadow-md md:flex">
            <div className="mb-6">
              <h1 className="text-lg font-bold text-gray-900">졸업요건 확인서 생성기 🪄</h1>
              <p className="mt-1 text-sm text-gray-500">단계별로 정보를 입력해주세요!</p>
            </div>

            <div className="flex-1 overflow-y-auto">
              <SidebarStepper
                steps={SECTION_TITLES}
                currentStep={currentStep}
                completedSteps={completedSteps}
                onStepClick={handleStepClick}
              />
            </div>
          </aside>

          {/* Mobile Floating Menu (Drawer Trigger) */}
          <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="default" size="lg" className="rounded-full shadow-xl">
                  <Menu className="mr-2 h-4 w-4" />
                  메뉴 열기
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[45vh] rounded-t-[20px]">
                <SheetHeader className="mb-4 text-left">
                  <SheetTitle>졸업요건 확인서 생성기 🪄</SheetTitle>
                </SheetHeader>
                <div className="h-full overflow-y-auto pb-8">
                  <SidebarStepper
                    steps={SECTION_TITLES}
                    currentStep={currentStep}
                    completedSteps={completedSteps}
                    onStepClick={(index) => {
                      handleStepClick(index);
                    }}
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="mx-auto max-w-4xl">
              {/* Section Header */}
              <div className="mb-8">
                <span className="text-brand-primary text-sm font-medium">
                  Step {currentStep + 1} / {SECTION_TITLES.length}
                </span>
                <h2 className="mt-1 text-2xl font-bold text-gray-900">{currentSection}</h2>
              </div>

              {/* Section Content */}

              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                {currentStep === 0 && <UserInfoSection />}
                {currentStep === 1 && <BasicCreditsSection isLaterThan2021={isLaterThan2021} />}
                {currentStep === 2 && <MajorCreditsSection />}
                {currentStep === 3 && <NoCreditSection />}
                {currentStep === 4 && <OtherCreditsSection />}
                {currentStep === 5 && <ReviewSection />}
              </div>

              {/* Navigation Actions */}
              <div className="mt-6 flex justify-between gap-3">
                {currentStep > 0 && (
                  <Button type="button" variant="outline" onClick={prevStep}>
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    이전 단계
                  </Button>
                )}

                {isLastStep ? (
                  <Button
                    type="button"
                    size="lg"
                    onClick={handleSubmit}
                    className="bg-brand-primary hover:bg-brand-primary-hover ml-auto text-white"
                  >
                    <Check className="mr-2 h-4 w-4" />
                    제출하기
                  </Button>
                ) : (
                  <Button type="button" variant="brand" onClick={nextStep} className="ml-auto">
                    다음 단계
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </main>
        </form>
      </Form>
    </div>
  );
}
