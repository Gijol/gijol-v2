import React, { useMemo } from 'react';
import {
  extractOverallStatus,
  getPercentage,
} from '@utils/graduation/grad-formatter';
import UploadEmptyState from '@components/graduation/upload-empty-state';
import {
  IconAlertTriangle,
  IconCircleCheck,
  IconTrendingUp,
} from '@tabler/icons-react';
import {
  buildCourseListWithPeriod,
  calcAverageGrade,
} from '@utils/course/analytics';
import { useGraduationStore } from '../../../lib/stores/useGraduationStore';
import { cn } from '@/lib/utils';
import { RingProgress } from '@components/ui/ring-progress';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@components/ui/accordion';
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

  const courseListWithPeriod = useMemo(
    () => buildCourseListWithPeriod(parsed),
    [parsed]
  );
  const overallAverageGrade = useMemo(
    () =>
      calcAverageGrade(
        courseListWithPeriod.flatMap((t) => t.userTakenCourseList ?? [])
      ),
    [courseListWithPeriod]
  );

  if (!parsed || !gradStatus) {
    return (
      <div className="w-full pt-6 pb-12">
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                Academic HUD
              </h2>
              <p className="text-sm text-muted-foreground">
                Track your graduation progress
              </p>
            </div>
          </div>
          <Card className="transition-all hover:bg-secondary/10 hover:shadow-md">
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

  const validTermGrades = courseListWithPeriod.filter(
    (t) => t.grade && t.grade > 0
  );

  const gradeDelta =
    validTermGrades.length >= 2
      ? validTermGrades[validTermGrades.length - 1].grade -
      validTermGrades[validTermGrades.length - 2].grade
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
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                졸업요건 충족 현황
              </h2>
              <p className="text-sm text-muted-foreground">
                졸업요건 정보가 없습니다.
              </p>
            </div>
          </div>
          <Card className="transition-all hover:bg-secondary/10 hover:shadow-md">
            <CardContent className="p-6">
              <p className="text-muted-foreground">
                졸업요건 정보가 없습니다.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full pt-0 pb-8">
      <div className="flex flex-col gap-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              📋 졸업요건 충족 현황
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="flex flex-col gap-6">
            <Card className="transition-all hover:bg-secondary/10 hover:shadow-md">
              <CardContent className="p-6 flex flex-col items-center gap-4">
                <RingProgress
                  size={220}
                  thickness={16}
                  value={overallProps.totalPercentage}
                  color="#4f46e5"
                  label={
                    <div className="flex flex-col items-center gap-0">
                      <span className="text-3xl font-extrabold leading-tight text-foreground">
                        {overallProps.totalPercentage}%
                      </span>
                      <span className="text-sm font-medium text-muted-foreground">
                        달성했네요!
                      </span>
                    </div>
                  }
                />
                <div className="rounded-full border bg-secondary/50 px-3 py-1">
                  <span className="text-sm text-muted-foreground">
                    Total{' '}
                    <span className="font-extrabold text-primary">
                      {totalCreditsEarned}
                    </span>{' '}
                    / {TOTAL_REQUIRED_CREDITS}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="transition-all hover:bg-secondary/10 hover:shadow-md">
              <CardContent className="p-6 flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    누적 GPA
                  </span>
                  {gradeDelta !== null ? (
                    <div className="flex items-center gap-1">
                      <IconTrendingUp
                        size={16}
                        color={gradeDelta >= 0 ? '#2fb344' : '#f03e3e'}
                      />
                      <span
                        className={cn(
                          "text-sm font-bold",
                          gradeDelta >= 0 ? "text-green-600" : "text-red-600"
                        )}
                      >
                        {gradeDelta >= 0 ? '+' : ''}
                        {gradeDelta.toFixed(2)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      최근 변화 없음
                    </span>
                  )}
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[28px] font-extrabold leading-none text-foreground">
                    {overallAverageGrade != null
                      ? overallAverageGrade.toFixed(2)
                      : '-'}
                  </span>
                  <span className="text-sm font-semibold text-muted-foreground">
                    / 4.5
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  누적 평균 학점을 기준으로 계산했어요.
                </p>
              </CardContent>
            </Card>

            <Card className="transition-all hover:bg-secondary/10 hover:shadow-md">
              <CardContent className="p-6 flex flex-col gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  내 정보
                </span>
                <InfoRow label="학번" value={parsed.studentId ?? '-'} />
                <InfoRow label="구분" value={standingLabel} />
                <InfoRow label="학기" value={semesterLabel} />
              </CardContent>
            </Card>
          </div>

          <Card className="flex flex-col h-fit transition-all hover:bg-secondary/10 hover:shadow-md">
            <CardContent className="p-6 flex-1 flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-foreground">
                  영역별 이수 현황
                </h3>
              </div>
              <ScrollArea className="h-[70vh] pr-2">
                <Accordion type="single" collapsible className="w-full">
                  {requirements.map((req) => (
                    <AccordionItem key={req.domain} value={req.domain}>
                      <AccordionTrigger className="hover:bg-muted/50 px-3 py-2 rounded-md transition-all [&[data-state=open]]:bg-muted">
                        <div className="flex flex-col gap-2 w-full text-left">
                          <div className="flex justify-between items-center w-full">
                            <div className="flex items-center gap-2">
                              {req.satisfied ? (
                                <IconCircleCheck size={20} className="text-green-600" />
                              ) : (
                                <IconAlertTriangle size={20} className="text-orange-500" />
                              )}
                              <span className="font-bold text-foreground">{req.domain}</span>
                            </div>
                            <span className="text-sm font-semibold text-foreground/80">
                              {req.earned}/{req.required || '-'}
                            </span>
                          </div>
                          <div className="flex flex-col gap-1 w-full">
                            <Progress value={req.percentage} className="h-2" />
                            <span className="text-xs text-muted-foreground">
                              {req.earned}학점 / {req.required || '-'}학점
                            </span>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pt-4 px-3">
                        <div className="flex flex-col gap-4">
                          {!req.satisfied && req.messages.length > 0 && (
                            <div className="flex flex-col gap-1.5">
                              {req.messages.map((msg) => (
                                <div key={msg} className="flex items-start gap-2">
                                  <div className="mt-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-yellow-100 text-yellow-600 shrink-0">
                                    <IconAlertTriangle size={12} />
                                  </div>
                                  <span className="text-sm text-yellow-700">
                                    {msg}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">
                                이수 과목
                              </span>
                              <Badge variant="secondary" className="text-xs font-normal">
                                {req.courses.length}
                              </Badge>
                            </div>
                            {req.courses.length > 0 ? (
                              <div className="flex flex-col gap-2">
                                <div className="grid grid-cols-[60px_1fr_90px_60px] gap-2 px-2 py-1 text-xs font-semibold text-muted-foreground">
                                  <span>코드</span>
                                  <span>과목명</span>
                                  <span>이수학기</span>
                                  <span>학점</span>
                                </div>
                                {req.courses.map((course, idx) => (
                                  <div
                                    key={`${course.courseCode}-${idx}`}
                                    className="grid grid-cols-[60px_1fr_90px_60px] items-center gap-2 px-2 py-1.5 rounded-sm hover:bg-muted/50"
                                  >
                                    <Badge variant="outline" className="text-[10px] px-1 py-0 h-fit w-fit font-normal text-muted-foreground">
                                      {course.courseCode ?? '-'}
                                    </Badge>
                                    <span className="text-sm text-foreground truncate">
                                      {course.courseName ?? '-'}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      {course.year ?? '-'} {course.semester ?? '-'}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      {course.credit ?? 0}학점
                                    </span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground">
                                아직 등록된 과목이 없습니다.
                              </p>
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
            <Card className="transition-all hover:bg-secondary/10 hover:shadow-md">
              <CardContent className="p-6 flex flex-col gap-4">
                <h3 className="text-lg font-bold text-foreground">
                  My Key Traits
                </h3>
                <ul className="space-y-2">
                  {traits.map((trait) => (
                    <li
                      key={trait}
                      className="px-3 py-2 rounded-md bg-secondary text-secondary-foreground font-medium text-sm"
                    >
                      {trait}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="transition-all hover:bg-secondary/10 hover:shadow-md">
              <CardContent className="p-6 flex flex-col gap-4">
                <h3 className="text-lg font-bold text-foreground">
                  학기 활동
                </h3>
                <div className="flex flex-wrap gap-2">
                  {semesterActivity.map((label) => (
                    <div
                      key={label}
                      className="rounded-md  bg-secondary/30 px-3 py-1.5 text-center text-sm font-semibold text-foreground min-w-[72px]"
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
    <div className="flex justify-between items-center py-2 last:pb-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-bold text-foreground">{value}</span>
    </div>
  )
}
