'use client';

import { useEffect, useMemo, useState } from 'react';
import { graduationLayout } from '@/components/layouts/graduation-runtime';
import { NextSeo } from 'next-seo';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronRight, ChevronLeft, Check, Info, Menu } from 'lucide-react';
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
import { SectionNotesCollapsible } from '@/features/certificate/components/section-notes-collapsible';
import { DashboardPageShell, PageHeader } from '@/components/dashboard/page-shell';

// Loading components
const SectionLoader = () => (
  <div className="flex h-48 items-center justify-center" role="status" aria-label="입력 항목 불러오는 중">
    <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600 motion-reduce:animate-none" />
  </div>
);

const PageLoader = () => (
  <div className="flex min-h-[60vh] items-center justify-center" role="status" aria-label="확인서 불러오는 중">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600 motion-reduce:animate-none" />
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
  const [mobileStepsOpen, setMobileStepsOpen] = useState(false);
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

    // Step 4: optional, considered complete after the user moves past it or enters data
    const hasOtherCredits = !!(
      ou.summerSession.credits ||
      ou.summerSession.university ||
      ou.summerSession.semester ||
      ou.studyAbroad.credits ||
      ou.studyAbroad.university ||
      ou.studyAbroad.semester
    );
    const step4Complete = currentStep > 4 || hasOtherCredits;

    // Step 5: complete only after final submission
    const step5Complete = isSubmitted;

    return [step0Complete, step1Complete, step2Complete, step3Complete, step4Complete, step5Complete];
  }, [currentStep, isSubmitted, values]);

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
    const isValid = await form.trigger(undefined, { shouldFocus: true });
    if (isValid) {
      submitForm(); // Updates state to submitted and viewMode to summary
      window.scrollTo({ top: 0, behavior: 'auto' });
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
    return (
      <>
        <NextSeo title="확인서 생성기" description="졸업요건 확인서를 자동으로 생성하세요" noindex />
        <LandingView onStart={handleStart} hasSavedData={hasSavedData} />
      </>
    );
  }

  if (viewMode === 'summary') {
    return (
      <>
        <NextSeo title="확인서 검토" description="작성한 졸업 이수요건 확인서를 검토하세요" noindex />
        <Form {...form}>
          <SummaryView
            onEdit={() => setViewMode('builder')}
            onExport={handleExport}
            onReset={handleReset}
            isGenerating={isGenerating}
          />
        </Form>
      </>
    );
  }

  // Builder Mode
  const currentSection = SECTION_TITLES[currentStep];
  const isLastStep = currentStep === SECTION_TITLES.length - 1;
  const studentNumber = form.watch('USER.studentNumber');
  const isLaterThan2021 = studentNumber ? parseInt(studentNumber.substring(0, 4)) >= 2021 : true;

  return (
    <DashboardPageShell>
      <NextSeo title="확인서 생성기" description="졸업요건 확인서를 자동으로 생성하세요" noindex />
      <Form {...form}>
        <form className="mx-auto max-w-6xl" onSubmit={(event) => event.preventDefault()}>
          <PageHeader
            eyebrow="이수요건 확인서"
            title="졸업 신청 정보를 입력하세요"
            description="입력 내용은 이 브라우저에 자동 저장됩니다. 마지막 검토 후 제출용 Excel 파일을 내려받을 수 있습니다."
          />

          <div className="grid items-start gap-8 lg:grid-cols-[17rem_minmax(0,1fr)]">
            {/* Desktop Sidebar (Hidden on Mobile) */}
            <aside className="sticky top-6 hidden rounded-xl border border-slate-200 bg-white p-4 lg:block">
              <div className="mb-4 border-b border-slate-200 px-1 pb-4">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-sm font-semibold text-slate-950">작성 진행률</h2>
                  <span className="text-xs font-semibold text-blue-700 tabular-nums">
                    {completedSteps.filter(Boolean).length}/{SECTION_TITLES.length}
                  </span>
                </div>
                <div
                  className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100"
                  role="progressbar"
                  aria-label="확인서 작성 진행률"
                  aria-valuemin={0}
                  aria-valuemax={SECTION_TITLES.length}
                  aria-valuenow={completedSteps.filter(Boolean).length}
                >
                  <div
                    className="h-full origin-left rounded-full bg-blue-600 transition-transform duration-200 ease-[var(--ease-ui-out)] motion-reduce:transition-none"
                    style={{ transform: `scaleX(${completedSteps.filter(Boolean).length / SECTION_TITLES.length})` }}
                  />
                </div>
              </div>

              <SidebarStepper
                steps={SECTION_TITLES}
                currentStep={currentStep}
                completedSteps={completedSteps}
                onStepClick={handleStepClick}
              />
            </aside>

            {/* Mobile Step Menu */}
            <div className="lg:hidden">
              <Sheet open={mobileStepsOpen} onOpenChange={setMobileStepsOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-auto w-full justify-between rounded-xl bg-white px-4 py-3 shadow-none"
                  >
                    <span className="flex min-w-0 items-center gap-3 text-left">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white tabular-nums">
                        {currentStep + 1}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[11px] font-medium text-slate-500">
                          단계 {currentStep + 1}/{SECTION_TITLES.length}
                        </span>
                        <span className="block truncate text-sm font-semibold text-slate-900">{currentSection}</span>
                      </span>
                    </span>
                    <Menu aria-hidden="true" className="text-slate-500" />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="bottom"
                  className="max-h-[80dvh] overflow-y-auto overscroll-contain rounded-t-2xl pb-[calc(1.5rem+env(safe-area-inset-bottom))]"
                >
                  <SheetHeader className="mb-4 text-left">
                    <SheetTitle>작성 단계</SheetTitle>
                  </SheetHeader>
                  <SidebarStepper
                    steps={SECTION_TITLES}
                    currentStep={currentStep}
                    completedSteps={completedSteps}
                    onStepClick={(index) => {
                      handleStepClick(index);
                      setMobileStepsOpen(false);
                    }}
                  />
                </SheetContent>
              </Sheet>
            </div>

            {/* Main Content */}
            <section id="certificate-form-content" aria-labelledby="certificate-step-title" className="min-w-0">
              {/* Section Header */}
              <div className="mt-7 mb-5 flex items-end justify-between gap-4 lg:mt-0">
                <div>
                  <span className="text-xs font-semibold text-blue-700 tabular-nums">
                    단계 {currentStep + 1} / {SECTION_TITLES.length}
                  </span>
                  <h2
                    id="certificate-step-title"
                    className="mt-1 text-xl font-semibold tracking-tight text-balance text-slate-950 sm:text-2xl"
                  >
                    {currentSection}
                  </h2>
                </div>
                <span className="hidden text-xs text-slate-500 sm:block">변경 내용 자동 저장</span>
              </div>

              {/* Global Notice Banner */}
              <div className="mb-4 flex items-start gap-2.5 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm leading-6 text-blue-900">
                <Info aria-hidden="true" className="mt-1 shrink-0 text-blue-600" size={15} />
                <p>기본 서식을 먼저 완성합니다. 세부 문구나 예외 사항은 Excel 다운로드 후 수정해 주세요.</p>
              </div>

              {/* Section Notes */}
              <SectionNotesCollapsible stepIndex={currentStep} />

              {/* Section Content */}
              <div>
                {currentStep === 0 && <UserInfoSection />}
                {currentStep === 1 && <BasicCreditsSection isLaterThan2021={isLaterThan2021} />}
                {currentStep === 2 && <MajorCreditsSection />}
                {currentStep === 3 && <NoCreditSection />}
                {currentStep === 4 && <OtherCreditsSection />}
                {currentStep === 5 && <ReviewSection />}
              </div>

              {/* Navigation Actions */}
              <div className="mt-6 flex items-center justify-between gap-3 border-t border-slate-200 pt-5">
                {currentStep > 0 && (
                  <Button type="button" variant="outline" onClick={prevStep} className="shadow-none">
                    <ChevronLeft aria-hidden="true" className="mr-2 h-4 w-4" />
                    이전 단계
                  </Button>
                )}

                {isLastStep ? (
                  <Button type="button" size="lg" onClick={handleSubmit} className="ml-auto" variant="brand">
                    <Check aria-hidden="true" className="mr-2 h-4 w-4" />
                    제출하기
                  </Button>
                ) : (
                  <Button type="button" variant="brand" onClick={nextStep} className="ml-auto">
                    다음 단계
                    <ChevronRight aria-hidden="true" className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </section>
          </div>
        </form>
      </Form>
    </DashboardPageShell>
  );
}

CertificateBuilder.getLayout = graduationLayout;
