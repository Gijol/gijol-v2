import { useState } from 'react';
import Link from 'next/link';
import { NextSeo } from 'next-seo';
import { BookOpen, ArrowUpRight } from 'lucide-react';
import { dashboardLayout } from '@/components/layouts/dashboard-runtime';
import { DashboardPageShell, PageHeader } from '@/components/dashboard/page-shell';

type ProgramGuide = {
  code: string;
  label: string;
  credits: number;
  rules: { label: string; count: number; codes: string[] }[];
  page: number;
};
type YearGuide = {
  year: number;
  total: number;
  gpa: number;
  language: number;
  humanities: number;
  arts: number;
  sports: number;
  majors: ProgramGuide[];
  minors: ProgramGuide[];
};
type Props = { years: YearGuide[] };
const manual = '/academic-manual/2026.pdf';
function Source({ page }: { page: number }) {
  return (
    <a
      href={`${manual}#page=${page}`}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1 text-xs text-blue-700 underline-offset-4 hover:underline"
    >
      편람 {page}쪽<ArrowUpRight size={12} aria-hidden="true" />
    </a>
  );
}

export default function RequirementsGuidePage({ years }: Props) {
  const [entryYear, setEntryYear] = useState(2026);
  const current = years.find((y) => y.year === entryYear)!;
  const [programCode, setProgramCode] = useState('EC');
  const major = current.majors.find((p) => p.code === programCode)!;
  return (
    <DashboardPageShell width="reading" className="space-y-7 pb-12">
      <NextSeo title="졸업요건 안내 · 2026 학사편람" noindex />
      <PageHeader
        eyebrow="2026 학사편람 기준"
        title="내 학번의 졸업요건"
        description="입학 연도에 맞는 기준과 전공·부전공의 세부 조건을 함께 확인하세요."
      />
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm font-medium">
            입학 연도
            <select
              aria-label="입학 연도"
              value={entryYear}
              onChange={(e) => setEntryYear(Number(e.target.value))}
              className="rounded-md border bg-white px-3 py-2"
            >
              {years.map((y) => (
                <option key={y.year} value={y.year}>
                  {y.year}학번
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm font-medium">
            주전공
            <select
              aria-label="주전공"
              value={programCode}
              onChange={(e) => setProgramCode(e.target.value)}
              className="max-w-[210px] rounded-md border bg-white px-3 py-2"
            >
              {current.majors.map((p) => (
                <option key={p.code} value={p.code}>
                  {p.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <a
          href={manual}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 text-sm font-medium text-blue-700"
        >
          <BookOpen size={16} aria-hidden="true" />
          학사편람 원문
        </a>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4" aria-live="polite">
        {[
          [`${current.total}학점`, '졸업 최소 학점'],
          [`${current.gpa.toFixed(1)} / 4.5`, '평균 평점'],
          [`${major.credits}학점`, '주전공 최소 학점'],
          ['6학점', '학사논문연구 I·II'],
        ].map(([value, label]) => (
          <div key={label} className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-xs text-slate-500">{label}</p>
            <p className="mt-2 text-xl font-semibold tracking-tight text-slate-900">{value}</p>
          </div>
        ))}
      </div>
      <p className="text-sm leading-6 text-slate-600">
        교과학점 124학점과 연구학점 6학점을 포함하여 총 130학점 이상이 필요합니다. 학사논문연구는 전공학점과 별도로
        판정합니다. <Source page={entryYear >= 2021 ? 33 : 34} />
      </p>
      <section className="space-y-3" aria-labelledby="common-guide">
        <h2 id="common-guide" className="text-lg font-semibold">
          공통 이수요건
        </h2>
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          {[
            [
              '언어의 기초',
              `${current.language}학점`,
              '영어 I·II와 글쓰기. 글쓰기 선택 과목 중 1과목(3학점)을 이수합니다.',
              18,
            ],
            [
              '기초과학',
              '17~18학점',
              '미적분학 + 수학 선택 1과목 + 기초과학 3분야. 컴퓨터 프로그래밍을 포함하면 17학점, 포함하지 않으면 18학점입니다. 자연과학 실험은 해당 강의와 같은 학기 또는 이후에 이수합니다.',
              19,
            ],
            [
              '인문사회',
              `${current.humanities}학점`,
              'HUS와 PPE를 각각 6학점 이상 이수합니다. 졸업 총학점에는 인문사회 최대 36학점을 인정합니다.',
              20,
            ],
            [
              '예술·체육',
              `예술 ${current.arts} / 체육 ${current.sports}학기`,
              '예술과 체육의 이수 학기를 각각 셉니다. 같은 학기의 여러 수업을 여러 학기로 계산하지 않습니다.',
              entryYear >= 2021 ? 33 : 34,
            ],
            [
              '공통 필수',
              '개별 요건 확인',
              `GIST 새내기, 과학기술과 경제, GIST 대학 콜로퀴움 2학기. ${entryYear >= 2021 ? '전공탐색(UC0902)도 필수입니다. 반도체공학과는 전공탐색 면제 및 콜로퀴움 별도 조건이 적용됩니다.' : ''} SW기초와 코딩은 컴퓨터 프로그래밍 이수로 면제됩니다.`,
              entryYear >= 2021 ? 33 : 34,
            ],
          ].map(([label, amount, description, page]) => (
            <div
              key={label}
              className="grid gap-2 border-b border-slate-100 p-4 last:border-0 sm:grid-cols-[140px_1fr]"
            >
              <div>
                <h3 className="text-sm font-semibold">{label}</h3>
                <p className="mt-1 text-xs font-medium text-blue-700">{amount}</p>
              </div>
              <div>
                <p className="text-sm leading-6 text-slate-600">{description}</p>
                <Source page={Number(page)} />
              </div>
            </div>
          ))}
        </div>
        {entryYear >= 2026 && (
          <p className="rounded-lg bg-blue-50 p-3 text-sm leading-6 text-blue-900">
            2026학번부터 확률과 통계(GS2008/MM2701)가 기초과학 수학 선택 과목에 포함됩니다. 글쓰기 3학점 상한은
            2026학년도부터 적용되며, 2025학년도까지 이수한 글쓰기 과목은 경과조치를 확인합니다. <Source page={19} />
          </p>
        )}
      </section>
      <section className="space-y-3" aria-labelledby="major-guide">
        <h2 id="major-guide" className="text-lg font-semibold">
          {major.label} 전공필수
        </h2>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="mb-3 text-sm text-slate-600">
            전공 {major.credits}학점 이상과 아래 필수 요건을 함께 충족해야 합니다. 일반 전공의 졸업 인정 상한은
            42학점이며, 심화·복수전공은 별도 확인이 필요합니다.
          </p>
          {major.rules.length ? (
            <ul className="space-y-2">
              {major.rules.map((rule, i) => (
                <li key={i} className="text-sm">
                  <span className="font-medium">{rule.label}</span>
                  <span className="ml-2 text-slate-500">
                    {rule.count}과목 · {rule.codes.join(' / ')}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-600">
              {major.code === 'AI'
                ? 'AI융합학과는 별도 전공필수 과목이 없습니다.'
                : '이 전공의 세부 적용 요건은 담당부서 확인이 필요합니다.'}
            </p>
          )}
          <div className="mt-3">
            <Source page={major.page} />
          </div>
        </div>
      </section>
      <section className="space-y-3" aria-labelledby="minor-guide">
        <h2 id="minor-guide" className="text-lg font-semibold">
          부전공은 분야마다 다릅니다
        </h2>
        <p className="text-sm leading-6 text-slate-600">
          선언 후 정규 1학기 이상 수학해야 합니다. 2천번대 과목은 분야별로 허용한 경우에만 인정됩니다. 최소 학점과
          필수과목만으로 선언·경과조치까지 확정할 수는 없습니다. <Source page={27} />
        </p>
        <div className="divide-y rounded-xl border border-slate-200 bg-white">
          {current.minors.map((p) => (
            <details key={p.code} className="group p-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm focus-visible:outline-blue-600">
                <span className="font-medium">
                  {p.label}
                  <span className="ml-2 text-slate-400 group-open:hidden">＋</span>
                </span>
                <span className="shrink-0 font-semibold text-blue-700">{p.credits}학점 이상</span>
              </summary>
              <div className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
                {p.rules.map((r, i) => (
                  <p key={i}>
                    {r.label} · {r.count}과목
                    <br />
                    <span className="text-xs text-slate-500">{r.codes.join(' / ')}</span>
                  </p>
                ))}
                {p.code === 'EC' && (
                  <p>
                    EC 2천번대 6학점 + 3·4천번대 12학점. 2023학번부터 최소 이수학점은 성적부가 방식(A+~D0)만 인정합니다.
                  </p>
                )}
                {p.code === 'MA' && (
                  <p>전공필수 2과목과 MA 3·4천번대 3과목을 포함합니다. 2천번대는 전공필수만 인정합니다.</p>
                )}
                {p.code === 'MC' && <p>2천번대는 전공필수만 인정합니다.</p>}
                {p.code === 'EV' && (
                  <p>실험을 제외한 전공필수 3과목(환경·에너지공학 포함). 2천번대는 인정하지 않습니다.</p>
                )}
                {p.code === 'BS' && <p>강의 2과목 + 실험 1과목. 유기화학 I(BS2101)은 제외합니다.</p>}
                {p.code === 'MM' && (
                  <p>
                    기초과학에 사용한 과목은 제외합니다.{' '}
                    {entryYear >= 2026
                      ? '필수 4과목(12학점) + MM 3·4천번대 선택 6학점.'
                      : `필수 4과목(12학점) + 선택 ${entryYear >= 2021 ? 6 : 3}학점.`}
                    {entryYear < 2026 && (
                      <span className="mt-2 block">
                        GS2003 기이수자는 기초교육 제외 필수 3과목(9학점)과 선택 {entryYear >= 2021 ? 9 : 6}학점을
                        확인합니다. 결합 과목의 경과조치는 2024 편람 PDF 25쪽에 근거합니다.
                      </span>
                    )}
                  </p>
                )}
                {p.code === 'AI' && (
                  <p>
                    2025-2 이후 선언자는 필수과목이 없습니다. 이전 선언자는 A·B 각 1과목이 필요하며, 2024-2 이전
                    선언자는 2024년까지 이수한 종전 프로젝트·콜로퀴움의 경과조치를 적용합니다. AI4020은 EC4209와 동일한
                    필수A 과목으로 인정합니다.
                  </p>
                )}
                {p.code === 'IR' && (
                  <p>
                    2026-1부터 필수과목 없이 15학점. 지정 AI 과목은 최대 4과목, AI2601·AI3601 인정. 이전 선언자의 기이수
                    과목 및 지정 목록은 담당부서 확인이 필요합니다.
                  </p>
                )}
                {p.code === 'FE' && (
                  <p>
                    2025-1학기부터 신규 선언 없이 취소만 가능합니다. 기존 선언자의 이수요건을 안내합니다.{' '}
                    <Source page={15} />
                  </p>
                )}
                {['MD', 'FE'].includes(p.code) && <p>해당 교과과정에서 5과목 이상 이수합니다.</p>}
                {p.code.startsWith('LH_') && (
                  <p>
                    {entryYear <= 2020
                      ? '구 단일 15학점·연계 18학점 또는 개편 체계 18학점 중 선택해야 하므로 개별 확인이 필요합니다.'
                      : '개편된 이수체계도에 따라 18학점 이상 이수합니다.'}{' '}
                    인문사회 모 과목은 인문사회로 분류하고 해당 부전공 요건에도 반영합니다.
                  </p>
                )}
                <Source page={p.page} />
              </div>
            </details>
          ))}
        </div>
      </section>
      <section className="rounded-xl bg-slate-100 p-5 text-sm leading-6 text-slate-600">
        <h2 className="mb-2 font-semibold text-slate-900">자동 판정에서 추가 확인하는 항목</h2>
        <p>
          타대학 학점인정의 승인 영역, 외국인 SW 대체과목, 심화·복수전공, 부전공 선언 후 수학 기간, 구 인문사회 체계 및
          지능로봇 경과조치는 개인별 확인이 필요합니다. 위키와 프리셋의 과목 구분보다 학사편람과 승인 내역을 우선합니다.
        </p>
        <Link href="/dashboard/graduation/upload" className="mt-3 inline-flex font-medium text-blue-700">
          성적표로 내 이수현황 확인 →
        </Link>
      </section>
    </DashboardPageShell>
  );
}
RequirementsGuidePage.getLayout = dashboardLayout;

export async function getStaticProps() {
  const { getBasicRequirementCatalog } = await import('@/features/graduation/domain/rule-catalog/basic-requirements');
  const { MAJOR_PROGRAMS, MINOR_PROGRAMS } =
    await import('@/features/graduation/domain/rule-catalog/academic-programs');
  const {
    getMajorCreditRequirement,
    getMinorCreditRequirement,
    getMajorMandatoryRulesForContext,
    getMinorMandatoryRulesForContext,
  } = await import('@/features/graduation/domain/rule-catalog/major-minor-requirements');
  const years = Array.from({ length: 9 }, (_, i) => 2018 + i).map((year) => {
    const basic = getBasicRequirementCatalog(year);
    const project =
      (minor: boolean) => (program: (typeof MAJOR_PROGRAMS)[number] | (typeof MINOR_PROGRAMS)[number]) => {
        const credit = minor
          ? getMinorCreditRequirement(program.canonicalCode, year)
          : getMajorCreditRequirement(year, program.canonicalCode);
        const rules = (minor ? getMinorMandatoryRulesForContext : getMajorMandatoryRulesForContext)(
          program.canonicalCode,
          { entryYear: year },
        );
        return {
          code: program.canonicalCode,
          label: program.label,
          credits: credit.requiredCredits,
          page: rules[0]?.sourceRefs[0]?.page ?? credit.sourceRefs[0]?.page ?? 27,
          rules: rules.map((r) => ({ label: r.label, count: r.requiredCount, codes: [...r.courses] })),
        };
      };
    return {
      year,
      total: basic.totalCredits.requiredCredits,
      gpa: basic.minGpaForGraduation,
      language: basic.language.totalCredits.requiredCredits,
      humanities: basic.humanities.totalCredits.requiredCredits,
      arts: basic.artsSports.arts.requiredCount,
      sports: basic.artsSports.sports.requiredCount,
      majors: MAJOR_PROGRAMS.filter((p) => !('selectable' in p) || p.selectable !== false).map(project(false)),
      minors: MINOR_PROGRAMS.filter((p) => !('selectable' in p) || p.selectable !== false).map(project(true)),
    };
  });
  return { props: { years } };
}
