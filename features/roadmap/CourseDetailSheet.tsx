// features/roadmap/CourseDetailSheet.tsx
import React, { useEffect, useState } from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Book, Clock, Building2, Calendar, Info, FileText } from 'lucide-react';
import type { CourseNodeData, RoadmapCourseMeeting } from '@/features/roadmap/types';
import type { CourseDB } from '@/lib/const/course-db';
import { getVisibleDepartmentDisplayNames, normalizeAcademicOrgName } from '@/lib/const/course-db';
import { formatCourseTerm } from '@/features/course-catalog/offering-view';
import { expandCourseCodeCandidates } from '@/features/course-catalog/normalize';

interface CourseDetailSheetProps {
  course: CourseNodeData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courses: CourseDB[]; // Course database for lookup
}

const categoryColors: Record<string, string> = {
  기초필수: 'bg-blue-100 text-blue-800',
  기초선택: 'bg-cyan-100 text-cyan-800',
  전공필수: 'bg-purple-100 text-purple-800',
  전공선택: 'bg-green-100 text-green-800',
  MOOC: 'bg-indigo-100 text-indigo-800',
  타전공1: 'bg-rose-100 text-rose-800',
  타전공2: 'bg-pink-100 text-pink-800',
  편성예정: 'bg-slate-100 text-slate-600',
};

type RoadmapCatalog = NonNullable<CourseNodeData['catalog']>;
type RoadmapManualListing = RoadmapCatalog['manualListings'][number];
type RoadmapOfferingGroup = RoadmapCatalog['offeringGroups'][number];
type ScheduleEntry = {
  key: string;
  day: RoadmapCourseMeeting['day'];
  start: string;
  end: string;
  room?: string | null;
};
type ScheduleSlotSummary = {
  key: string;
  dayLabel: string;
  timeLabel: string;
};
type ScheduleSummary = {
  slots: ScheduleSlotSummary[];
  roomLabels: string[];
};

const dayLabels: Record<RoadmapCourseMeeting['day'], string> = {
  MON: '월',
  TUE: '화',
  WED: '수',
  THU: '목',
  FRI: '금',
  SAT: '토',
  SUN: '일',
};

const dayOrder: Record<RoadmapCourseMeeting['day'], number> = {
  MON: 1,
  TUE: 2,
  WED: 3,
  THU: 4,
  FRI: 5,
  SAT: 6,
  SUN: 7,
};

function formatHours(lectureHours?: number, labHours?: number, credits?: number): string {
  if (lectureHours === undefined || labHours === undefined || credits === undefined) return '-';
  return `${lectureHours}:${labHours}:${credits}`;
}

function getTermSortValue(term: string): number {
  const numericSemesterMatch = term.match(/^(\d{4})-([12])$/);
  if (numericSemesterMatch) {
    return Number(numericSemesterMatch[1]) * 10 + Number(numericSemesterMatch[2]);
  }

  const namedSemesterMatch = term.match(/^(\d{4})-(spring|summer|fall|winter)$/);
  if (namedSemesterMatch) {
    const semesterOrder: Record<string, number> = {
      spring: 1,
      summer: 2,
      fall: 3,
      winter: 4,
    };
    return Number(namedSemesterMatch[1]) * 10 + semesterOrder[namedSemesterMatch[2]];
  }

  const year = Number(term.match(/^(\d{4})/)?.[1] ?? 0);
  return Number.isFinite(year) ? year : 0;
}

function sortOfferingGroupsNewest(groups: readonly RoadmapOfferingGroup[]): RoadmapOfferingGroup[] {
  return [...groups].sort(
    (a, b) =>
      getTermSortValue(b.term) - getTermSortValue(a.term) ||
      a.section.localeCompare(b.section) ||
      a.courseCodes.join('/').localeCompare(b.courseCodes.join('/')),
  );
}

function formatTimeRange(start: string, end: string): string {
  return `${start}~${end}`;
}

function getUniqueOrdered(values: readonly string[]): string[] {
  const seen = new Set<string>();
  const uniqueValues: string[] = [];

  values.forEach((value) => {
    if (seen.has(value)) return;
    seen.add(value);
    uniqueValues.push(value);
  });

  return uniqueValues;
}

function sortScheduleEntries(entries: readonly ScheduleEntry[]): ScheduleEntry[] {
  return [...entries].sort(
    (a, b) =>
      dayOrder[a.day] - dayOrder[b.day] ||
      a.start.localeCompare(b.start) ||
      a.end.localeCompare(b.end) ||
      (a.room ?? '').localeCompare(b.room ?? ''),
  );
}

function summarizeScheduleEntries(entries: readonly ScheduleEntry[]): ScheduleSummary {
  const sortedEntries = sortScheduleEntries(entries);
  const slots: ScheduleSlotSummary[] = [];
  const seenSlots = new Set<string>();

  sortedEntries.forEach((entry) => {
    const slotKey = [entry.day, entry.start, entry.end].join(':');
    if (seenSlots.has(slotKey)) return;

    seenSlots.add(slotKey);
    slots.push({
      key: slotKey,
      dayLabel: dayLabels[entry.day],
      timeLabel: formatTimeRange(entry.start, entry.end),
    });
  });

  return {
    slots,
    roomLabels: getUniqueOrdered(
      sortedEntries.map((entry) => entry.room?.trim() ?? '').filter((room): room is string => room.length > 0),
    ),
  };
}

function getOfferingGroupScheduleEntries(offeringGroup: RoadmapOfferingGroup): ScheduleEntry[] {
  return offeringGroup.meetingBadges.map((badge) => ({
    key: badge.key,
    day: badge.day,
    start: badge.start,
    end: badge.end,
    room: badge.room,
  }));
}

function getListingScheduleEntries(catalog: RoadmapCatalog, listing: RoadmapManualListing): ScheduleEntry[] {
  const listingCodeCandidates = expandCourseCodeCandidates(listing.courseCode);
  const matchingOfferingGroups = catalog.offeringGroups.filter(
    (offeringGroup) =>
      offeringGroup.term.startsWith(String(listing.academicYear)) &&
      offeringGroup.courseCodes.some((courseCode) =>
        expandCourseCodeCandidates(courseCode).some((candidate) => listingCodeCandidates.includes(candidate)),
      ),
  );
  const seen = new Set<string>();

  return matchingOfferingGroups.flatMap((offeringGroup) =>
    offeringGroup.meetingBadges.flatMap((badge) => {
      const key = [offeringGroup.term, badge.day, badge.start, badge.end, badge.room ?? ''].join(':');
      if (seen.has(key)) return [];
      seen.add(key);

      return {
        key,
        day: badge.day,
        start: badge.start,
        end: badge.end,
        room: badge.room,
      };
    }),
  );
}

function formatDepartmentNames(departments: readonly string[]): string {
  const departmentNames = getVisibleDepartmentDisplayNames(departments);
  return departmentNames.length > 0 ? departmentNames.join(', ') : '-';
}

function ScheduleValueList({
  values,
  emptyLabel = '-',
  nowrap = false,
}: {
  values: readonly string[];
  emptyLabel?: string;
  nowrap?: boolean;
}) {
  if (values.length === 0) {
    return <span className="text-xs text-slate-400">{emptyLabel}</span>;
  }

  return (
    <div className="space-y-1">
      {values.map((value, index) => (
        <div
          key={`${value}-${index}`}
          className={['text-xs leading-5 text-slate-700', nowrap ? 'whitespace-nowrap' : ''].join(' ').trim()}
        >
          {value}
        </div>
      ))}
    </div>
  );
}

function CourseCodeList({ courseCodes }: { courseCodes: readonly string[] }) {
  if (courseCodes.length === 0) {
    return <span className="text-xs text-slate-400">-</span>;
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {courseCodes.map((courseCode) => (
        <span key={courseCode} className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-slate-700">
          {courseCode}
        </span>
      ))}
    </div>
  );
}

function MobileScheduleSummary({ summary }: { summary: ScheduleSummary }) {
  return (
    <div className="mt-3 space-y-3">
      <div className="grid grid-cols-[56px_1fr] gap-x-3 text-sm">
        <div className="text-xs font-medium text-slate-500">시간</div>
        <div className="rounded-md bg-slate-50 px-2.5 py-2">
          <div className="grid grid-cols-[40px_1fr] gap-x-3 border-b border-slate-200 pb-1 text-[11px] font-medium text-slate-500">
            <span>요일</span>
            <span>시간대</span>
          </div>
          {summary.slots.length > 0 ? (
            <div className="mt-1 space-y-1">
              {summary.slots.map((slot) => (
                <div key={slot.key} className="grid grid-cols-[40px_1fr] gap-x-3 text-xs leading-5 text-slate-700">
                  <span>{slot.dayLabel}</span>
                  <span className="whitespace-nowrap">{slot.timeLabel}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="pt-1 text-xs text-slate-400">시간 미확인</div>
          )}
        </div>
      </div>
      <dl className="grid grid-cols-[56px_1fr] gap-x-3 text-sm">
        <dt className="text-xs font-medium text-slate-500">장소</dt>
        <dd>
          <ScheduleValueList values={summary.roomLabels} emptyLabel="장소 미확인" />
        </dd>
      </dl>
    </div>
  );
}

export function CourseDetailSheet({ course, open, onOpenChange, courses }: CourseDetailSheetProps) {
  const [courseDetails, setCourseDetails] = useState<CourseDB | null>(null);

  // Find course details from course database
  useEffect(() => {
    if (course && courses.length > 0) {
      const courseCodeCandidates = expandCourseCodeCandidates(course.courseCode);
      const found = courses.find(
        (c) =>
          courseCodeCandidates.includes(c.primaryCourseCode) ||
          c.aliasCodes?.some((aliasCode) => courseCodeCandidates.includes(aliasCode)),
      );
      setCourseDetails(found || null);
    } else {
      setCourseDetails(null);
    }
  }, [course, courses]);

  if (!course) return null;

  const categoryStyle = categoryColors[course.category] || 'bg-gray-100 text-gray-800';
  const catalog = course.catalog;
  const creditHours = catalog?.creditHours ?? courseDetails?.creditHours ?? course.credits;
  const lectureHours = catalog?.lectureHours ?? courseDetails?.lectureHours;
  const labHours = catalog?.labHours ?? courseDetails?.labHours;
  const displayTitleEn = catalog?.displayTitleEn ?? courseDetails?.displayTitleEn;
  const departments = catalog?.departments.length
    ? getVisibleDepartmentDisplayNames(catalog.departments).join(', ')
    : courseDetails?.departmentContext
      ? normalizeAcademicOrgName(courseDetails.departmentContext)
      : undefined;
  const description = catalog?.description ?? courseDetails?.description;
  const aliasCodes = catalog?.aliasCodes.filter((code) => code !== course.courseCode) ?? [];
  const sortedManualListings = [...(catalog?.manualListings ?? [])].sort(
    (a, b) => b.academicYear - a.academicYear || a.courseCode.localeCompare(b.courseCode),
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full max-w-full overflow-y-auto sm:w-[min(96vw,1040px)] sm:max-w-none">
        <SheetHeader>
          <div className="flex items-center gap-2">
            <Badge className={categoryStyle}>{course.category}</Badge>
            <Badge variant="outline">{creditHours}학점</Badge>
          </div>
          <SheetTitle className="text-xl">{course.label}</SheetTitle>
          <SheetDescription className="flex flex-wrap gap-2 font-mono text-sm">
            <span>{course.courseCode}</span>
            {catalog && catalog.primaryCourseCode !== course.courseCode && (
              <span className="text-gray-400">대표 {catalog.primaryCourseCode}</span>
            )}
          </SheetDescription>
        </SheetHeader>

        <Separator className="my-4" />

        <div className="space-y-4">
          {/* Semester Info */}
          <div className="flex items-center gap-3 text-sm">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600">권장 이수학기:</span>
            <span className="font-medium">{course.semester}</span>
          </div>

          {aliasCodes.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="text-gray-600">동일/인정 코드:</span>
              {aliasCodes.map((aliasCode) => (
                <Badge key={aliasCode} variant="secondary" className="font-mono text-xs">
                  {aliasCode}
                </Badge>
              ))}
            </div>
          )}

          {/* Catalog-backed Details */}
          {catalog || courseDetails ? (
            <>
              {/* English Title */}
              {displayTitleEn && (
                <div className="flex items-start gap-3 text-sm">
                  <Book className="mt-0.5 h-4 w-4 text-gray-400" />
                  <div>
                    <span className="text-gray-600">English:</span>
                    <p className="font-medium">{displayTitleEn}</p>
                  </div>
                </div>
              )}

              {/* Department */}
              {departments && (
                <div className="flex items-start gap-3 text-sm">
                  <Building2 className="mt-0.5 h-4 w-4 text-gray-400" />
                  <div>
                    <span className="text-gray-600">개설학과:</span>
                    <p className="font-medium">{departments}</p>
                  </div>
                </div>
              )}

              {/* Hours */}
              {lectureHours !== undefined && labHours !== undefined && (
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">강:실:학:</span>
                  <span className="font-medium">{formatHours(lectureHours, labHours, creditHours)}</span>
                </div>
              )}

              {/* Offerings */}
              {catalog && catalog.offeringGroups.length > 0 && (
                <div className="space-y-2 rounded-md border border-slate-200 p-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>확인된 시간표</span>
                  </div>
                  <div className="space-y-2 md:hidden">
                    {sortOfferingGroupsNewest(catalog.offeringGroups).map((offeringGroup) => {
                      const scheduleSummary = summarizeScheduleEntries(getOfferingGroupScheduleEntries(offeringGroup));

                      return (
                        <div
                          key={offeringGroup.offeringGroupId}
                          className="rounded-md border border-slate-200 bg-white p-3"
                        >
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {formatCourseTerm(offeringGroup.term)}
                            </Badge>
                            <span className="text-xs font-medium text-slate-700">
                              {offeringGroup.section ? `${offeringGroup.section}분반` : '분반 미확인'}
                            </span>
                          </div>
                          <div className="mt-2">
                            <CourseCodeList courseCodes={offeringGroup.courseCodes} />
                          </div>
                          <p className="mt-2 text-xs leading-relaxed text-slate-500">
                            {formatDepartmentNames(offeringGroup.departments)}
                          </p>
                          <MobileScheduleSummary summary={scheduleSummary} />
                        </div>
                      );
                    })}
                  </div>
                  <div className="hidden overflow-hidden rounded-md border border-slate-200 md:block">
                    <Table className="min-w-[900px]">
                      <TableHeader className="bg-slate-50 text-xs text-slate-500">
                        <TableRow>
                          <TableHead className="px-3">학기</TableHead>
                          <TableHead className="px-3">분반</TableHead>
                          <TableHead className="px-3">학수번호</TableHead>
                          <TableHead className="px-3">개설 학과</TableHead>
                          <TableHead className="px-3">요일</TableHead>
                          <TableHead className="px-3">시간대</TableHead>
                          <TableHead className="px-3">장소</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sortOfferingGroupsNewest(catalog.offeringGroups).map((offeringGroup) => {
                          const scheduleSummary = summarizeScheduleEntries(
                            getOfferingGroupScheduleEntries(offeringGroup),
                          );

                          return (
                            <TableRow key={offeringGroup.offeringGroupId}>
                              <TableCell className="px-3 font-medium text-slate-800">
                                {formatCourseTerm(offeringGroup.term)}
                              </TableCell>
                              <TableCell className="px-3 text-slate-700">{offeringGroup.section || '-'}</TableCell>
                              <TableCell className="px-3">
                                <CourseCodeList courseCodes={offeringGroup.courseCodes} />
                              </TableCell>
                              <TableCell className="px-3 text-xs text-slate-600">
                                {formatDepartmentNames(offeringGroup.departments)}
                              </TableCell>
                              <TableCell className="px-3 align-top">
                                <ScheduleValueList values={scheduleSummary.slots.map((slot) => slot.dayLabel)} />
                              </TableCell>
                              <TableCell className="px-3 align-top">
                                <ScheduleValueList
                                  values={scheduleSummary.slots.map((slot) => slot.timeLabel)}
                                  nowrap
                                />
                              </TableCell>
                              <TableCell className="max-w-[220px] px-3 align-top">
                                <ScheduleValueList values={scheduleSummary.roomLabels} emptyLabel="장소 미확인" />
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {/* Manual Listings */}
              {catalog && sortedManualListings.length > 0 && (
                <div className="space-y-2 rounded-md border border-slate-200 p-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FileText className="h-4 w-4" />
                    <span>학사편람 수록 이력</span>
                  </div>
                  <div className="space-y-2 md:hidden">
                    {sortedManualListings.map((listing) => {
                      const scheduleSummary = summarizeScheduleEntries(getListingScheduleEntries(catalog, listing));

                      return (
                        <div key={listing.id} className="rounded-md border border-slate-200 bg-white p-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {listing.academicYear}
                            </Badge>
                            <span className="font-mono text-xs text-slate-700">{listing.courseCode}</span>
                          </div>
                          <dl className="mt-3 grid grid-cols-[56px_1fr] gap-x-3 gap-y-2 text-sm">
                            <dt className="text-xs font-medium text-slate-500">강:실:학</dt>
                            <dd className="text-xs text-slate-700">
                              {formatHours(listing.lectureHours, listing.labHours, listing.credits)}
                            </dd>
                            <dt className="text-xs font-medium text-slate-500">쪽</dt>
                            <dd className="text-xs text-slate-700">{listing.page ? `p.${listing.page}` : '-'}</dd>
                          </dl>
                          <MobileScheduleSummary summary={scheduleSummary} />
                        </div>
                      );
                    })}
                  </div>
                  <div className="hidden overflow-hidden rounded-md border border-slate-200 md:block">
                    <Table className="min-w-[860px]">
                      <TableHeader className="bg-slate-50 text-xs text-slate-500">
                        <TableRow>
                          <TableHead className="px-3">연도</TableHead>
                          <TableHead className="px-3">학수번호</TableHead>
                          <TableHead className="px-3">강:실:학</TableHead>
                          <TableHead className="px-3">요일</TableHead>
                          <TableHead className="px-3">시간대</TableHead>
                          <TableHead className="px-3">장소</TableHead>
                          <TableHead className="px-3">쪽</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sortedManualListings.map((listing) => {
                          const scheduleSummary = summarizeScheduleEntries(getListingScheduleEntries(catalog, listing));

                          return (
                            <TableRow key={listing.id}>
                              <TableCell className="px-3 font-medium text-slate-800">{listing.academicYear}</TableCell>
                              <TableCell className="px-3 font-mono text-xs text-slate-700">
                                {listing.courseCode}
                              </TableCell>
                              <TableCell className="px-3 text-slate-700">
                                {formatHours(listing.lectureHours, listing.labHours, listing.credits)}
                              </TableCell>
                              <TableCell className="px-3 align-top">
                                <ScheduleValueList values={scheduleSummary.slots.map((slot) => slot.dayLabel)} />
                              </TableCell>
                              <TableCell className="px-3 align-top">
                                <ScheduleValueList
                                  values={scheduleSummary.slots.map((slot) => slot.timeLabel)}
                                  nowrap
                                />
                              </TableCell>
                              <TableCell className="max-w-[220px] px-3 align-top">
                                <ScheduleValueList values={scheduleSummary.roomLabels} />
                              </TableCell>
                              <TableCell className="px-3 text-xs text-slate-700">
                                {listing.page ? `p.${listing.page}` : '-'}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {/* Legacy fallback opening info */}
              {!catalog && courseDetails && (
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">시간:</span>
                  <span className="font-medium">
                    강의 {courseDetails.lectureHours}시간
                    {courseDetails.labHours > 0 && `, 실습 ${courseDetails.labHours}시간`}
                  </span>
                </div>
              )}

              {/* Description */}
              {description && (
                <div className="mt-4 rounded-lg bg-slate-50 p-3">
                  <div className="mb-2 flex items-center gap-2 text-sm text-gray-600">
                    <Info className="h-4 w-4" />
                    <span>과목 설명</span>
                  </div>
                  <p className="text-sm leading-relaxed text-gray-700">{description}</p>
                </div>
              )}
            </>
          ) : (
            <div className="mt-4 rounded-lg bg-slate-50 p-4 text-center text-sm text-gray-500">
              상세 정보를 찾을 수 없습니다.
              <br />
              <span className="text-xs text-gray-400">과목 코드: {course.courseCode}</span>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
