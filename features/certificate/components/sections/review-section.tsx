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
    <div className="flex items-center justify-between border-b border-gray-100 py-3 last:border-0">
      <span className="text-sm text-gray-600">{label}</span>
      <div className="flex gap-4 text-sm">
        <span className="text-gray-500">
          기이수: <span className="font-medium text-gray-900">{value.completed}</span>
        </span>
        <span className="text-gray-500">
          수강중: <span className="font-medium text-gray-900">{value.inProgress}</span>
        </span>
        <span className="text-brand-primary font-semibold">합계: {value.total}</span>
      </div>
    </div>
  );

  const renderOtherUnitItem = (
    label: string,
    value: { credits?: number; university: string; subjects: string[]; semester: string },
  ) => {
    return (
      <div className="border-b border-gray-100 py-3 last:border-0">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-900">{label}</span>
          <span className="text-brand-primary text-sm font-semibold">{value.credits || 0}학점</span>
        </div>
        <div className="mt-2 space-y-1 pl-4 text-xs text-gray-500">
          <p>대학: {value.university || '-'}</p>
          <p>학기: {value.semester || '-'}</p>
          <p>과목: {value.subjects.length > 0 ? value.subjects.join(', ') : '-'}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* User Info Card */}
      <Card className="p-0">
        <CardHeader className="border-border border-b p-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <User className="size-5" />
            신청자 정보
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            <div>
              <p className="text-xs text-gray-500">신청 기간</p>
              <p className="mt-0.5 font-medium text-gray-900">{data.USER.date || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">학기</p>
              <p className="mt-0.5 font-medium text-gray-900">{data.USER.semester || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">소속</p>
              <p className="mt-0.5 font-medium text-gray-900">{data.USER.affiliation || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">학번</p>
              <p className="mt-0.5 font-medium text-gray-900">{data.USER.studentNumber || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">성명</p>
              <p className="mt-0.5 font-medium text-gray-900">{data.USER.name || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">연락처</p>
              <p className="mt-0.5 font-medium text-gray-900">{data.USER.contact || '-'}</p>
            </div>
            {data.USER.majorDetails && (
              <div className="col-span-full">
                <p className="text-xs text-gray-500">전공 세부사항</p>
                <p className="mt-0.5 font-medium text-gray-900">{data.USER.majorDetails}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Credits Grid */}
      <div className="grid grid-cols-1 gap-6">
        {/* Basic Credits */}
        <Card className="p-0">
          <CardHeader className="border-border border-b p-3">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Book className="size-5" />
              기초 및 교양 학점
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
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
        <Card className="p-0">
          <CardHeader className="border-border border-b p-3">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <BookOpen className="size-5" />
              전공 | 연구 | 자유선택
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
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
        <Card className="p-0">
          <CardHeader className="border-border border-b p-3">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <BookX className="size-5" />
              무학점 필수
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {renderCreditItem('예능실기', data.NC.arts)}
            {renderCreditItem('체육실기', data.NC.sports)}
            {renderCreditItem('콜로퀴움', data.NC.colloquium)}
          </CardContent>
        </Card>

        {/* Other Units */}
        <Card className="p-0">
          <CardHeader className="border-border border-b p-3">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Plane className="size-5" />
              기타 해외대학 학점
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
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
