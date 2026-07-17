import { useFormContext } from 'react-hook-form';
import { CertificateFormValues } from '@/features/certificate/schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Book, BookOpen, BookX, Plane, User } from 'lucide-react';

interface ReviewSectionProps {
  onSubmit?: () => void;
}

export function ReviewSection({ onSubmit }: ReviewSectionProps) {
  const { getValues } = useFormContext<CertificateFormValues>();
  const data = getValues();

  const renderCreditItem = (label: string, value: { completed: number; inProgress: number; total: number }) => (
    <div className="grid gap-2 border-b border-slate-100 py-3 last:border-0 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
      <span className="min-w-0 text-sm font-medium break-words text-slate-700">{label}</span>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:justify-end sm:text-sm">
        <span className="text-slate-500">
          기이수 <span className="font-medium text-slate-900 tabular-nums">{value.completed}</span>
        </span>
        <span className="text-slate-500">
          수강 중 <span className="font-medium text-slate-900 tabular-nums">{value.inProgress}</span>
        </span>
        <span className="font-semibold text-blue-700 tabular-nums">합계 {value.total}</span>
      </div>
    </div>
  );

  const renderOtherUnitItem = (
    label: string,
    value: { credits?: number; university: string; subjects: string[]; semester: string },
  ) => {
    return (
      <div className="border-b border-slate-100 py-3 last:border-0">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-900">{label}</span>
          <span className="text-sm font-semibold text-blue-700 tabular-nums">{value.credits || 0}학점</span>
        </div>
        <div className="mt-2 space-y-1 text-xs text-slate-500">
          <p>대학: {value.university || '-'}</p>
          <p>학기: {value.semester || '-'}</p>
          <p>과목: {value.subjects.length > 0 ? value.subjects.join(', ') : '-'}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-5">
      {/* User Info Card */}
      <Card className="gap-0 overflow-hidden bg-white p-0">
        <CardHeader className="border-border border-b bg-slate-50 px-5 py-4">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <User aria-hidden="true" className="size-5 text-slate-500" />
            신청자 정보
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            <div>
              <p className="text-xs text-slate-500">신청 기간</p>
              <p className="mt-0.5 font-medium text-slate-900 tabular-nums">{data.USER.date || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">학기</p>
              <p className="mt-0.5 font-medium text-slate-900">{data.USER.semester || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">소속</p>
              <p className="mt-0.5 font-medium break-words text-slate-900">{data.USER.affiliation || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">학번</p>
              <p className="mt-0.5 font-medium text-slate-900 tabular-nums">{data.USER.studentNumber || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">성명</p>
              <p className="mt-0.5 font-medium text-slate-900">{data.USER.name || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">연락처</p>
              <p className="mt-0.5 font-medium text-slate-900 tabular-nums">{data.USER.contact || '—'}</p>
            </div>
            {data.USER.majorDetails && (
              <div className="col-span-full">
                <p className="text-xs text-slate-500">전공 세부사항</p>
                <p className="mt-0.5 font-medium break-words text-slate-900">{data.USER.majorDetails}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Credits Grid */}
      <div className="grid grid-cols-1 gap-5">
        {/* Basic Credits */}
        <Card className="gap-0 overflow-hidden bg-white p-0">
          <CardHeader className="border-border border-b bg-slate-50 px-5 py-4">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Book aria-hidden="true" className="size-5 text-slate-500" />
              기초 및 교양 학점
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 py-0">
            {renderCreditItem('언어의 기초', data.B_C.languageBasics)}
            {renderCreditItem('인문사회', data.B_C.humanitiesAndSocial)}
            {renderCreditItem('소프트웨어', data.B_C.software)}
            {renderCreditItem('기초과학', data.B_C.basicScience)}
            {renderCreditItem('GIST 새내기', data.B_C.gistFreshman)}
            {renderCreditItem('전공탐색', data.B_C.gistMajorExploration)}
            {renderCreditItem('신입생세미나', data.B_C.freshmanSeminar)}
          </CardContent>
        </Card>

        {/* Major Related */}
        <Card className="gap-0 overflow-hidden bg-white p-0">
          <CardHeader className="border-border border-b bg-slate-50 px-5 py-4">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <BookOpen aria-hidden="true" className="size-5 text-slate-500" />
              전공 | 연구 | 자유선택
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 py-0">
            {renderCreditItem('전공필수', data.M_R_F.majorRequired)}
            {renderCreditItem('전공선택', data.M_R_F.majorElective)}
            {renderCreditItem('학사논문연구', data.M_R_F.thesisResearch)}
            {renderCreditItem('대학공통', data.M_R_F.universityCommonSubjects)}
            {renderCreditItem('인문사회선택', data.M_R_F.humanitiesAndSocial)}
            {renderCreditItem('언어/SW선택', data.M_R_F.languageSelectionSoftware)}
            {renderCreditItem('기초과학선택', data.M_R_F.basicScienceSelection)}
            {renderCreditItem('타전공', data.M_R_F.otherMajor)}
            {renderCreditItem('대학원과목', data.M_R_F.graduateSchoolSubjects)}
          </CardContent>
        </Card>

        {/* No Credit */}
        <Card className="gap-0 overflow-hidden bg-white p-0">
          <CardHeader className="border-border border-b bg-slate-50 px-5 py-4">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <BookX aria-hidden="true" className="size-5 text-slate-500" />
              무학점 필수
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 py-0">
            {renderCreditItem('예능실기', data.NC.arts)}
            {renderCreditItem('체육실기', data.NC.sports)}
            {renderCreditItem('콜로퀴움', data.NC.colloquium)}
          </CardContent>
        </Card>

        {/* Other Units */}
        <Card className="gap-0 overflow-hidden bg-white p-0">
          <CardHeader className="border-border border-b bg-slate-50 px-5 py-4">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Plane aria-hidden="true" className="size-5 text-slate-500" />
              기타 해외대학 학점
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 py-0">
            {renderOtherUnitItem('해외대학 여름학기', data.OU.summerSession)}
            {renderOtherUnitItem('Study Abroad Program', data.OU.studyAbroad)}
          </CardContent>
        </Card>
      </div>

      {onSubmit && (
        <div className="flex justify-end pt-4">
          <Button size="lg" onClick={onSubmit} className="w-full md:w-auto">
            <Check className="mr-2 h-4 w-4" />
            제출하기
          </Button>
        </div>
      )}
    </div>
  );
}
