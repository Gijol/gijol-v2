import Link from 'next/link';
import { NextSeo } from 'next-seo';
import { ArrowRight, BookOpen, CheckCircle2, FileSpreadsheet, ExternalLink, Scale, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function RequirementsGuidePage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-12">
      <NextSeo title="졸업요건 안내" description="학번별 졸업요건을 확인하세요" noindex />
      {/* Hero Section */}
      <div className="rounded-2xl bg-linear-to-r from-blue-600 to-indigo-600 p-8 text-white shadow-lg">
        <div className="flex items-center gap-3">
          <BookOpen className="h-8 w-8" />
          <h1 className="text-3xl font-bold">졸업요건 안내</h1>
        </div>
        <p className="mt-3 text-lg text-blue-100">GIST 학부 졸업이수요건을 학번별로 정리했습니다.</p>
        <p className="mt-2 text-sm text-blue-200">
          ※ 학번에 따라 요건이 다르므로 본인의 학번에 맞는 요건을 확인하세요.
        </p>
      </div>

      {/* Quick Actions - 원문 규정 */}
      <Card className="border-slate-300 bg-slate-50 transition-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Scale className="h-5 w-5" />
            원문 규정 보기
          </CardTitle>
          <CardDescription>GIST 공식 홈페이지에서 상세 규정을 확인하세요.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 sm:flex-row">
          <Button asChild variant="outline" className="w-full cursor-pointer shadow-none">
            <a href="https://www.gist.ac.kr/kr/html/sub05/05021605.html" target="_blank" rel="noopener noreferrer">
              2018~2020학번 요건 <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>
          <Button asChild variant="outline" className="w-full cursor-pointer shadow-none">
            <a href="https://www.gist.ac.kr/kr/html/sub05/05021604.html" target="_blank" rel="noopener noreferrer">
              2021학번 이후 요건 <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>
          <Button asChild variant="outline" className="w-full cursor-pointer shadow-none">
            <a href="https://www.gist.ac.kr/kr/html/sub05/050211.html" target="_blank" rel="noopener noreferrer">
              학사편람 <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </CardContent>
      </Card>

      {/* 학번별 차이점 */}
      <Section title="📅 학번별 주요 차이점" subtitle="2018~2020 vs 2021학번 이후">
        <div className="overflow-x-auto rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">항목</th>
                <th className="px-4 py-3 text-left font-semibold">2018~2020학번</th>
                <th className="px-4 py-3 text-left font-semibold">2021학번 이후</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="px-4 py-3 font-medium">전공탐색</td>
                <td className="px-4 py-3 text-slate-500">필수 아님</td>
                <td className="px-4 py-3 text-green-600">✅ 1학년 2학기 필수 (UC0902)</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium">GIST새내기</td>
                <td className="px-4 py-3 text-slate-600">신입생 세미나</td>
                <td className="px-4 py-3 text-slate-600">GIST 새내기 (명칭 변경)</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium">예술/체육</td>
                <td className="px-4 py-3 text-slate-600">2018-19: 4과목 / 2020: 2과목</td>
                <td className="px-4 py-3 text-slate-600">2과목</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium">예체능 무료 수강</td>
                <td className="px-4 py-3 text-slate-500">2020학번부터 4학기 무료</td>
                <td className="px-4 py-3 text-slate-600">4학기까지 무료</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Section>

      {/* 총 이수학점 */}
      <Section title="📊 총 이수학점" subtitle="졸업을 위해 필요한 최소 학점">
        <div className="rounded-lg border bg-white p-4">
          <div className="flex items-center justify-between">
            <span className="text-lg font-medium">최소 졸업학점</span>
            <span className="text-2xl font-bold text-blue-600">130학점</span>
          </div>
          <p className="mt-2 text-sm text-slate-600">기초교양 + 전공필수/선택 + 논문연구 + 자유선택 학점의 합</p>
        </div>
      </Section>

      {/* 기초교양 */}
      <Section title="📚 기초교양" subtitle="필수 이수 영역">
        <div className="space-y-4">
          <RequirementCard
            title="언어와 기초"
            credits="7학점"
            items={[
              {
                label: '영어 (4학점)',
                details: ['영어 I: 신입생 영어(2) 또는 발표와 토론(2) 중 택1', '영어 II: 이공계 글쓰기 입문(2)'],
              },
              { label: '글쓰기 (3학점)', details: ['글쓰기 기초 3과목 중 택1 또는 심화 글쓰기 3과목 중 택1'] },
            ]}
            notes={['※ 기초와 심화는 동일 과목으로 간주, 역수강 불가']}
          />

          <RequirementCard
            title="인문사회"
            credits="24학점"
            items={[
              { label: 'HUS(인문학) 6학점 필수', details: [] },
              { label: 'PPE(정치경제철학) 6학점 필수', details: [] },
            ]}
            notes={['※ 24학점 초과 시 최대 12학점까지 자유선택(인문사회)으로 인정']}
          />

          <RequirementCard
            title="기초과학"
            credits="17~18학점 (4분야 중 3분야 필수)"
            items={[
              { label: '수학 (6학점)', details: ['미적분학계열 1과목 + 다변수해석학/미분방정식/선형대수학계열 1과목'] },
              { label: '물리 (4학점)', details: ['일반물리학 및 연습 I(3) + 일반물리학 실험 I(1)'] },
              { label: '화학 (4학점)', details: ['일반화학 및 연습 I(3) + 일반화학 실험 I(1)'] },
              { label: '생명 (4학점)', details: ['생물학계열 1과목(3) + 일반생물학 실험(1)'] },
            ]}
            notes={[
              '※ 4분야 전부 이수 시 한 분야는 자유선택(기초과학선택)으로 인정',
              '※ 실험과목은 강의과목 선이수 또는 동시수강 필수',
            ]}
          />

          <RequirementCard
            title="소프트웨어"
            credits="2~3학점"
            items={[
              { label: 'SW 기초와 코딩 (2학점)', details: ['GS1490'] },
              { label: '또는 컴퓨터 프로그래밍 (3학점)', details: ['GS1401 - 이수 시 SW 기초와 코딩 면제'] },
            ]}
          />

          <RequirementCard
            title="GIST새내기 / 전공탐색"
            credits="1~2학점"
            items={[
              { label: 'GIST새내기 (1학점)', details: ['1학년 1학기 의무수강'] },
              { label: '전공탐색 (1학점)', details: ['1학년 2학기 의무수강 (2021학번 이후 필수)'] },
            ]}
          />
        </div>
      </Section>

      {/* 전공 */}
      <Section title="🎯 전공" subtitle="전공필수 + 전공선택">
        <div className="space-y-4">
          <div className="rounded-lg border bg-white p-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">전공 학점</h4>
              <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                최소 36학점 / 상한 42학점
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-600">전공필수 + 전공선택을 합쳐 최소 36학점 이수</p>
            <p className="mt-1 text-xs text-amber-600">※ 졸업사정 시 42학점까지만 인정 (소재전공: 30~42학점)</p>
          </div>

          <div className="rounded-lg border bg-white p-4">
            <h4 className="font-semibold">전공필수 (학부별 상이)</h4>
            <div className="mt-3 grid gap-2 text-sm">
              <MajorRow major="전기전자컴퓨터" courses="전자공학 실험(3) 또는 컴퓨터 시스템 이론 및 실험(4) 중 택1" />
              <MajorRow
                major="신소재"
                courses="재료과학, 열역학, 유기재료화학, 고분자과학, 전자재료실험, 유기재료실험"
              />
              <MajorRow major="기계" courses="열역학, 고체역학, 유체역학, 동역학, 기계공학실험 I/II" />
              <MajorRow major="지구환경" courses="환경공학, 환경분석실험 I/II, 지구시스템과학, 지구환경이동현상" />
              <MajorRow major="생명과학" courses="유기화학 I, 분자생물학, 생화학 I/II, 세포생물학 등" />
              <MajorRow major="물리" courses="고전역학, 전자기학 I/II, 양자물리 I/II, 열역학 및 통계물리 등" />
              <MajorRow major="화학" courses="분석화학, 물리화학 A/B, 유기화학 I, 화학합성실험 등" />
            </div>
            <p className="mt-3 text-xs text-amber-600">
              ※ 전공필수 과목이 변경된 경우 반드시 변경된 과목을 대체 이수해야 함
            </p>
          </div>
        </div>
      </Section>

      {/* 부/복수/심화전공 */}
      <Section title="🔀 부전공 / 복수전공 / 심화전공" subtitle="추가 전공 이수">
        <div className="space-y-3 rounded-lg border bg-white p-4">
          <div>
            <span className="font-medium">부전공 가능 분야 (15학점):</span>
            <p className="mt-1 text-sm text-slate-600">
              전컴, 소재, 기계, 환경, 생명, 물리, 화학, 수학, 의생명, 에너지, 문화기술, 지능로봇, 인문사회, AI융합
            </p>
          </div>
          <div>
            <span className="font-medium">복수/심화전공 가능 분야:</span>
            <p className="mt-1 text-sm text-slate-600">전컴, 소재, 기계, 환경, 생명, 물리, 화학</p>
          </div>
          <p className="text-xs text-amber-600">
            ※ 이수요건(학사편람) 확인 필수 / 미충족 시 미이수 처리 / 이수구분 모호 시 사전 문의 필수
          </p>
        </div>
      </Section>

      {/* 논문연구 */}
      <Section title="📝 논문연구" subtitle="학사논문 요건 (6학점)">
        <div className="rounded-lg border bg-white p-4">
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
              <span>학사논문연구 I (3학점) - 전공코드+9102</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
              <span>학사논문연구 II (3학점) - 전공코드+9103</span>
            </li>
            <li className="flex items-start gap-2 text-amber-600">
              <span className="mt-0.5 h-4 w-4 shrink-0">⚠️</span>
              <span>
                <strong>학사논문연구 II는 졸업예정학기에 의무 수강</strong>해야 합니다.
              </span>
            </li>
            <li className="flex items-start gap-2 text-slate-500">
              <span className="mt-0.5 h-4 w-4 shrink-0">💡</span>
              <span>물리학 연구의 현재와 미래(1)는 졸업이수학점에 불인정 (총취득학점에만 반영)</span>
            </li>
          </ul>
        </div>
      </Section>

      {/* 기타 필수 */}
      <Section title="💡 기타 필수 과목" subtitle="추가 필수 이수 항목">
        <div className="space-y-4">
          <div className="rounded-lg border bg-white p-4">
            <h4 className="font-semibold text-blue-700">과학기술과 경제 (1학점 필수)</h4>
            <p className="mt-2 text-sm text-slate-600">
              GS1701 과학기술과 경제는 <strong>모든 학번 필수 이수 과목</strong>입니다.
            </p>
          </div>

          <div className="rounded-lg border bg-white p-4">
            <h4 className="font-semibold">봉사활동 / 창의함양 학점 상한</h4>
            <ul className="mt-2 space-y-1 text-sm text-slate-600">
              <li>
                • 사회봉사 + 해외봉사: 둘 다 이수해도 <strong>최대 1학점만 인정</strong>
              </li>
              <li>
                • 창의함양: <strong>최대 1학점까지</strong> 인정
              </li>
            </ul>
          </div>
        </div>
      </Section>

      {/* 무학점 필수 */}
      <Section title="🎨 무학점 필수" subtitle="학점 미부여 필수 과목">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-lg border bg-white p-4 text-center">
            <span className="text-2xl">🎭</span>
            <h4 className="mt-2 font-medium">예술</h4>
            <p className="text-sm text-slate-500">2018~2019학번: 4학기 <br /> 2020학번 이후: 2학기</p>
          </div>
          <div className="rounded-lg border bg-white p-4 text-center">
            <span className="text-2xl">⚽</span>
            <h4 className="mt-2 font-medium">체육</h4>
            <p className="text-sm text-slate-500">2018~2019학번: 4학기 <br /> 2020학번 이후: 2학기</p>
          </div>
          <div className="rounded-lg border bg-white p-4 text-center">
            <span className="text-2xl">🎤</span>
            <h4 className="mt-2 font-medium">콜로퀴움</h4>
            <p className="text-sm text-slate-500">2회 이상 필수</p>
          </div>
        </div>
      </Section>

      {/* 해외파견 */}
      <Section title="✈️ 해외대학 파견" subtitle="계절학기 SAP, 해외대학 파견 학점인정">
        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-slate-600">
            계절학기 SAP, 해외대학 파견 등의 학점인정 이수요건 구분은
            <strong className="text-slate-900"> 신청 당시의 수강신청 가이드라인</strong> 및
            <strong className="text-slate-900"> 소속부서 사전 확인</strong>이 필요합니다.
          </p>
        </div>
      </Section>

      {/* 시스템 한계 안내 */}
      <Card className="border-amber-300 bg-amber-50">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg text-amber-800">
            <AlertTriangle className="h-5 w-5" />
            시스템 안내사항
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-amber-700">
          <p className="mb-2">본 시스템의 졸업요건 자동 검사에는 다음 한계가 있습니다:</p>
          <ul className="list-inside list-disc space-y-1">
            <li>봉사활동/창의함양 학점 상한은 수동 확인이 필요합니다.</li>
            <li>전공 42학점 상한은 경고로만 표시됩니다.</li>
            <li>일부 특수 과목의 이수구분은 학과 사무실에 문의해주세요.</li>
          </ul>
        </CardContent>
      </Card>

      {/* CTA */}
      <div className="rounded-xl border-2 border-dashed border-blue-300 bg-blue-50/50 p-6 text-center">
        <h3 className="text-lg font-semibold text-blue-800">이수요건 확인서가 필요하신가요?</h3>
        <p className="mt-2 text-sm text-blue-600">
          졸업 이수요건 확인서 생성기를 사용해 엑셀 파일을 자동으로 만들어보세요.
        </p>
        <Button asChild size="lg" className="mt-4">
          <Link href="/dashboard/graduation/certificate-builder">
            확인서 생성기 사용하기 <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

// --- Helper Components ---

function Section({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="mb-4">
        <h2 className="text-xl font-bold text-slate-900">{title}</h2>
        <p className="text-sm text-slate-600">{subtitle}</p>
      </div>
      {children}
    </section>
  );
}

function RequirementCard({
  title,
  credits,
  items,
  notes,
}: {
  title: string;
  credits: string;
  items: { label: string; details: string[] }[];
  notes?: string[];
}) {
  return (
    <div className="rounded-lg border bg-white p-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold">{title}</h4>
        <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">{credits}</span>
      </div>
      <div className="mt-3 space-y-2">
        {items.map((item, idx) => (
          <div key={idx}>
            <span className="text-sm font-medium text-slate-700">{item.label}</span>
            {item.details.length > 0 && (
              <ul className="mt-1 ml-4 list-disc text-sm text-slate-600">
                {item.details.map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
      {notes && notes.length > 0 && (
        <div className="mt-3 space-y-1">
          {notes.map((note, idx) => (
            <p key={idx} className="text-xs text-amber-600">
              {note}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

function MajorRow({ major, courses }: { major: string; courses: string }) {
  return (
    <div className="flex gap-2 rounded bg-slate-50 p-2">
      <span className="w-28 shrink-0 font-medium text-slate-700">{major}</span>
      <span className="text-slate-600">{courses}</span>
    </div>
  );
}
