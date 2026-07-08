// features/roadmap/CourseDetailSheet.tsx
import React, { useEffect, useState } from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Book, Clock, Building2, Calendar, Info, FileText } from 'lucide-react';
import type { CourseNodeData } from '@/features/roadmap/types';
import type { CourseDB } from '@/lib/const/course-db';
import { formatCourseTerm } from '@/features/course-catalog/offering-view';
import { MeetingBadge, OfferingGroupCard } from '@/features/course-catalog/components/OfferingGroupCard';

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

function formatHours(lectureHours?: number, labHours?: number, credits?: number): string {
  if (lectureHours === undefined || labHours === undefined || credits === undefined) return '-';
  return `${lectureHours}:${labHours}:${credits}`;
}

function getListingScheduleBadges(catalog: RoadmapCatalog, listing: RoadmapManualListing) {
  const matchingOfferingGroups = catalog.offeringGroups.filter((offeringGroup) =>
    offeringGroup.term.startsWith(String(listing.academicYear)) &&
    offeringGroup.courseCodes.includes(listing.courseCode));
  const seen = new Set<string>();

  return matchingOfferingGroups.flatMap((offeringGroup) =>
    offeringGroup.meetingBadges.flatMap((badge) => {
      const key = [offeringGroup.term, badge.day, badge.start, badge.end, badge.room ?? ''].join(':');
      if (seen.has(key)) return [];
      seen.add(key);

      return {
        key,
        label: badge.label,
        detail: badge.detail,
        room: badge.room,
        title: `${formatCourseTerm(offeringGroup.term)} · ${offeringGroup.section}분반 · ${offeringGroup.courseCodes.join('/')} · ${badge.title}`,
      };
    }),
  );
}

export function CourseDetailSheet({ course, open, onOpenChange, courses }: CourseDetailSheetProps) {
  const [courseDetails, setCourseDetails] = useState<CourseDB | null>(null);

  // Find course details from course database
  useEffect(() => {
    if (course && courses.length > 0) {
      const found = courses.find(
        (c) =>
          !!course.courseCode &&
          (c.primaryCourseCode === course.courseCode || c.aliasCodes?.includes(course.courseCode)),
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
  const departments = catalog?.departments.length ? catalog.departments.join(', ') : courseDetails?.departmentContext;
  const description = catalog?.description ?? courseDetails?.description;
  const aliasCodes = catalog?.aliasCodes.filter((code) => code !== course.courseCode) ?? [];
  const sortedManualListings = [...(catalog?.manualListings ?? [])].sort(
    (a, b) => b.academicYear - a.academicYear || a.courseCode.localeCompare(b.courseCode),
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[420px] overflow-y-auto sm:w-[640px]">
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
                  <div className="space-y-2">
                    {catalog.offeringGroups.map((offeringGroup) => (
                      <OfferingGroupCard
                        key={offeringGroup.offeringGroupId}
                        offeringGroup={offeringGroup}
                        tone="slate"
                        className="p-2 text-xs"
                      />
                    ))}
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
                  <div className="space-y-1.5">
                    {sortedManualListings.map((listing) => {
                      const scheduleBadges = getListingScheduleBadges(catalog, listing);

                      return (
                        <div key={listing.id} className="rounded-md bg-slate-50 px-2 py-1.5 text-xs">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <Badge variant="outline" className="text-[11px]">
                              {listing.academicYear}
                            </Badge>
                            <span className="font-mono text-gray-600">{listing.courseCode}</span>
                            <span className="text-gray-500">
                              {formatHours(listing.lectureHours, listing.labHours, listing.credits)}
                            </span>
                            {listing.page && <span className="text-gray-400">p.{listing.page}</span>}
                          </div>
                          {scheduleBadges.length > 0 && (
                            <div className="mt-1.5 flex flex-wrap gap-1">
                              {scheduleBadges.map((badge) => (
                                <MeetingBadge
                                  key={badge.key}
                                  badge={badge}
                                  tone="slate"
                                  className="text-[11px]"
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
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
