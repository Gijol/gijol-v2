import { readFileSync } from 'fs';
import { join } from 'path';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent, { PointerEventsCheckLevel } from '@testing-library/user-event';

import { RequirementsList } from '../components/dashboard/requirements-list';
import { DEFAULT_RECOMMENDATION_DISPLAY_POLICY } from '../features/graduation/data';
import { uploadAndEvaluate } from '../features/graduation/usecases/uploadAndEvaluate';

function readGraduationMock(filename: string): any {
  return JSON.parse(readFileSync(join(process.cwd(), 'public/mocks/graduation', filename), 'utf8'));
}

function getPercentage(earned: number, required: number): number {
  if (required <= 0) return 100;
  return Math.min(100, Math.round((earned * 100) / required));
}

describe('RequirementsList recommendation policy notices', () => {
  const catalogSourceRef = {
    manualYear: 2026,
    page: 33,
    path: 'docs/bachelor_manual/2026_manual.pdf',
    note: '2021 이후 입학생 전공학점 및 연구학점 기준',
  };

  const scienceRequirementWithRecommendations = {
    domain: '기초과학',
    required: 17,
    earned: 16,
    percentage: 94,
    satisfied: false,
    messages: [],
    courses: [],
    recommendedCourses: [
      {
        courseCode: 'GS1304',
        courseName: '현대 생명과학의 이해',
        credit: 1,
        category: '기초과학 전체 이수학점',
      },
    ],
    allRecommendedCourses: [
      {
        courseCode: 'GS1304',
        courseName: '현대 생명과학의 이해',
        credit: 1,
        category: '기초과학 전체 이수학점',
      },
      {
        courseCode: 'GS1401',
        courseName: '일반물리학 및 연습 I',
        credit: 3,
        category: '기초과학 전체 이수학점',
      },
      {
        courseCode: 'GS1501',
        courseName: '일반화학 및 연습 I',
        credit: 3,
        category: '기초과학 전체 이수학점',
      },
    ],
    recommendationPolicy: DEFAULT_RECOMMENDATION_DISPLAY_POLICY,
    recommendationSuppressions: [],
  };

  it('shows a major-context notice when major recommendations are suppressed', async () => {
    const user = userEvent.setup();

    render(
      <RequirementsList
        requirements={[
          {
            domain: '전공',
            required: 36,
            earned: 0,
            percentage: 0,
            satisfied: false,
            messages: [],
            courses: [],
            recommendedCourses: [],
            recommendationPolicy: DEFAULT_RECOMMENDATION_DISPLAY_POLICY,
            recommendationSuppressions: [
              {
                categoryKey: 'major',
                requirementId: 'major-context',
                reason: 'missing_major_context',
                message: '전공 컨텍스트가 없어 전공 추천을 숨겼습니다.',
                suppressedCount: 1,
              },
            ],
          },
        ]}
      />,
    );

    await user.click(screen.getByRole('button', { name: /전공/ }));

    expect(await screen.findByText('추천 과목')).toBeInTheDocument();
    expect(await screen.findByText('전공 추천 보류')).toBeInTheDocument();
    expect(screen.getByText('전공을 선택하면 전공 요건에 맞는 추천을 볼 수 있습니다.')).toBeInTheDocument();
    expect(screen.queryByText('추천 표시 안내')).not.toBeInTheDocument();
  });

  it('shows a display-cap notice when broad recommendations are capped', async () => {
    const user = userEvent.setup();

    render(
      <RequirementsList
        requirements={[
          {
            domain: '기초과학',
            required: 17,
            earned: 16,
            percentage: 94,
            satisfied: false,
            messages: [],
            courses: [],
            recommendedCourses: [
              {
                courseCode: 'GS1304',
                courseName: '현대 생명과학의 이해',
                credit: 1,
              },
            ],
            recommendationPolicy: DEFAULT_RECOMMENDATION_DISPLAY_POLICY,
            recommendationSuppressions: [
              {
                categoryKey: 'scienceBasic',
                requirementId: 'science-total',
                reason: 'display_cap',
                message: '요건별 추천 상한(3개)을 초과한 후보를 숨겼습니다.',
                suppressedCount: 7,
              },
            ],
          },
        ]}
      />,
    );

    await user.click(screen.getByRole('button', { name: /기초과학/ }));

    expect(await screen.findByText('추천 과목')).toBeInTheDocument();
    expect(await screen.findByText('대표 후보만 표시')).toBeInTheDocument();
    expect(screen.getByText(/후보가 많아 7개는 숨겼습니다/)).toBeInTheDocument();
    expect(screen.queryByText('추천 표시 안내')).not.toBeInTheDocument();
  });

  it('opens an underlay panel with all recommendation candidates', async () => {
    const user = userEvent.setup({ pointerEventsCheck: PointerEventsCheckLevel.Never });

    render(<RequirementsList requirements={[scienceRequirementWithRecommendations]} />);

    await user.click(screen.getByRole('button', { name: /기초과학/ }));
    await user.click(await screen.findByRole('button', { name: /전체 보기/ }));

    expect(await screen.findByRole('heading', { name: '전체 추천 과목' })).toBeInTheDocument();
    expect(screen.getByText('대표 1 / 전체 3')).toBeInTheDocument();
    expect(screen.getByTestId('all-recommendations-panel')).toHaveClass(
      'z-50',
      'lg:z-[-1]',
      'lg:right-full',
      'lg:w-[min(36rem,calc(100vw-100%))]',
      'overflow-y-auto',
      'overscroll-contain',
    );
    expect(screen.getByText('대표 1개를 먼저 보여주고, 전체 후보 3개를 아래에 모았습니다.')).toBeInTheDocument();
    expect(screen.getByText('GS1401')).toBeInTheDocument();
    expect(screen.getByText('일반화학 및 연습 I')).toBeInTheDocument();
  });

  it('filters dense recommendation panels by course code or name', async () => {
    const user = userEvent.setup({ pointerEventsCheck: PointerEventsCheckLevel.Never });
    const denseRequirement = {
      ...scienceRequirementWithRecommendations,
      allRecommendedCourses: Array.from({ length: 13 }, (_, index) => ({
        courseCode: `GS${String(1400 + index).padStart(4, '0')}`,
        courseName: `추천 과목 ${index + 1}`,
        credit: 3,
        category: '기초과학 전체 이수학점',
      })),
    };

    render(<RequirementsList requirements={[denseRequirement]} />);

    await user.click(screen.getByRole('button', { name: /기초과학/ }));
    await user.click(await screen.findByRole('button', { name: /전체 보기/ }));
    await user.type(await screen.findByRole('searchbox', { name: '전체 추천 과목 검색' }), 'GS1401');

    expect(screen.getByText('1개가 검색 조건에 맞습니다.')).toBeInTheDocument();
    expect(screen.getByText('GS1401')).toBeInTheDocument();
    expect(screen.queryByText('GS1402')).not.toBeInTheDocument();
  });

  it('keeps wheel events inside the all-recommendations panel', async () => {
    const user = userEvent.setup({ pointerEventsCheck: PointerEventsCheckLevel.Never });
    const onWheel = jest.fn();

    render(
      <div onWheel={onWheel}>
        <RequirementsList requirements={[scienceRequirementWithRecommendations]} />
      </div>,
    );

    await user.click(screen.getByRole('button', { name: /기초과학/ }));
    await user.click(await screen.findByRole('button', { name: /전체 보기/ }));

    fireEvent.wheel(screen.getByTestId('all-recommendations-panel'), { deltaY: 400 });

    expect(onWheel).not.toHaveBeenCalled();
  });

  it('shows compact source-backed evidence for fine-grained requirements', async () => {
    const user = userEvent.setup();

    render(
      <RequirementsList
        requirements={[
          {
            domain: '전공',
            required: 33,
            earned: 21,
            percentage: 64,
            satisfied: false,
            messages: [
              '미충족 — 최소 33학점 필요, 현재 21학점 (부족 12학점)',
              '전공 공통 이수학점 (21/33학점, 12학점 부족)',
              '졸업 직전 학기에는 학과 확인이 필요합니다.',
            ],
            courses: [],
            appliedRequirements: [
              {
                id: 'major-credits',
                categoryKey: 'major',
                label: '전공 공통 이수학점 (21/33학점, 12학점 부족)',
                requiredCredits: 33,
                acquiredCredits: 21,
                missingCredits: 12,
                satisfied: false,
                status: 'unsatisfied',
                importance: 'must',
                hint: '전공 12학점이 더 필요합니다.',
                sourceRefs: [catalogSourceRef],
                matchedCourses: [],
              },
            ],
          },
        ]}
      />,
    );

    await user.click(screen.getByRole('button', { name: /전공/ }));

    expect(await screen.findByText('적용 근거')).toBeInTheDocument();
    expect(screen.getByText('전공 공통 이수학점')).toBeInTheDocument();
    expect(screen.getByText('미충족')).toBeInTheDocument();
    expect(screen.getByText('21/33학점, 12학점 부족')).toBeInTheDocument();
    expect(screen.getByText('2026 p.33')).toBeInTheDocument();
    expect(screen.getAllByText('전공 공통 이수학점')).toHaveLength(1);
    expect(screen.queryByText('전공 12학점이 더 필요합니다.')).not.toBeInTheDocument();
    expect(screen.queryByText('미충족 사항')).not.toBeInTheDocument();
    expect(screen.getByText('졸업 직전 학기에는 학과 확인이 필요합니다.')).toBeInTheDocument();
  });

  it('does not show the evidence section when no source or context evidence exists', async () => {
    const user = userEvent.setup();

    render(
      <RequirementsList
        requirements={[
          {
            domain: '자유학점',
            required: 0,
            earned: 12,
            percentage: 100,
            satisfied: true,
            messages: [],
            courses: [],
            appliedRequirements: [
              {
                id: 'free-elective',
                categoryKey: 'otherUncheckedClass',
                label: '자유학점',
                requiredCredits: 0,
                acquiredCredits: 12,
                missingCredits: 0,
                satisfied: true,
                importance: 'should',
                matchedCourses: [],
              },
            ],
          },
        ]}
      />,
    );

    await user.click(screen.getByRole('button', { name: /자유학점/ }));

    expect(screen.queryByText('적용 근거')).not.toBeInTheDocument();
  });

  it('shows a needs-context review notice in the evidence section', async () => {
    const user = userEvent.setup();

    render(
      <RequirementsList
        requirements={[
          {
            domain: '부전공',
            required: 18,
            earned: 6,
            percentage: 33,
            satisfied: false,
            messages: [],
            courses: [],
            catalogNeedsContext: [
              {
                missingContext: ['declarationTerm'],
                rule: {
                  id: 'minor.ai.mandatory.a',
                  kind: 'course-count',
                  label: 'AI 부전공 필수 A그룹',
                  scope: { type: 'program', programKind: 'minor', programCodes: ['AI'] },
                  sourceRefs: [
                    {
                      manualYear: 2026,
                      page: 25,
                      path: 'docs/bachelor_manual/2026_manual.pdf',
                      note: 'AI 부전공 필수 과목',
                    },
                  ],
                },
              },
            ],
          },
        ]}
      />,
    );

    await user.click(screen.getByRole('button', { name: /부전공/ }));

    expect(await screen.findByText('적용 근거')).toBeInTheDocument();
    expect(screen.getByText('AI 부전공 필수 A그룹')).toBeInTheDocument();
    expect(screen.getByText('선언 학기 정보가 필요합니다.')).toBeInTheDocument();
    expect(screen.getByText('2026 p.25')).toBeInTheDocument();
  });

  it('renders uploaded pipeline dashboard recommendations with catalog evidence', async () => {
    const user = userEvent.setup({ pointerEventsCheck: PointerEventsCheckLevel.Never });
    const mock = readGraduationMock('catalog-lab-uploaded-transcript-2022-1-in-progress.json');
    const result = await uploadAndEvaluate(mock, {
      entryYear: mock.entryYear,
      userMajor: mock.userMajor,
      userMinors: mock.userMinors,
      minorDeclarationTerms: mock.minorDeclarationTerms,
    });
    const humanitiesStatus = result.data?.graduationCategory.humanities;
    const humanitiesRequirements =
      result.data?.fineGrainedRequirements.filter((requirement) => requirement.categoryKey === 'humanities') ?? [];
    const inProgressCourseCodes = new Set(
      mock.takenCourses
        .filter((course: any) => course.gradeStatus === 'in_progress')
        .map((course: any) => course.courseCode),
    );
    const allRecommendationCodes =
      result.data?.allRecommendations.map((recommendation) => recommendation.courseCode) ?? [];

    expect(result.success).toBe(true);
    expect(humanitiesStatus).toBeDefined();
    expect(result.data?.recommendations.map((recommendation) => recommendation.courseCode)).not.toContain('CSE101');
    expect(allRecommendationCodes.some((courseCode) => inProgressCourseCodes.has(courseCode))).toBe(false);

    render(
      <RequirementsList
        requirements={[
          {
            domain: '인문사회',
            required: humanitiesStatus?.minConditionCredits ?? 0,
            earned: humanitiesStatus?.totalCredits ?? 0,
            percentage: getPercentage(humanitiesStatus?.totalCredits ?? 0, humanitiesStatus?.minConditionCredits ?? 0),
            satisfied: humanitiesStatus?.satisfied ?? false,
            messages: humanitiesStatus?.messages ?? [],
            courses: humanitiesStatus?.userTakenCoursesList.takenCourses ?? [],
            appliedRequirements: humanitiesRequirements,
            recommendedCourses: (result.data?.recommendations ?? [])
              .filter((recommendation) => recommendation.categoryKey === 'humanities')
              .map((recommendation) => ({
                courseCode: recommendation.courseCode,
                courseName: recommendation.courseName,
                credit: recommendation.credit,
                category: recommendation.reason,
              })),
            allRecommendedCourses: (result.data?.allRecommendations ?? [])
              .filter((recommendation) => recommendation.categoryKey === 'humanities')
              .map((recommendation) => ({
                courseCode: recommendation.courseCode,
                courseName: recommendation.courseName,
                credit: recommendation.credit,
                category: recommendation.reason,
              })),
            recommendationPolicy: result.data?.recommendationPolicy ?? DEFAULT_RECOMMENDATION_DISPLAY_POLICY,
            recommendationSuppressions: (result.data?.recommendationSuppressions ?? []).filter(
              (suppression) => suppression.categoryKey === 'humanities',
            ),
          },
        ]}
      />,
    );

    await user.click(screen.getByRole('button', { name: /인문사회/ }));

    expect(await screen.findByText('추천 과목')).toBeInTheDocument();
    expect(screen.getByText(/대표 \d+ \/ 전체 \d+/)).toBeInTheDocument();
    expect(screen.getByText('적용 근거')).toBeInTheDocument();
    expect(screen.getAllByText('인문사회').length).toBeGreaterThan(0);
    expect(screen.getAllByText('2026 p.34').length).toBeGreaterThan(0);
    expect(screen.queryByText('CSE101')).not.toBeInTheDocument();
  });
});
