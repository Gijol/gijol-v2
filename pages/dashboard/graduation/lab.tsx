import React, { useMemo, useState } from 'react';
import { dashboardLayout } from '@/components/layouts/dashboard-runtime';
import { NextSeo } from 'next-seo';
import { useRouter } from 'next/router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@components/ui/card';
import { Button } from '@components/ui/button';
import { Textarea } from '@components/ui/textarea';
import { Input } from '@components/ui/input';
import { Label } from '@components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select';
import { MultiSelect } from '@components/ui/multi-select';
import { Badge } from '@components/ui/badge';
import { Separator } from '@components/ui/separator';

// Direct imports from the new features module
import {
  parseRawToTakenCourses,
  validateTakenCourses,
  normalizeTakenCourses,
} from '@features/graduation/middlewares/validation';
import { evaluateGraduationStatus } from '@features/graduation/domain/engine';
import { resolveMajorForEvaluation } from '@features/graduation/domain';
import { useGraduationStore } from '@/lib/stores/useGraduationStore';

import type {
  GradeStatusTerm,
  GraduationCatalogSelectionSummary,
  MinorDeclarationTerms,
  TakenCourseType,
} from '@features/graduation/domain';
import type { UserStatusType } from '@lib/types/index';
import { MAJOR_OPTIONS, MINOR_OPTIONS } from '@const/major-minor-options';

const MOCK_FILES = [
  {
    label: 'EC major, 2021 entry',
    path: '/mocks/graduation/catalog-lab-ec-2021.json',
  },
  {
    label: 'AI minor, declaration term missing',
    path: '/mocks/graduation/catalog-lab-ai-minor-missing-term.json',
  },
  {
    label: 'MM major, 2024 entry',
    path: '/mocks/graduation/catalog-lab-mm-major-2024.json',
  },
  {
    label: 'Uploaded transcript, C/S grades as-is',
    path: '/mocks/graduation/catalog-lab-uploaded-transcript-2022-1-cs-official.json',
  },
  {
    label: 'Uploaded transcript, blank in-progress grades',
    path: '/mocks/graduation/catalog-lab-uploaded-transcript-2022-1-in-progress.json',
  },
] as const;

// Initial Mock Data
const MOCK_INPUT = JSON.stringify(
  {
    takenCourses: [
      {
        year: 2020,
        semester: '1',
        courseType: '전공',
        courseName: 'Computer Architecture',
        courseCode: 'GS1401',
        credit: 3,
      },
      { year: 2020, semester: '1', courseType: '전공', courseName: 'Calculus', courseCode: 'GS1001', credit: 3 },
      { year: 2020, semester: '1', courseType: '교양', courseName: 'English I', courseCode: 'GS1601', credit: 2 },
      { year: 2020, semester: '1', courseType: '교양', courseName: 'Writing', courseCode: 'GS1511', credit: 2 },
      { year: 2021, semester: '1', courseType: '전공', courseName: 'Algorithm', courseCode: 'EC2206', credit: 3 },
    ],
  },
  null,
  2,
);

function applyInputMetadata(
  raw: any,
  setters: {
    setEntryYear: (value: number) => void;
    setUserMajor: (value: string) => void;
    setUserMinors: (value: string[]) => void;
    setMinorDeclarationTerms: (value: MinorDeclarationTerms) => void;
    setGradeStatusTerms: (value: GradeStatusTerm[]) => void;
  },
): number | undefined {
  let effectiveEntryYear: number | undefined;

  if (typeof raw?.entryYear === 'number' && Number.isFinite(raw.entryYear)) {
    effectiveEntryYear = raw.entryYear;
    setters.setEntryYear(raw.entryYear);
  } else if (raw?.studentId && typeof raw.studentId === 'string' && raw.studentId.length >= 4) {
    const inferredYear = parseInt(raw.studentId.substring(0, 4), 10);
    if (!Number.isNaN(inferredYear)) {
      effectiveEntryYear = inferredYear;
      setters.setEntryYear(inferredYear);
    }
  }

  if (typeof raw?.userMajor === 'string' && raw.userMajor.trim()) {
    setters.setUserMajor(raw.userMajor);
  }

  if (Array.isArray(raw?.userMinors)) {
    setters.setUserMinors(raw.userMinors.filter((minor: unknown): minor is string => typeof minor === 'string'));
  }

  if (raw?.minorDeclarationTerms && typeof raw.minorDeclarationTerms === 'object') {
    setters.setMinorDeclarationTerms(raw.minorDeclarationTerms);
  }

  setters.setGradeStatusTerms(readGradeStatusTerms(raw));

  return effectiveEntryYear;
}

GraduationLabPage.getLayout = dashboardLayout;

function readGradeStatusTerms(raw: any): GradeStatusTerm[] {
  if (Array.isArray(raw?.gradeStatusTerms)) {
    return raw.gradeStatusTerms.filter(
      (term: unknown): term is GradeStatusTerm =>
        Boolean(term) &&
        typeof term === 'object' &&
        typeof (term as GradeStatusTerm).year === 'number' &&
        typeof (term as GradeStatusTerm).semester === 'string' &&
        ((term as GradeStatusTerm).status === 'in_progress' || (term as GradeStatusTerm).status === 'provisional'),
    );
  }

  if (Array.isArray(raw?.provisionalGradeTerms)) {
    return raw.provisionalGradeTerms
      .filter(
        (term: unknown) =>
          Boolean(term) &&
          typeof term === 'object' &&
          typeof (term as GradeStatusTerm).year === 'number' &&
          typeof (term as GradeStatusTerm).semester === 'string',
      )
      .map((term: Omit<GradeStatusTerm, 'status'>) => ({ ...term, status: 'provisional' }));
  }

  if (!Array.isArray(raw?.takenCourses)) return [];

  const grouped = new Map<string, GradeStatusTerm>();
  raw.takenCourses.forEach((course: any) => {
    const status = course?.gradeStatus ?? (course?.grade === '' ? 'in_progress' : undefined);
    if (status !== 'in_progress' && status !== 'provisional') return;
    if (typeof course.year !== 'number' || typeof course.semester !== 'string') return;

    const key = `${course.year}-${course.semester}-${status}`;
    const existing =
      grouped.get(key) ??
      ({
        year: course.year,
        semester: course.semester,
        status,
        courseCount: 0,
        gradeValues: [],
      } satisfies GradeStatusTerm);

    existing.courseCount = (existing.courseCount ?? 0) + 1;
    const gradeValues = new Set(existing.gradeValues ?? []);
    gradeValues.add(course.grade ?? '');
    existing.gradeValues = Array.from(gradeValues).sort();
    grouped.set(key, existing);
  });

  return Array.from(grouped.values());
}

function buildDashboardParsedSnapshot(
  raw: any,
  normalizedCourses: TakenCourseType[],
  fallbackEntryYear: number,
): UserStatusType {
  const rawCourses = Array.isArray(raw?.userTakenCourseList)
    ? raw.userTakenCourseList
    : Array.isArray(raw?.takenCourses)
      ? raw.takenCourses
      : normalizedCourses;

  return {
    studentId: typeof raw?.studentId === 'string' && raw.studentId.trim() ? raw.studentId : `${fallbackEntryYear}0000`,
    userTakenCourseList: rawCourses.map((course: any) => ({
      courseCode: String(course?.courseCode ?? ''),
      courseName: String(course?.courseName ?? course?.course ?? ''),
      courseType: String(course?.courseType ?? '기타'),
      credit: Number(course?.credit) || 0,
      grade: String(course?.grade ?? ''),
      ...(course?.gradeStatus ? { gradeStatus: course.gradeStatus } : {}),
      ...(course?.gradeStatusReason ? { gradeStatusReason: String(course.gradeStatusReason) } : {}),
      semester: String(course?.semester ?? ''),
      year: Number(course?.year) || fallbackEntryYear,
    })),
  };
}

function formatSourceRefs(sourceRefs: GraduationCatalogSelectionSummary['sourceRefs'] | undefined): string {
  if (!sourceRefs || sourceRefs.length === 0) return 'no sourceRefs';
  return sourceRefs.map((sourceRef) => `${sourceRef.manualYear} p.${sourceRef.page}`).join(', ');
}

export default function GraduationLabPage() {
  const router = useRouter();
  const { commitTranscript } = useGraduationStore();
  const [jsonInput, setJsonInput] = useState(MOCK_INPUT);
  const [selectedMockPath, setSelectedMockPath] = useState<string>(MOCK_FILES[0].path);
  const [entryYear, setEntryYear] = useState<number>(2020);
  const [userMajor, setUserMajor] = useState<string>('EC');
  const [userMinors, setUserMinors] = useState<string[]>([]);
  const [minorDeclarationTerms, setMinorDeclarationTerms] = useState<MinorDeclarationTerms>({});
  const [gradeStatusTerms, setGradeStatusTerms] = useState<GradeStatusTerm[]>([]);

  // Pipeline Step Results
  const [step1Result, setStep1Result] = useState<any>(null); // Parse
  const [step2Result, setStep2Result] = useState<any>(null); // Validate
  const [step3Result, setStep3Result] = useState<any>(null); // Normalize
  const [step4Result, setStep4Result] = useState<any>(null); // Engine
  const [step5Result, setStep5Result] = useState<any>(null); // Refine

  const [error, setError] = useState<string | null>(null);
  const catalogSelection = step5Result?.catalogSelection as GraduationCatalogSelectionSummary | undefined;
  const selectedMockLabel = useMemo(
    () => MOCK_FILES.find((mock) => mock.path === selectedMockPath)?.label ?? 'Custom mock',
    [selectedMockPath],
  );

  const loadMock = async (path = selectedMockPath) => {
    setError(null);
    try {
      const response = await fetch(path);
      if (!response.ok) {
        throw new Error(`Failed to load mock: ${response.status}`);
      }
      const text = await response.text();
      const raw = JSON.parse(text);
      setJsonInput(JSON.stringify(raw, null, 2));
      applyInputMetadata(raw, {
        setEntryYear,
        setUserMajor,
        setUserMinors,
        setMinorDeclarationTerms,
        setGradeStatusTerms,
      });
    } catch (err: any) {
      setError(err.message || String(err));
    }
  };

  const loadLocalJsonFile = async (file?: File) => {
    if (!file) return;
    setError(null);
    try {
      const text = await file.text();
      const raw = JSON.parse(text);
      setJsonInput(JSON.stringify(raw, null, 2));
      applyInputMetadata(raw, {
        setEntryYear,
        setUserMajor,
        setUserMinors,
        setMinorDeclarationTerms,
        setGradeStatusTerms,
      });
    } catch (err: any) {
      setError(err.message || String(err));
    }
  };

  const runPipeline = async () => {
    setError(null);
    setStep1Result(null);
    setStep2Result(null);
    setStep3Result(null);
    setStep4Result(null);
    setStep5Result(null);

    try {
      // Step 0: Parse JSON from Textarea
      let raw;
      try {
        raw = JSON.parse(jsonInput);
      } catch (e) {
        throw new Error('Invalid JSON Input');
      }

      // Metadata Inference (Lab Page Feature)
      const inferredEntryYear = applyInputMetadata(raw, {
        setEntryYear,
        setUserMajor,
        setUserMinors,
        setMinorDeclarationTerms,
        setGradeStatusTerms,
      });
      const effectiveEntryYear = inferredEntryYear ?? entryYear;
      const effectiveInputMajor =
        typeof raw?.userMajor === 'string' && raw.userMajor.trim() ? raw.userMajor : userMajor;
      const effectiveUserMinors = Array.isArray(raw?.userMinors)
        ? raw.userMinors.filter((minor: unknown): minor is string => typeof minor === 'string')
        : userMinors;
      const effectiveMinorDeclarationTerms =
        raw?.minorDeclarationTerms && typeof raw.minorDeclarationTerms === 'object'
          ? raw.minorDeclarationTerms
          : minorDeclarationTerms;

      // Step 1: Parse
      const parsed = parseRawToTakenCourses(raw);
      setStep1Result(parsed);

      // Step 2: Validate
      const validation = validateTakenCourses(parsed);
      setStep2Result(validation);

      if (!validation.ok) {
        throw new Error('Validation Failed: ' + validation.errors?.join(', '));
      }

      // Step 3: Normalize
      const normalized = normalizeTakenCourses(validation.value!);
      setStep3Result(normalized);
      const majorResolution = resolveMajorForEvaluation(effectiveInputMajor, normalized.takenCourses);
      const effectiveUserMajor = majorResolution.code ?? (effectiveInputMajor ? effectiveInputMajor : undefined);

      // Step 4: Engine
      const engineResult = await evaluateGraduationStatus({
        takenCourses: normalized,
        ruleContext: {
          entryYear: effectiveEntryYear,
          userMajor: effectiveUserMajor,
          userMinors: effectiveUserMinors,
          minorDeclarationTerms: effectiveMinorDeclarationTerms,
        },
      });
      setStep4Result(engineResult);

      // Step 5: the server owns catalog-backed recommendations and refinement.
      const response = await fetch('/api/graduation/grad-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...raw,
          entryYear: effectiveEntryYear,
          userMajor: effectiveUserMajor,
          userMinors: effectiveUserMinors,
          minorDeclarationTerms: effectiveMinorDeclarationTerms,
        }),
      });
      if (!response.ok) {
        throw new Error(`Server refinement failed: ${response.status} ${await response.text()}`);
      }
      const viewModel = await response.json();
      setStep5Result(viewModel);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const openCurrentResultInDashboard = async () => {
    if (!step5Result || !step3Result?.takenCourses) return;

    let raw: any = {};
    try {
      raw = JSON.parse(jsonInput);
    } catch {
      // The pipeline cannot produce step5Result from invalid JSON, but keep this defensive.
    }

    const normalizedCourses = step3Result.takenCourses as TakenCourseType[];
    const parsedSnapshot = buildDashboardParsedSnapshot(raw, normalizedCourses, entryYear);

    commitTranscript({
      parsed: parsedSnapshot,
      outcome: step5Result,
      userMajor,
      userMinors,
      minorDeclarationTerms,
      entryYear,
    });

    await router.push('/dashboard');
  };

  return (
    <div className="container mx-auto space-y-8 py-10">
      <NextSeo title="Graduation Logic Lab" description="졸업 로직 테스트 페이지" noindex />

      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold">Graduation Architecture Lab</h1>
        <p className="text-gray-500">
          Test the graduation pipeline and inspect catalog-backed rule selection without changing production pages.
        </p>
      </div>

      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle>1. Input Data</CardTitle>
          <CardDescription>Load a built-in mock, upload a local JSON file, or edit the JSON directly.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto]">
            <div className="flex flex-col gap-2">
              <Label>Built-in Mock</Label>
              <Select
                value={selectedMockPath}
                onValueChange={(value) => {
                  setSelectedMockPath(value);
                  void loadMock(value);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select mock JSON" />
                </SelectTrigger>
                <SelectContent>
                  {MOCK_FILES.map((mock) => (
                    <SelectItem key={mock.path} value={mock.path}>
                      {mock.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">Current: {selectedMockLabel}</p>
            </div>
            <div className="flex items-end">
              <Button type="button" variant="outline" onClick={() => void loadMock()}>
                Load Mock
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Local JSON File</Label>
            <Input
              type="file"
              accept="application/json,.json"
              onChange={(event) => void loadLocalJsonFile(event.target.files?.[0])}
            />
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label>Entry Year</Label>
              <Input type="number" value={entryYear} onChange={(e) => setEntryYear(Number(e.target.value))} />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Major</Label>
              <Select value={userMajor} onValueChange={setUserMajor}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Major" />
                </SelectTrigger>
                <SelectContent>
                  {MAJOR_OPTIONS.filter((option) => option.value !== 'NONE').map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.value} ({option.label})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 flex flex-col gap-2">
              <Label>Minors (Optional)</Label>
              <MultiSelect
                options={[
                  ...MINOR_OPTIONS.map((option) => ({
                    label: `${option.value} (${option.label})`,
                    value: option.value,
                  })),
                ]}
                selected={userMinors}
                onChange={setUserMinors}
                placeholder="Select Minors (Majors can be Minors)"
              />
            </div>
            <div className="col-span-2 flex flex-col gap-2">
              <Label>Minor Declaration Terms</Label>
              <pre className="min-h-10 rounded-md border bg-gray-50 p-2 text-xs dark:bg-gray-900">
                {JSON.stringify(minorDeclarationTerms, null, 2)}
              </pre>
              <p className="text-xs text-gray-500">
                Edit minorDeclarationTerms in the JSON input to try different declaration-term scenarios.
              </p>
            </div>
            <div className="col-span-2">
              <GradeStatusTermsPanel terms={gradeStatusTerms} />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label>JSON Input</Label>
            <Textarea
              className="h-64 font-mono text-xs"
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
            />
          </div>
          <Button onClick={runPipeline} className="w-full">
            Run Pipeline
          </Button>

          {error && <div className="rounded-md bg-red-100 p-4 text-red-700">Error: {error}</div>}
        </CardContent>
      </Card>

      {/* Results Section */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Step 1 & 2 */}
        <ResultCard title="Step 1: Parse & Validate" data={step2Result} />

        {/* Step 3 */}
        <ResultCard title="Step 3: Normalize" data={step3Result} />

        {/* Step 4 */}
        <ResultCard title="Step 4: Engine (Core Logic)" data={step4Result} />
      </div>

      {/* Final Result */}
      {step5Result && (
        <Card className="border-2 border-green-500">
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle>Final Output (UI ViewModel)</CardTitle>
                <CardDescription>{step5Result.displayMessage}</CardDescription>
              </div>
              <Button type="button" variant="outline" onClick={() => void openCurrentResultInDashboard()}>
                대시보드에서 보기
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="rounded-md bg-gray-50 p-4">
                <h3 className="mb-2 font-bold">Fine-Grained Requirements</h3>
                <ul className="space-y-1 text-sm">
                  {step5Result.fineGrainedRequirements?.map((req: any) => (
                    <li key={req.id} className="flex items-center gap-2">
                      <Badge
                        variant={
                          req.satisfied ? 'secondary' : req.status === 'needs_review' ? 'outline' : 'destructive'
                        }
                      >
                        {req.status ?? (req.satisfied ? 'satisfied' : 'unsatisfied')}
                      </Badge>
                      <span>{req.label}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-md bg-blue-50 p-4">
                <h3 className="mb-2 font-bold">Recommendations</h3>
                <ul className="list-disc pl-5 text-sm">
                  {step5Result.recommendations?.map((rec: any, i: number) => (
                    <li key={i}>
                      Consider <b>{rec.courseCode}</b> ({rec.courseName}) - {rec.reason}
                    </li>
                  ))}
                  {step5Result.recommendations?.length === 0 && <li>No recommendations generated.</li>}
                </ul>
                {step5Result.recommendationPolicy && (
                  <p className="mt-3 text-xs text-gray-600">
                    Policy: total {step5Result.recommendationPolicy.maxTotal}, category{' '}
                    {step5Result.recommendationPolicy.maxPerCategory}, broad requirement{' '}
                    {step5Result.recommendationPolicy.maxPerBroadRequirement}
                  </p>
                )}
                {step5Result.recommendationSuppressions?.length > 0 && (
                  <div className="mt-3 rounded-md border bg-white p-3">
                    <h4 className="mb-2 text-xs font-semibold text-gray-500 uppercase">Hidden Candidates</h4>
                    <ul className="space-y-1 text-xs text-gray-600">
                      {step5Result.recommendationSuppressions.map((suppression: any, i: number) => (
                        <li key={`${suppression.reason}-${suppression.requirementId ?? suppression.categoryKey}-${i}`}>
                          <Badge variant="outline">{suppression.reason}</Badge>{' '}
                          <code>{suppression.requirementId ?? suppression.categoryKey}</code>: {suppression.message}
                          {typeof suppression.suppressedCount === 'number' && (
                            <span> ({suppression.suppressedCount} hidden)</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <details>
                <summary className="cursor-pointer text-gray-500">Full JSON</summary>
                <pre className="mt-2 max-h-64 overflow-auto rounded bg-gray-900 p-2 text-xs text-white">
                  {JSON.stringify(step5Result, null, 2)}
                </pre>
              </details>
            </div>
          </CardContent>
        </Card>
      )}

      {catalogSelection && <CatalogSelectionPanel selection={catalogSelection} />}
    </div>
  );
}

function GradeStatusTermsPanel({ terms }: { terms: GradeStatusTerm[] }) {
  return (
    <div className="space-y-2">
      <Label>Grade Status Terms</Label>
      <div className="rounded-md border bg-amber-50 p-3 text-sm dark:bg-amber-950/20">
        {terms.length === 0 ? (
          <p className="text-gray-500">No non-official grade terms declared.</p>
        ) : (
          <ul className="space-y-2">
            {terms.map((term) => (
              <li key={`${term.year}-${term.semester}-${term.status}`} className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">
                    {term.year}-{term.semester}
                  </Badge>
                  <Badge variant="secondary">{term.status}</Badge>
                  {typeof term.courseCount === 'number' && (
                    <span className="text-xs text-gray-600">{term.courseCount} courses</span>
                  )}
                  {term.gradeValues && term.gradeValues.length > 0 && (
                    <span className="text-xs text-gray-600">
                      grade cells: {term.gradeValues.map((value) => value || 'blank').join(', ')}
                    </span>
                  )}
                </div>
                {term.reason && <p className="text-xs text-gray-600">{term.reason}</p>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function CatalogSelectionPanel({ selection }: { selection: GraduationCatalogSelectionSummary }) {
  const applicableRules = selection.applicableRules.slice(0, 40);
  const needsContext = selection.needsContext.slice(0, 40);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Catalog Selection</CardTitle>
        <CardDescription>
          The adapter output attached to the UI ViewModel. This is read-only and separate from production screens.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-3 md:grid-cols-3">
          <Metric label="Applicable rules" value={selection.applicableRules.length} />
          <Metric label="Needs context" value={selection.needsContext.length} />
          <Metric label="Source refs" value={selection.sourceRefs.length} />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Selection Context</h3>
            <pre className="max-h-48 overflow-auto rounded-md bg-gray-900 p-3 text-xs text-white">
              {JSON.stringify(selection.context, null, 2)}
            </pre>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Aggregated Source Refs</h3>
            <div className="max-h-48 overflow-auto rounded-md border p-3 text-sm">
              {selection.sourceRefs.length === 0 ? (
                <p className="text-gray-500">No sourceRefs</p>
              ) : (
                <ul className="space-y-1">
                  {selection.sourceRefs.map((sourceRef) => (
                    <li key={`${sourceRef.manualYear}-${sourceRef.page}-${sourceRef.note ?? ''}`}>
                      <Badge variant="outline">
                        {sourceRef.manualYear} p.{sourceRef.page}
                      </Badge>
                      <span className="ml-2 text-gray-600">{sourceRef.note ?? sourceRef.path}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <RuleList
            title="Applicable Rules"
            emptyText="No applicable catalog rules."
            rules={applicableRules.map((rule) => ({
              id: rule.id,
              badge: rule.kind,
              detail: `${formatScope(rule.scope)} | ${formatSourceRefs(rule.sourceRefs)}`,
            }))}
            truncated={selection.applicableRules.length - applicableRules.length}
          />
          <RuleList
            title="Needs Context"
            emptyText="No catalog rules need extra context."
            rules={needsContext.map((item) => ({
              id: item.rule.id,
              badge: item.missingContext.join(', ') || 'context',
              detail: `${formatScope(item.rule.scope)} | ${formatSourceRefs(item.rule.sourceRefs)}`,
            }))}
            truncated={selection.needsContext.length - needsContext.length}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border bg-gray-50 p-3 dark:bg-gray-900">
      <div className="text-xs font-medium text-gray-500 uppercase">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </div>
  );
}

function RuleList({
  title,
  emptyText,
  rules,
  truncated,
}: {
  title: string;
  emptyText: string;
  rules: { id: string; badge: string; detail: string }[];
  truncated: number;
}) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold">{title}</h3>
      <div className="max-h-80 overflow-auto rounded-md border">
        {rules.length === 0 ? (
          <p className="p-3 text-sm text-gray-500">{emptyText}</p>
        ) : (
          <ul className="divide-y">
            {rules.map((rule) => (
              <li key={rule.id} className="space-y-1 p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs dark:bg-gray-800">{rule.id}</code>
                  <Badge variant="secondary">{rule.badge}</Badge>
                </div>
                <p className="text-xs text-gray-500">{rule.detail}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
      {truncated > 0 && <p className="text-xs text-gray-500">Showing first 40 rules, {truncated} hidden.</p>}
    </div>
  );
}

function formatScope(scope: GraduationCatalogSelectionSummary['applicableRules'][number]['scope']): string {
  if (!scope) return 'missing scope';
  if (scope.type === 'global') return 'global';
  if (scope.type === 'program-kind') return `${scope.programKind}: all`;
  return `${scope.programKind}: ${scope.programCodes.join(', ')}`;
}

function ResultCard({ title, data }: { title: string; data: any }) {
  if (!data)
    return (
      <Card className="opacity-50">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-400">Waiting...</p>
        </CardContent>
      </Card>
    );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <pre className="max-h-48 overflow-auto rounded bg-gray-100 p-2 text-xs dark:bg-gray-800">
          {JSON.stringify(data, null, 2)}
        </pre>
      </CardContent>
    </Card>
  );
}
