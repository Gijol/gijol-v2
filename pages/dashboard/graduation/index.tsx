import React, { useMemo } from 'react';
import { extractOverallStatus, getPercentage } from '@utils/graduation/grad-formatter';
import UploadEmptyState from '@components/graduation/upload-empty-state';
import { AlertTriangle, CircleCheck, TrendingUp } from 'lucide-react';
import { buildCourseListWithPeriod, calcAverageGrade } from '@utils/course/analytics';
import { useGraduationStore } from '../../../lib/stores/useGraduationStore';
import { cn } from '@/lib/utils';
import { RingProgress } from '@components/ui/ring-progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@components/ui/accordion';
import { Progress } from '@components/ui/progress';
import { Badge } from '@components/ui/badge';
import { Card, CardContent } from '@components/ui/card';
import { ScrollArea } from '@components/ui/scroll-area';

const TOTAL_REQUIRED_CREDITS = 130;
const toOrdinal = (n: number) => {
  const j = n % 10;
  const k = n % 100;
  if (j === 1 && k !== 11) return `${n}st`;
  if (j === 2 && k !== 12) return `${n}nd`;
  if (j === 3 && k !== 13) return `${n}rd`;
  return `${n}`;
};

export default function GraduationStatusPage() {
  const { parsed, gradStatus } = useGraduationStore();

  const courseListWithPeriod = useMemo(() => buildCourseListWithPeriod(parsed), [parsed]);
  const overallAverageGrade = useMemo(
    () => calcAverageGrade(courseListWithPeriod.flatMap((t) => t.userTakenCourseList ?? [])),
    [courseListWithPeriod],
  );

  if (!parsed || !gradStatus) {
    return (
      <div className="w-full pt-6 pb-12">
        <div className="flex flex-col gap-6">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-foreground text-2xl font-bold">Academic HUD</h2>
              <p className="text-muted-foreground text-sm">Track your graduation progress</p>
            </div>
          </div>
          <Card className="hover:bg-secondary/10 transition-all hover:shadow-md">
            <CardContent className="p-6">
              <UploadEmptyState />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const overallProps = extractOverallStatus(gradStatus);
  const totalCreditsEarned = overallProps?.totalCredits ?? 0;

  const validTermGrades = courseListWithPeriod.filter((t) => t.grade && t.grade > 0);

  const gradeDelta =
    validTermGrades.length >= 2
      ? validTermGrades[validTermGrades.length - 1].grade - validTermGrades[validTermGrades.length - 2].grade
      : null;

  const semesterCount = courseListWithPeriod.length;
  const standingLabel =
    semesterCount >= 7
      ? '4학년'
      : semesterCount >= 5
        ? '3학년'
        : semesterCount >= 3
          ? '2학년'
          : semesterCount > 0
            ? '1학년'
            : '-';
  const semesterLabel = semesterCount ? `${toOrdinal(semesterCount)}학기` : '-';

  const requirements =
    overallProps?.categoriesArr.map(({ domain, status }) => {
      const required = status?.minConditionCredits ?? 0;
      const earned = status?.totalCredits ?? 0;
      return {
        domain,
        required,
        earned,
        percentage: getPercentage(status),
        satisfied: status?.satisfied ?? false,
        messages: status?.messages ?? [],
        courses: status?.userTakenCoursesList?.takenCourses ?? [],
      };
    }) ?? [];
  const traits = ['글로벌 러너', '융합 지향', '꾸준한 달성가'];
  const semesterActivity = ['S1', 'S2', 'Su', 'S3', 'S4', 'S5', 'S6'];

  if (!overallProps) {
    return (
      <div className="w-full pt-6 pb-12">
        <div className="flex flex-col gap-6">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-foreground text-2xl font-bold">졸업요건 충족 현황</h2>
              <p className="text-muted-foreground text-sm">졸업요건 정보가 없습니다.</p>
            </div>
          </div>
          <Card className="hover:bg-secondary/10 transition-all hover:shadow-md">
            <CardContent className="p-6">
              <p className="text-muted-foreground">졸업요건 정보가 없습니다.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full pt-0 pb-8">
      <div className="mb-6 flex flex-col gap-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-foreground text-2xl font-bold">📋 졸업요건 충족 현황</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="flex flex-col gap-6">
            <Card className="hover:bg-secondary/10 transition-all hover:shadow-md">
              <CardContent className="flex flex-col items-center gap-4 p-6">
                <RingProgress
                  size={220}
                  thickness={16}
                  value={overallProps.totalPercentage}
                  color="#4f46e5"
                  label={
                    <div className="flex flex-col items-center gap-0">
                      <span className="text-foreground text-3xl leading-tight font-extrabold">
                        {overallProps.totalPercentage}%
                      </span>
                      <span className="text-muted-foreground text-sm font-medium">달성했네요!</span>
                    </div>
                  }
                />
                <div className="bg-secondary/50 rounded-full border px-3 py-1">
                  <span className="text-muted-foreground text-sm">
                    Total <span className="text-primary font-extrabold">{totalCreditsEarned}</span> /{' '}
                    {TOTAL_REQUIRED_CREDITS}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:bg-secondary/10 transition-all hover:shadow-md">
              <CardContent className="flex flex-col gap-2 p-6">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-xs font-bold tracking-wider uppercase">누적 GPA</span>
                  {gradeDelta !== null ? (
                    <div className="flex items-center gap-1">
                      <TrendingUp size={16} color={gradeDelta >= 0 ? '#2fb344' : '#f03e3e'} />
                      <span className={cn('text-sm font-bold', gradeDelta >= 0 ? 'text-green-600' : 'text-red-600')}>
                        {gradeDelta >= 0 ? '+' : ''}
                        {gradeDelta.toFixed(2)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">최근 변화 없음</span>
                  )}
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-foreground text-[28px] leading-none font-extrabold">
                    {overallAverageGrade != null ? overallAverageGrade.toFixed(2) : '-'}
                  </span>
                  <span className="text-muted-foreground text-sm font-semibold">/ 4.5</span>
                </div>
                <p className="text-muted-foreground text-xs">누적 평균 학점을 기준으로 계산했어요.</p>
              </CardContent>
            </Card>

            <Card className="hover:bg-secondary/10 transition-all hover:shadow-md">
              <CardContent className="flex flex-col gap-2 p-6">
                <span className="text-muted-foreground text-xs font-bold tracking-wider uppercase">내 정보</span>
                <InfoRow label="학번" value={parsed.studentId ?? '-'} />
                <InfoRow label="구분" value={standingLabel} />
                <InfoRow label="학기" value={semesterLabel} />
              </CardContent>
            </Card>
          </div>

          <Card className="hover:bg-secondary/10 flex h-fit flex-col transition-all hover:shadow-md">
            <CardContent className="flex flex-1 flex-col gap-4 p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-foreground text-lg font-bold">영역별 이수 현황</h3>
              </div>
              <ScrollArea className="h-[70vh] pr-2">
                <Accordion type="single" collapsible className="w-full">
                  {requirements.map((req) => (
                    <AccordionItem key={req.domain} value={req.domain}>
                      <AccordionTrigger className="hover:bg-muted/50 [&[data-state=open]]:bg-muted rounded-md px-3 py-2 transition-all">
                        <div className="flex w-full flex-col gap-2 text-left">
                          <div className="flex w-full items-center justify-between">
                            <div className="flex items-center gap-2">
                              {req.satisfied ? (
                                <CircleCheck size={20} className="text-green-600" />
                              ) : (
                                <AlertTriangle size={20} className="text-orange-500" />
                              )}
                              <span className="text-foreground font-bold">{req.domain}</span>
                            </div>
                            <span className="text-foreground/80 text-sm font-semibold">
                              {req.earned}/{req.required || '-'}
                            </span>
                          </div>
                          <div className="flex w-full flex-col gap-1">
                            <Progress value={req.percentage} className="h-2" />
                            <span className="text-muted-foreground text-xs">
                              {req.earned}학점 / {req.required || '-'}학점
                            </span>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-3 pt-4">
                        <div className="flex flex-col gap-4">
                          {!req.satisfied && req.messages.length > 0 && (
                            <div className="flex flex-col gap-1.5">
                              {req.messages.map((msg) => (
                                <div key={msg} className="flex items-start gap-2">
                                  <div className="mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-yellow-100 text-yellow-600">
                                    <AlertTriangle size={12} />
                                  </div>
                                  <span className="text-sm text-yellow-700">{msg}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground text-xs">이수 과목</span>
                              <Badge variant="secondary" className="text-xs font-normal">
                                {req.courses.length}
                              </Badge>
                            </div>
                            {req.courses.length > 0 ? (
                              <div className="flex flex-col gap-2">
                                <div className="text-muted-foreground grid grid-cols-[60px_1fr_90px_60px] gap-2 px-2 py-1 text-xs font-semibold">
                                  <span>코드</span>
                                  <span>과목명</span>
                                  <span>이수학기</span>
                                  <span>학점</span>
                                </div>
                                {req.courses.map((course, idx) => (
                                  <div
                                    key={`${course.courseCode}-${idx}`}
                                    className="hover:bg-muted/50 grid grid-cols-[60px_1fr_90px_60px] items-center gap-2 rounded-sm px-2 py-1.5"
                                  >
                                    <Badge
                                      variant="outline"
                                      className="text-muted-foreground h-fit w-fit px-1 py-0 text-[10px] font-normal"
                                    >
                                      {course.courseCode ?? '-'}
                                    </Badge>
                                    <span className="text-foreground truncate text-sm">{course.courseName ?? '-'}</span>
                                    <span className="text-muted-foreground text-xs">
                                      {course.year ?? '-'} {course.semester ?? '-'}
                                    </span>
                                    <span className="text-muted-foreground text-xs">{course.credit ?? 0}학점</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-muted-foreground text-sm">아직 등록된 과목이 없습니다.</p>
                            )}
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </ScrollArea>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-6">
            <Card className="hover:bg-secondary/10 transition-all hover:shadow-md">
              <CardContent className="flex flex-col gap-4 p-6">
                <h3 className="text-foreground text-lg font-bold">My Key Traits</h3>
                <ul className="space-y-2">
                  {traits.map((trait) => (
                    <li
                      key={trait}
                      className="bg-secondary text-secondary-foreground rounded-md px-3 py-2 text-sm font-medium"
                    >
                      {trait}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:bg-secondary/10 transition-all hover:shadow-md">
              <CardContent className="flex flex-col gap-4 p-6">
                <h3 className="text-foreground text-lg font-bold">학기 활동</h3>
                <div className="flex flex-wrap gap-2">
                  {semesterActivity.map((label) => (
                    <div
                      key={label}
                      className="bg-secondary/30 text-foreground min-w-[72px] rounded-md px-3 py-1.5 text-center text-sm font-semibold"
                    >
                      {label}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 last:pb-0">
      <span className="text-muted-foreground text-sm">{label}</span>
      <span className="text-foreground text-sm font-bold">{value}</span>
    </div>
  );
}
