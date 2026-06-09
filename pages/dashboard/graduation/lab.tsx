import React, { useState } from 'react';
import { NextSeo } from 'next-seo';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@components/ui/card';
import { Button } from '@components/ui/button';
import { Textarea } from '@components/ui/textarea';
import { Input } from '@components/ui/input';
import { Label } from '@components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select';
import { MultiSelect } from '@components/ui/multi-select';

// Direct imports from the new features module
import {
  parseRawToTakenCourses,
  validateTakenCourses,
  normalizeTakenCourses,
} from '@features/graduation/middlewares/validation';
import { evaluateGraduationStatus } from '@features/graduation/domain/engine';
import { refineGradStatusForUI } from '@features/graduation/middlewares/refine';
import { mapDeficitToRecommendations, MockCourseRepository } from '@features/graduation/data';
import { resolveMajorForEvaluation } from '@features/graduation/domain';

import { UserTakenCourseListType } from '@lib/types/grad';
import { MAJOR_OPTIONS, MINOR_OPTIONS } from '@const/major-minor-options';

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

export default function GraduationLabPage() {
  const [jsonInput, setJsonInput] = useState(MOCK_INPUT);
  const [entryYear, setEntryYear] = useState<number>(2020);
  const [userMajor, setUserMajor] = useState<string>('EC');
  const [userMinors, setUserMinors] = useState<string[]>([]);

  // Pipeline Step Results
  const [step1Result, setStep1Result] = useState<any>(null); // Parse
  const [step2Result, setStep2Result] = useState<any>(null); // Validate
  const [step3Result, setStep3Result] = useState<any>(null); // Normalize
  const [step4Result, setStep4Result] = useState<any>(null); // Engine
  const [step5Result, setStep5Result] = useState<any>(null); // Refine

  const [error, setError] = useState<string | null>(null);

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
      let effectiveEntryYear = entryYear;
      if (raw.studentId && typeof raw.studentId === 'string' && raw.studentId.length >= 4) {
        const inferredYear = parseInt(raw.studentId.substring(0, 4));
        if (!isNaN(inferredYear)) {
          effectiveEntryYear = inferredYear;
          setEntryYear(inferredYear);
        }
      }
      // Infer input major (if studentId exists and major logic was available, or if major field exists)
      // For now, we trust the manual input or keeps existing state, but let's log it if present.

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
      const majorResolution = resolveMajorForEvaluation(userMajor, normalized.takenCourses);
      const effectiveUserMajor = majorResolution.code ?? (userMajor ? userMajor : undefined);

      // Step 4: Engine
      const engineResult = await evaluateGraduationStatus({
        takenCourses: normalized,
        ruleContext: {
          entryYear: effectiveEntryYear,
          userMajor: effectiveUserMajor,
          userMinors,
        },
      });
      setStep4Result(engineResult);

      // (Data Layer Check for Deficits)
      let recommendations: any[] = [];
      if (!engineResult.totalSatisfied) {
        const needsReviewCategories = new Set<string>(
          engineResult.fineGrainedRequirements
            .filter((requirement) => requirement.status === 'needs_review')
            .map((requirement) => requirement.categoryKey),
        );
        const deficits: Record<string, number> = {};
        Object.entries(engineResult.graduationCategory).forEach(([key, category]) => {
          if (!category.satisfied && !needsReviewCategories.has(key)) {
            deficits[key] = category.minConditionCredits - category.totalCredits;
          }
        });
        const repo = new MockCourseRepository();
        recommendations = await mapDeficitToRecommendations(deficits, repo);
      }

      // Step 5: Refine
      const viewModel = refineGradStatusForUI(engineResult, { recommendations });
      setStep5Result(viewModel);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="container mx-auto space-y-8 py-10">
      <NextSeo title="Graduation Logic Lab" description="졸업 로직 테스트 페이지" noindex />

      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold">🧪 Graduation Architecture Lab</h1>
        <p className="text-gray-500">
          Test the new <code>features/graduation</code> pipeline step-by-step.
        </p>
      </div>

      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle>1. Input Data</CardTitle>
          <CardDescription>Enter course data in JSON format.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
            <CardTitle>🎯 Final Output (UI ViewModel)</CardTitle>
            <CardDescription>{step5Result.displayMessage}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="rounded-md bg-gray-50 p-4">
                <h3 className="mb-2 font-bold">Fine-Grained Requirements</h3>
                <ul className="space-y-1 text-sm">
                  {step5Result.fineGrainedRequirements?.map((req: any) => (
                    <li key={req.id} className={req.satisfied ? 'text-green-600' : 'text-red-500'}>
                      {req.satisfied ? '✅' : '❌'} {req.label}
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
    </div>
  );
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
