import React, { useState, useMemo } from 'react';
import { dashboardLayout } from '@/components/layouts/dashboard-runtime';
import { NextSeo } from 'next-seo';
import { DashboardPageShell, PageHeader } from '@/components/dashboard/page-shell';
import { Input } from '@components/ui/input';
import { Badge } from '@components/ui/badge';
import { Button } from '@components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from '@components/ui/sheet';
import { ScrollArea } from '@components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@components/ui/table';
import {
  Search,
  BookOpen,
  CalendarDays,
  Clock,
  FlaskConical,
  GraduationCap,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  X,
  SlidersHorizontal,
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select';
import { getDepartmentDisplayName, getVisibleDepartmentDisplayNames, normalizeAcademicOrgName } from '@const/course-db';
import { MultiSelect, type Option } from '@components/ui/multi-select';
import { Checkbox } from '@components/ui/checkbox';
import { useDebouncedValue } from '@/lib/hooks/useDebouncedValue';
import { useGraduationStore } from '@/lib/stores/useGraduationStore';
import type { CourseCatalogSearchItem } from '@features/course-catalog/search';
import type {
  CourseDiscoveryFacets,
  CourseDiscoveryListItem,
  CourseDiscoveryPage,
} from '@features/course-catalog/discovery';
import { formatCourseTerm } from '@features/course-catalog/offering-view';
import { MeetingBadge } from '@features/course-catalog/components/OfferingGroupCard';
import type { CourseCatalogRequirementFacet, CourseCatalogSourceKind } from '@features/course-catalog/types';

// 학과별 배지 색상
// 학과별 배지 스타일
function getDepartmentBadgeColor(department?: string) {
  if (!department) return 'bg-gray-100 text-gray-600 hover:bg-gray-200';
  if (department.includes('전기전자컴퓨터')) return 'bg-blue-50 text-blue-700 hover:bg-blue-100';
  if (department.includes('신소재')) return 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100';
  if (department.includes('기계')) return 'bg-orange-50 text-orange-700 hover:bg-orange-100';
  if (department.includes('생명')) return 'bg-pink-50 text-pink-700 hover:bg-pink-100';
  if (department.includes('환경')) return 'bg-green-50 text-green-700 hover:bg-green-100';
  if (department.includes('AI')) return 'bg-purple-50 text-purple-700 hover:bg-purple-100';
  if (department.includes('수리')) return 'bg-cyan-50 text-cyan-700 hover:bg-cyan-100';
  if (department.includes('물리')) return 'bg-amber-50 text-amber-700 hover:bg-amber-100';
  if (department.includes('화학')) return 'bg-rose-50 text-rose-700 hover:bg-rose-100';
  return 'bg-gray-100 text-gray-600 hover:bg-gray-200';
}

CourseSearchPage.getLayout = dashboardLayout;

// 카테고리 필터 옵션
const CATEGORY_OPTIONS = [
  { value: 'all', label: '전체' },
  { value: 'mandatory', label: '필수/공통' },
  { value: 'humanities', label: '인문사회 (HS)' },
  { value: 'science', label: '기초과학 (GS)' },
  { value: 'major', label: '전공' },
];

const FEATURE_OPTIONS: { value: CourseCatalogRequirementFacet['feature'] | 'all'; label: string }[] = [
  { value: 'all', label: '전체 활용' },
  { value: 'recommendation', label: '추천 후보 전체' },
  { value: 'minor', label: '부전공' },
  { value: 'roadmap', label: '로드맵' },
];

const SOURCE_OPTIONS: { value: CourseCatalogSourceKind | 'all'; label: string }[] = [
  { value: 'all', label: '전체 원천' },
  { value: 'course-db', label: '강의 DB' },
  { value: 'timetable-offering', label: '시간표' },
  { value: 'graduation-recommendation', label: '졸업 추천' },
  { value: 'minor-catalog', label: '부전공' },
  { value: 'roadmap-preset', label: '로드맵' },
  { value: 'manual', label: '학사편람' },
];

const ITEMS_PER_PAGE = 24;
const NUMBER_FORMAT = new Intl.NumberFormat('ko-KR');
const PILL_BADGE_CLASS = 'rounded-full px-2 py-0.5 text-xs font-medium';
const OUTLINE_PILL_BADGE_CLASS = `${PILL_BADGE_CLASS} border-slate-200 bg-white text-slate-600`;
const MONO_PILL_BADGE_CLASS = `${OUTLINE_PILL_BADGE_CLASS} font-mono`;

type ScheduleBadge = {
  key: string;
  label: string;
  detail?: string;
  room?: string | null;
  title: string;
};
type ManualListing = CourseCatalogSearchItem['manualListings'][number];
type OfferingGroup = CourseCatalogSearchItem['offeringGroups'][number];

function getCurrentAcademicYear(): number {
  return new Date().getFullYear();
}

function getTermYear(term: string): number | null {
  const match = term.match(/^(\d{4})/);
  if (!match) return null;

  const year = Number(match[1]);
  return Number.isFinite(year) ? year : null;
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

  return getTermYear(term) ?? 0;
}

function sortOfferingGroupsNewest(groups: readonly OfferingGroup[]): OfferingGroup[] {
  return [...groups].sort(
    (a, b) =>
      getTermSortValue(b.term) - getTermSortValue(a.term) ||
      a.section.localeCompare(b.section) ||
      a.courseCodes.join('/').localeCompare(b.courseCodes.join('/')),
  );
}

function getCurrentYearOfferingTerms(course: CourseDiscoveryListItem): string[] {
  const currentYear = getCurrentAcademicYear();
  return course.offeringTerms.filter((term) => getTermYear(term) === currentYear);
}

function getOfferingSummary(course: CourseDiscoveryListItem): {
  label: string;
  detail?: string;
  tone: 'offered' | 'past' | 'active' | 'unknown';
} {
  const currentYearOfferingTerms = getCurrentYearOfferingTerms(course);

  if (currentYearOfferingTerms.length > 0) {
    const terms = Array.from(new Set(currentYearOfferingTerms)).sort(
      (a, b) => getTermSortValue(b) - getTermSortValue(a),
    );
    const termLabel = terms.map(formatCourseTerm).join(', ');

    return {
      label: `${termLabel} 개설`,
      detail: `${currentYearOfferingTerms.length}개 학기`,
      tone: 'offered',
    };
  }

  if (course.offeringTerms.length > 0) {
    return { label: '과거 개설', tone: 'past' };
  }

  if (course.lifecycleStatus === 'active') {
    return { label: '시간표 분반 미확인', tone: 'active' };
  }

  return { label: '개설 정보 미확인', tone: 'unknown' };
}

function offeringToneClass(tone: ReturnType<typeof getOfferingSummary>['tone']): string {
  if (tone === 'offered') return 'border-emerald-200 bg-emerald-50 text-emerald-700';
  if (tone === 'past') return 'border-amber-200 bg-amber-50 text-amber-700';
  if (tone === 'active') return 'border-blue-200 bg-blue-50 text-blue-700';
  return 'border-slate-200 bg-slate-50 text-slate-500';
}

function getStudentVisibleTags(course: CourseCatalogSearchItem): string[] {
  const hiddenTags = new Set(['graduation-recommendation', 'MULTI_CODE', 'offered', '학사']);

  return Array.from(new Set(course.tags))
    .filter((tag) => !hiddenTags.has(tag))
    .map(normalizeAcademicOrgName)
    .filter((tag) => /[가-힣]/.test(tag));
}

function getStudentVisibleDepartments(course: Pick<CourseCatalogSearchItem, 'departments'>): string[] {
  return getVisibleDepartmentDisplayNames(course.departments).slice(0, 8);
}

function sortManualListings(listings: readonly ManualListing[]): ManualListing[] {
  return [...listings].sort((a, b) => b.academicYear - a.academicYear || a.courseCode.localeCompare(b.courseCode));
}

function formatHours(listing: ManualListing): string {
  if (listing.lectureHours === undefined || listing.labHours === undefined || listing.credits === undefined) {
    return '-';
  }

  return `${listing.lectureHours}:${listing.labHours}:${listing.credits}`;
}

function getListingScheduleBadges(course: CourseCatalogSearchItem, listing: ManualListing): ScheduleBadge[] {
  const matchingOfferingGroups = course.offeringGroups.filter(
    (offeringGroup) =>
      offeringGroup.term.startsWith(String(listing.academicYear)) &&
      offeringGroup.courseCodes.includes(listing.courseCode),
  );
  const seenMeetings = new Set<string>();
  const badges: ScheduleBadge[] = [];

  matchingOfferingGroups.forEach((offeringGroup) => {
    offeringGroup.meetingBadges.forEach((badge) => {
      const key = `${offeringGroup.term}:${badge.day}:${badge.start}:${badge.end}:${badge.room ?? ''}`;
      if (seenMeetings.has(key)) return;
      seenMeetings.add(key);

      badges.push({
        key,
        label: badge.label,
        detail: badge.detail,
        room: badge.room,
        title: `${formatCourseTerm(offeringGroup.term)} · ${offeringGroup.section}분반 · ${offeringGroup.courseCodes.join('/')} · ${badge.title}`,
      });
    });
  });

  return badges;
}

function scheduleGroupKey(badges: readonly ScheduleBadge[]): string {
  return badges
    .map((badge) => `${badge.label}:${badge.detail ?? ''}`)
    .sort()
    .join('|');
}

function groupManualListings(
  course: CourseCatalogSearchItem,
  listings: readonly ManualListing[],
): {
  key: string;
  academicYear: number;
  courseCodes: string[];
  listings: ManualListing[];
  hoursLabel: string;
  scheduleBadges: ScheduleBadge[];
}[] {
  const byKey = new Map<
    string,
    {
      key: string;
      academicYear: number;
      courseCodes: string[];
      listings: ManualListing[];
      hoursLabel: string;
      scheduleBadges: ScheduleBadge[];
    }
  >();

  sortManualListings(listings).forEach((listing) => {
    const hoursLabel = formatHours(listing);
    const scheduleBadges = getListingScheduleBadges(course, listing);
    const key = [listing.academicYear, hoursLabel, scheduleGroupKey(scheduleBadges)].join('::');
    const existing = byKey.get(key);

    if (existing) {
      byKey.set(key, {
        ...existing,
        courseCodes: Array.from(new Set([...existing.courseCodes, listing.courseCode])).sort(),
        listings: [...existing.listings, listing].sort((a, b) => a.courseCode.localeCompare(b.courseCode)),
      });
      return;
    }

    byKey.set(key, {
      key,
      academicYear: listing.academicYear,
      courseCodes: [listing.courseCode],
      listings: [listing],
      hoursLabel,
      scheduleBadges,
    });
  });

  return Array.from(byKey.values()).sort(
    (a, b) => b.academicYear - a.academicYear || a.courseCodes.join('/').localeCompare(b.courseCodes.join('/')),
  );
}

export default function CourseSearchPage() {
  const gradStatus = useGraduationStore((state) => state.gradStatus);
  const isRegeneratingOutcome = useGraduationStore((state) => state.isRegeneratingOutcome);
  const [courses, setCourses] = useState<CourseDiscoveryListItem[]>([]);
  const [facets, setFacets] = useState<CourseDiscoveryFacets>({ departments: [], terms: [] });
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  // State for Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [selectedTerms, setSelectedTerms] = useState<string[]>([]);
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedCredit, setSelectedCredit] = useState('all');
  const [selectedFeature, setSelectedFeature] = useState<CourseCatalogRequirementFacet['feature'] | 'all'>('all');
  const [selectedSource, setSelectedSource] = useState<CourseCatalogSourceKind | 'all'>('all');
  const [selectedProgram, setSelectedProgram] = useState<'all' | 'undergraduate' | 'graduate'>('all');

  // 새 필터 상태
  const [selectedParticipatingDepts, setSelectedParticipatingDepts] = useState<string[]>([]);
  const [showMOOCOnly, setShowMOOCOnly] = useState(false);
  const [showLabOnly, setShowLabOnly] = useState(false);
  const [showMyRecommendationsOnly, setShowMyRecommendationsOnly] = useState(false);

  const myRecommendationCourseCodes = useMemo(
    () =>
      Array.from(
        new Set(
          (gradStatus?.allRecommendations ?? gradStatus?.recommendations ?? []).map(({ courseCode }) => courseCode),
        ),
      ),
    [gradStatus],
  );

  // 디바운스된 검색어 (300ms)
  const debouncedSearchQuery = useDebouncedValue(searchQuery, 300);

  const [selectedCourseSummary, setSelectedCourseSummary] = useState<CourseDiscoveryListItem | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<CourseCatalogSearchItem | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const detailRequestId = React.useRef(0);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  React.useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({
      page: String(currentPage),
      pageSize: String(ITEMS_PER_PAGE),
    });

    if (debouncedSearchQuery) params.set('q', debouncedSearchQuery);
    if (showMyRecommendationsOnly) {
      const courseCodes =
        myRecommendationCourseCodes.length > 0 ? myRecommendationCourseCodes : ['__NO_PERSONAL_RECOMMENDATIONS__'];
      courseCodes.forEach((courseCode) => params.append('courseCode', courseCode));
    }
    if (category !== 'all') params.set('category', category);
    selectedTerms.forEach((term) => params.append('term', term));
    selectedParticipatingDepts.forEach((department) => params.append('department', department));
    if (selectedLevel !== 'all') params.set('level', selectedLevel === '5000' ? 'other' : selectedLevel);
    if (selectedCredit !== 'all') params.set('credit', selectedCredit === '4' ? '4+' : selectedCredit);
    if (selectedFeature !== 'all') params.set('feature', selectedFeature);
    if (selectedSource !== 'all') params.set('sourceKind', selectedSource);
    if (selectedProgram !== 'all') params.set('program', selectedProgram);
    if (showMOOCOnly) params.set('moocOnly', 'true');
    if (showLabOnly) params.set('labOnly', 'true');

    setLoading(true);
    fetch(`/api/courses/search?${params.toString()}`, { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error(`Course search failed: ${res.status}`);
        return (await res.json()) as CourseDiscoveryPage;
      })
      .then((data) => {
        setCourses(data.content);
        setFacets(data.facets);
        setTotalElements(data.totalElements);
        setTotalPages(data.totalPages);
        setLoading(false);
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        console.error('Failed to load courses', err);
        setLoading(false);
      });

    return () => controller.abort();
  }, [
    currentPage,
    debouncedSearchQuery,
    category,
    selectedTerms,
    selectedLevel,
    selectedCredit,
    selectedParticipatingDepts,
    showMOOCOnly,
    showLabOnly,
    selectedFeature,
    selectedSource,
    selectedProgram,
    showMyRecommendationsOnly,
    myRecommendationCourseCodes,
  ]);

  // Derived Data
  const participatingDeptOptions: Option[] = useMemo(() => {
    return facets.departments
      .filter((dept) => getVisibleDepartmentDisplayNames([dept]).length > 0)
      .map((dept) => ({ value: dept, label: normalizeAcademicOrgName(dept) }));
  }, [facets.departments]);
  const offeringTermOptions: Option[] = useMemo(
    () => facets.terms.map((term) => ({ value: term, label: formatCourseTerm(term) })),
    [facets.terms],
  );

  // 필터 조건 변경 시 첫 페이지로 리셋
  React.useEffect(() => {
    setCurrentPage(1);
  }, [
    debouncedSearchQuery,
    category,
    selectedTerms,
    selectedLevel,
    selectedCredit,
    selectedParticipatingDepts,
    showMOOCOnly,
    showLabOnly,
    selectedFeature,
    selectedSource,
    selectedProgram,
    showMyRecommendationsOnly,
  ]);

  const handleCourseClick = async (course: CourseDiscoveryListItem) => {
    const requestId = detailRequestId.current + 1;
    detailRequestId.current = requestId;
    setSelectedCourseSummary(course);
    setSelectedCourse(null);
    setDetailError(null);
    setDetailLoading(true);
    setIsSheetOpen(true);

    try {
      const response = await fetch(`/api/courses/detail?courseId=${encodeURIComponent(course.courseId)}`);
      if (!response.ok) throw new Error(`Course detail failed: ${response.status}`);
      const detail = (await response.json()) as CourseCatalogSearchItem;
      if (detailRequestId.current === requestId) setSelectedCourse(detail);
    } catch (error) {
      if (detailRequestId.current === requestId) {
        setDetailError(error instanceof Error ? error.message : '강의 상세 정보를 불러오지 못했습니다.');
      }
    } finally {
      if (detailRequestId.current === requestId) setDetailLoading(false);
    }
  };

  // 활성 필터 목록 생성
  const activeFilters = useMemo(() => {
    const filters: { key: string; label: string; onRemove: () => void }[] = [];

    selectedTerms.forEach((term) => {
      filters.push({
        key: `term-${term}`,
        label: `${formatCourseTerm(term)} 개설`,
        onRemove: () => setSelectedTerms((prev) => prev.filter((selectedTerm) => selectedTerm !== term)),
      });
    });

    if (selectedLevel !== 'all') {
      const levelLabels: Record<string, string> = {
        '1000': '1학년',
        '2000': '2학년',
        '3000': '3학년',
        '4000': '4학년',
        '5000': '기타/연구',
      };
      filters.push({
        key: 'level',
        label: levelLabels[selectedLevel] || selectedLevel,
        onRemove: () => setSelectedLevel('all'),
      });
    }

    if (selectedCredit !== 'all') {
      filters.push({
        key: 'credit',
        label: selectedCredit === '4' ? '4학점 이상' : `${selectedCredit}학점`,
        onRemove: () => setSelectedCredit('all'),
      });
    }

    if (category !== 'all') {
      const categoryLabels: Record<string, string> = {
        mandatory: '필수/공통',
        humanities: '인문사회',
        science: '기초과학',
        major: '전공',
      };
      filters.push({
        key: 'category',
        label: categoryLabels[category] || category,
        onRemove: () => setCategory('all'),
      });
    }

    if (selectedFeature !== 'all') {
      filters.push({
        key: 'feature',
        label: FEATURE_OPTIONS.find((option) => option.value === selectedFeature)?.label ?? selectedFeature,
        onRemove: () => setSelectedFeature('all'),
      });
    }

    if (showMyRecommendationsOnly) {
      filters.push({
        key: 'myRecommendations',
        label: '내 부족 영역 과목',
        onRemove: () => setShowMyRecommendationsOnly(false),
      });
    }

    if (selectedSource !== 'all') {
      filters.push({
        key: 'source',
        label: SOURCE_OPTIONS.find((option) => option.value === selectedSource)?.label ?? selectedSource,
        onRemove: () => setSelectedSource('all'),
      });
    }

    if (selectedProgram !== 'all') {
      filters.push({
        key: 'program',
        label: selectedProgram === 'graduate' ? '대학원 과정' : '학사 과정',
        onRemove: () => setSelectedProgram('all'),
      });
    }

    selectedParticipatingDepts.forEach((dept) => {
      filters.push({
        key: `participatingDept-${dept}`,
        label: normalizeAcademicOrgName(dept),
        onRemove: () => setSelectedParticipatingDepts((prev) => prev.filter((d) => d !== dept)),
      });
    });

    if (showMOOCOnly) {
      filters.push({
        key: 'mooc',
        label: 'MOOC',
        onRemove: () => setShowMOOCOnly(false),
      });
    }

    if (showLabOnly) {
      filters.push({
        key: 'lab',
        label: '실습 과목',
        onRemove: () => setShowLabOnly(false),
      });
    }

    return filters;
  }, [
    selectedTerms,
    selectedLevel,
    selectedCredit,
    category,
    selectedParticipatingDepts,
    showMOOCOnly,
    showLabOnly,
    selectedFeature,
    selectedSource,
    selectedProgram,
    showMyRecommendationsOnly,
  ]);

  const isInitialDiscovery = searchQuery.trim().length === 0 && activeFilters.length === 0;
  const latestOfferingTerm = useMemo(
    () => [...facets.terms].sort((a, b) => getTermSortValue(b) - getTermSortValue(a))[0],
    [facets.terms],
  );

  // 필터 초기화 함수
  const resetAllFilters = () => {
    setCategory('all');
    setSelectedTerms([]);
    setSelectedLevel('all');
    setSelectedCredit('all');
    setSelectedParticipatingDepts([]);
    setShowMOOCOnly(false);
    setShowLabOnly(false);
    setSelectedFeature('all');
    setSelectedSource('all');
    setSelectedProgram('all');
    setShowMyRecommendationsOnly(false);
  };

  const FilterControls = () => (
    <div className="space-y-6">
      {/* 1. 개설 학기 MultiSelect */}
      {facets.terms.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-900">개설 학기</label>
          <MultiSelect
            options={offeringTermOptions}
            selected={selectedTerms}
            onChange={setSelectedTerms}
            placeholder="개설 학기 선택…"
            className="min-h-10 bg-white shadow-none"
          />
        </div>
      )}

      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-900">개설 학과</label>
        <MultiSelect
          options={participatingDeptOptions}
          selected={selectedParticipatingDepts}
          onChange={setSelectedParticipatingDepts}
          placeholder="개설 학과 선택…"
          className="min-h-10 bg-white shadow-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-900">과정</label>
          <Select
            value={selectedProgram}
            onValueChange={(value) => setSelectedProgram(value as typeof selectedProgram)}
          >
            <SelectTrigger className="w-full bg-white shadow-none">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체 과정</SelectItem>
              <SelectItem value="undergraduate">학사</SelectItem>
              <SelectItem value="graduate">대학원</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-900">학년</label>
          <Select value={selectedLevel} onValueChange={setSelectedLevel}>
            <SelectTrigger className="w-full bg-white shadow-none">
              <SelectValue placeholder="학년" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체 학년</SelectItem>
              <SelectItem value="1000">1학년 (1000)</SelectItem>
              <SelectItem value="2000">2학년 (2000)</SelectItem>
              <SelectItem value="3000">3학년 (3000)</SelectItem>
              <SelectItem value="4000">4학년 (4000)</SelectItem>
              <SelectItem value="5000">기타/연구</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-900">학점</label>
          <Select value={selectedCredit} onValueChange={setSelectedCredit}>
            <SelectTrigger className="w-full bg-white shadow-none">
              <SelectValue placeholder="학점" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체 학점</SelectItem>
              <SelectItem value="1">1학점</SelectItem>
              <SelectItem value="2">2학점</SelectItem>
              <SelectItem value="3">3학점</SelectItem>
              <SelectItem value="4">4학점 이상</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-900">이수구분</label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full bg-white shadow-none">
            <SelectValue placeholder="이수구분" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORY_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-900">활용 범위</label>
          <Select
            value={selectedFeature}
            onValueChange={(value) => setSelectedFeature(value as typeof selectedFeature)}
          >
            <SelectTrigger className="w-full bg-white shadow-none">
              <SelectValue placeholder="활용 범위" />
            </SelectTrigger>
            <SelectContent>
              {FEATURE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-900">데이터 원천</label>
          <Select value={selectedSource} onValueChange={(value) => setSelectedSource(value as typeof selectedSource)}>
            <SelectTrigger className="w-full bg-white shadow-none">
              <SelectValue placeholder="원천" />
            </SelectTrigger>
            <SelectContent>
              {SOURCE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-semibold text-gray-900">과목 특성</p>
        <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2.5">
          <Checkbox
            id="mooc-filter"
            checked={showMOOCOnly}
            onCheckedChange={(checked) => setShowMOOCOnly(checked === true)}
          />
          <label htmlFor="mooc-filter" className="cursor-pointer text-sm font-medium text-gray-600">
            MOOC
          </label>
        </div>
        <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2.5">
          <Checkbox
            id="lab-filter"
            checked={showLabOnly}
            onCheckedChange={(checked) => setShowLabOnly(checked === true)}
          />
          <label htmlFor="lab-filter" className="cursor-pointer text-sm font-medium text-gray-600">
            실습 과목
          </label>
        </div>
      </div>
    </div>
  );

  return (
    <DashboardPageShell>
      <NextSeo title="강의 검색" description="GIST 개설 강의를 검색하세요" noindex />
      <PageHeader
        title="강의 검색"
        description={
          loading
            ? '강의 데이터를 불러오는 중…'
            : `${NUMBER_FORMAT.format(totalElements)}개 강의를 과목명, 코드와 학과로 탐색하세요.`
        }
      />

      {/* Search & Filter Bar */}
      <div className="mb-6 space-y-4">
        {/* Search Input + Filter Button */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search aria-hidden="true" className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              aria-label="과목명, 과목코드 또는 학과 검색"
              name="course-search"
              autoComplete="off"
              placeholder="과목명, 과목코드, 학과로 검색…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white pl-10 shadow-none"
            />
          </div>
          <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="relative shrink-0 gap-2 bg-white shadow-none">
                <SlidersHorizontal aria-hidden="true" className="h-4 w-4" />
                <span>필터</span>
                {activeFilters.length > 0 && (
                  <span className="flex min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 py-0.5 text-[10px] text-white">
                    {activeFilters.length}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="flex w-full flex-col p-0 sm:max-w-md">
              <SheetHeader className="border-b border-slate-200 px-6 py-5 pr-12">
                <SheetTitle>필터</SheetTitle>
                <SheetDescription>조건을 선택하면 검색 결과에 바로 반영됩니다.</SheetDescription>
              </SheetHeader>
              <ScrollArea className="min-h-0 flex-1">
                <div className="px-6 py-5">
                  <FilterControls />
                </div>
              </ScrollArea>
              <div className="flex gap-2 border-t border-slate-200 bg-white px-6 py-4">
                <Button variant="outline" className="flex-1" onClick={resetAllFilters}>
                  초기화
                </Button>
                <Button className="flex-1" onClick={() => setIsFilterOpen(false)}>
                  결과 보기 ({totalElements}개)
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Row 3: Active Filter Badges */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-gray-500">적용된 필터:</span>
            {activeFilters.map((filter) => (
              <Badge
                key={filter.key}
                variant="secondary"
                className="flex items-center gap-1 bg-blue-50 pr-1 text-blue-700 hover:bg-blue-100"
              >
                {filter.label}
                <button
                  onClick={filter.onRemove}
                  className="ml-0.5 rounded-full p-0.5 hover:bg-blue-200"
                  aria-label={`${filter.label} 필터 제거`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            <button
              onClick={resetAllFilters}
              className="text-xs text-gray-500 underline-offset-2 hover:text-gray-700 hover:underline"
            >
              모두 지우기
            </button>
          </div>
        )}
      </div>

      {isInitialDiscovery && (
        <section
          aria-labelledby="course-discovery-title"
          className="mb-8 rounded-2xl border border-slate-200 bg-slate-50/70 p-5 sm:p-6"
        >
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-wide text-blue-700">빠른 탐색</p>
            <h2 id="course-discovery-title" className="mt-1 text-xl font-bold text-balance text-slate-950">
              어떤 강의를 찾고 있나요?
            </h2>
            <p className="mt-2 text-sm leading-6 text-pretty text-slate-600">
              자주 찾는 조건으로 시작하거나 위 검색창에 과목명, 과목 코드 또는 학과를 입력하세요.
            </p>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <button
              type="button"
              onClick={() => {
                if (latestOfferingTerm) setSelectedTerms([latestOfferingTerm]);
                else setSelectedProgram('undergraduate');
              }}
              className="group min-w-0 touch-manipulation rounded-xl border border-slate-200 bg-white p-4 text-left transition-[background-color,border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50/40 hover:shadow-sm focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none active:translate-y-0 motion-reduce:transform-none motion-reduce:transition-none"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-700 group-hover:bg-blue-100">
                <CalendarDays aria-hidden="true" size={17} />
              </span>
              <span className="mt-3 block truncate text-sm font-semibold text-slate-950">
                {latestOfferingTerm ? `${formatCourseTerm(latestOfferingTerm)} 개설` : '학사 과정'}
              </span>
              <span className="mt-1 block text-xs leading-5 text-slate-500">
                {latestOfferingTerm ? '최근 개설 강의만 확인' : '학사 과정 강의부터 확인'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setCategory('major')}
              className="group min-w-0 touch-manipulation rounded-xl border border-slate-200 bg-white p-4 text-left transition-[background-color,border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-violet-300 hover:bg-violet-50/40 hover:shadow-sm focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:outline-none active:translate-y-0 motion-reduce:transform-none motion-reduce:transition-none"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 text-violet-700 group-hover:bg-violet-100">
                <GraduationCap aria-hidden="true" size={18} />
              </span>
              <span className="mt-3 block text-sm font-semibold text-slate-950">전공 강의</span>
              <span className="mt-1 block text-xs leading-5 text-slate-500">전공 영역 강의만 탐색</span>
            </button>

            <button
              type="button"
              onClick={() => setShowLabOnly(true)}
              className="group min-w-0 touch-manipulation rounded-xl border border-slate-200 bg-white p-4 text-left transition-[background-color,border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-50/40 hover:shadow-sm focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:outline-none active:translate-y-0 motion-reduce:transform-none motion-reduce:transition-none"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 group-hover:bg-emerald-100">
                <FlaskConical aria-hidden="true" size={17} />
              </span>
              <span className="mt-3 block text-sm font-semibold text-slate-950">실습 과목</span>
              <span className="mt-1 block text-xs leading-5 text-slate-500">실험·실습 시간이 있는 강의</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedFeature('all');
                setShowMyRecommendationsOnly(true);
              }}
              disabled={isRegeneratingOutcome || !gradStatus || myRecommendationCourseCodes.length === 0}
              className="group min-w-0 touch-manipulation rounded-xl border border-slate-200 bg-white p-4 text-left transition-[background-color,border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-amber-300 hover:bg-amber-50/40 hover:shadow-sm focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:outline-none active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:border-slate-200 disabled:hover:bg-white disabled:hover:shadow-none motion-reduce:transform-none motion-reduce:transition-none"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-700 group-hover:bg-amber-100">
                <Sparkles aria-hidden="true" size={17} />
              </span>
              <span className="mt-3 block text-sm font-semibold text-slate-950">내 부족 영역 과목</span>
              <span className="mt-1 block text-xs leading-5 text-slate-500">
                {isRegeneratingOutcome
                  ? '대시보드 추천을 계산하는 중'
                  : !gradStatus
                    ? '대시보드 분석 후 사용할 수 있어요'
                    : myRecommendationCourseCodes.length === 0
                      ? '현재 부족 영역 추천이 없어요'
                      : `${NUMBER_FORMAT.format(myRecommendationCourseCodes.length)}개 맞춤 후보 확인`}
              </span>
            </button>
          </div>
        </section>
      )}

      {/* Results Count */}
      <div className="mb-4 flex min-w-0 items-center justify-between gap-4" aria-live="polite">
        <h2 className="text-base font-semibold text-slate-950">{isInitialDiscovery ? '전체 강의' : '검색 결과'}</h2>
        <p className="shrink-0 text-sm text-gray-500 tabular-nums">
          {loading ? '불러오는 중…' : `${NUMBER_FORMAT.format(totalElements)}개`}
        </p>
      </div>

      {/* Course Grid - Card Style */}
      {loading && courses.length === 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" role="status" aria-live="polite">
          <span className="sr-only">강의 목록을 불러오는 중…</span>
          {Array.from({ length: 6 }, (_, index) => (
            <div
              key={index}
              className="h-44 animate-pulse rounded-xl border border-slate-200 bg-white p-5 motion-reduce:animate-none"
            >
              <div className="h-3 w-20 rounded bg-slate-200" />
              <div className="mt-3 h-5 w-2/3 rounded bg-slate-200" />
              <div className="mt-8 h-6 w-28 rounded-full bg-slate-100" />
              <div className="mt-4 flex gap-2">
                <div className="h-5 w-20 rounded-full bg-slate-100" />
                <div className="h-5 w-14 rounded-full bg-slate-100" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => {
            const offeringSummary = getOfferingSummary(course);
            const visibleAliasCodes = course.aliasCodes.filter((code) => code !== course.primaryCourseCode);
            const visibleDepartments = getStudentVisibleDepartments(course);

            return (
              <button
                key={course.courseId}
                className="group relative rounded-xl border border-slate-200 bg-white p-5 text-left transition-[background-color,border-color,box-shadow] duration-150 ease-[var(--ease-ui-out)] hover:border-blue-200 hover:bg-slate-50/50 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none"
                onClick={() => handleCourseClick(course)}
              >
                {/* Header: 과목코드 + 학점 */}
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-sm font-bold text-gray-500">{course.primaryCourseCode}</p>
                    <p className="mt-1 truncate text-lg font-bold text-gray-900">{course.displayTitleKo}</p>
                    {course.displayTitleEn && (
                      <p className="mt-0.5 truncate text-xs text-gray-500">{course.displayTitleEn}</p>
                    )}
                  </div>
                  <Badge
                    variant="outline"
                    className="shrink-0 rounded-full border-slate-300 px-2.5 py-1 text-xs font-semibold"
                  >
                    {course.creditHours}학점
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div>
                    <Badge
                      variant="outline"
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${offeringToneClass(offeringSummary.tone)}`}
                    >
                      {offeringSummary.label}
                    </Badge>
                    {offeringSummary.detail && <p className="mt-1 text-xs text-gray-500">{offeringSummary.detail}</p>}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {visibleDepartments[0] ? (
                      <Badge
                        variant="secondary"
                        className={`${PILL_BADGE_CLASS} border-0 ${getDepartmentBadgeColor(visibleDepartments[0])}`}
                      >
                        {getDepartmentDisplayName(visibleDepartments[0])}
                      </Badge>
                    ) : (
                      <span className="text-xs text-gray-400">학과 정보 없음</span>
                    )}
                    {course.labHours > 0 && (
                      <Badge variant="outline" className={OUTLINE_PILL_BADGE_CLASS}>
                        실습 {course.labHours}h
                      </Badge>
                    )}
                    {visibleAliasCodes.length > 0 && (
                      <Badge variant="outline" className={OUTLINE_PILL_BADGE_CLASS}>
                        별칭 {visibleAliasCodes.length}개
                      </Badge>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            이전
          </Button>
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium text-gray-900">{currentPage}</span>
            <span className="text-gray-400">/</span>
            <span className="text-gray-500">{totalPages}</span>
            <span className="ml-2 text-gray-400">
              ({(currentPage - 1) * ITEMS_PER_PAGE + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, totalElements)} /{' '}
              {totalElements})
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            다음
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!loading && totalElements === 0 && !isInitialDiscovery && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 px-6 py-16 text-center">
          <BookOpen aria-hidden="true" className="h-11 w-11 text-slate-300" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">검색 결과가 없습니다</h3>
          <p className="mt-1 max-w-sm text-sm leading-6 text-gray-500">
            검색어를 줄이거나 적용한 필터를 초기화한 뒤 다시 확인해 보세요.
          </p>
          <Button variant="outline" className="mt-5 bg-white" onClick={resetAllFilters}>
            필터 초기화
          </Button>
        </div>
      )}

      {/* Course Detail Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="flex h-full w-full flex-col overflow-hidden sm:w-[min(92vw,760px)] sm:max-w-none">
          {selectedCourseSummary && (
            <>
              <SheetHeader className="shrink-0 space-y-3">
                <Badge variant="outline" className="w-fit rounded-full px-2.5 py-1 text-sm font-semibold">
                  {selectedCourseSummary.creditHours}학점
                </Badge>
                <SheetTitle className="text-xl leading-tight">{selectedCourseSummary.displayTitleKo}</SheetTitle>
                <SheetDescription className="text-sm">{selectedCourseSummary.displayTitleEn}</SheetDescription>
              </SheetHeader>

              {detailLoading && (
                <div className="mt-6 rounded-lg bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                  강의 상세 정보를 불러오는 중입니다.
                </div>
              )}
              {detailError && (
                <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {detailError}
                </div>
              )}
              {selectedCourse && (
                <ScrollArea
                  className="mt-6 min-h-0 w-full max-w-full min-w-0 flex-1"
                  viewportClassName="[&>div]:!block [&>div]:!w-full [&>div]:!min-w-0"
                >
                  <div className="w-full max-w-full min-w-0 space-y-6 overflow-hidden pr-4">
                    {/* 기본 정보 */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-gray-900">기본 정보</h4>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="rounded-lg bg-gray-50 p-3">
                          <p className="text-xs text-gray-500">과목 코드</p>
                          <p className="mt-1 font-mono font-medium">{selectedCourse.primaryCourseCode}</p>
                        </div>
                        <div className="rounded-lg bg-gray-50 p-3">
                          <p className="text-xs text-gray-500">학점</p>
                          <p className="mt-1 font-medium">{selectedCourse.creditHours}학점</p>
                        </div>
                      </div>
                    </div>

                    {/* 시수 정보 */}
                    {(selectedCourse.lectureHours > 0 || selectedCourse.labHours > 0) && (
                      <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-gray-900">시수</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedCourse.lectureHours > 0 && (
                            <div className="flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-2 text-sm">
                              <Clock className="h-4 w-4 text-blue-500" />
                              <span className="text-blue-700">강의 {selectedCourse.lectureHours}시간</span>
                            </div>
                          )}
                          {selectedCourse.labHours > 0 && (
                            <div className="flex items-center gap-1.5 rounded-lg bg-green-50 px-3 py-2 text-sm">
                              <FlaskConical className="h-4 w-4 text-green-500" />
                              <span className="text-green-700">실험 {selectedCourse.labHours}시간</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* 개설 학과 */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-gray-900">개설 학과</h4>
                      {getStudentVisibleDepartments(selectedCourse).length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {getStudentVisibleDepartments(selectedCourse).map((dept, idx) => (
                            <Badge
                              key={idx}
                              variant="secondary"
                              className={`${PILL_BADGE_CLASS} border-0 ${getDepartmentBadgeColor(dept)}`}
                            >
                              {getDepartmentDisplayName(dept)}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">정보 없음</p>
                      )}
                    </div>

                    {/* 개설 정보 */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-gray-900">개설 정보</h4>
                      {selectedCourse.offeringGroups.some((offeringGroup) => offeringGroup.program === 'graduate') && (
                        <div className="rounded-lg border border-violet-100 bg-violet-50 px-3 py-2 text-xs leading-relaxed font-medium text-violet-700">
                          대학원 교과목은 학사 졸업(수료)학점에 포함할 수 있지만 평균평점 산출에서는 제외됩니다. (2026
                          학사편람 208쪽)
                        </div>
                      )}
                      {selectedCourse.offeringGroups.length > 0 ? (
                        <div className="w-full max-w-full min-w-0 overflow-x-auto overscroll-x-contain rounded-lg border border-slate-200">
                          <Table className="min-w-[980px]">
                            <TableHeader className="bg-slate-50 text-xs text-slate-500">
                              <TableRow>
                                <TableHead className="px-3">학기</TableHead>
                                <TableHead className="px-3">분반</TableHead>
                                <TableHead className="px-3">학수번호</TableHead>
                                <TableHead className="px-3">개설 학과</TableHead>
                                <TableHead className="px-3">과정</TableHead>
                                <TableHead className="px-3">담당교수</TableHead>
                                <TableHead className="px-3">정원</TableHead>
                                <TableHead className="px-3">시간/장소</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {sortOfferingGroupsNewest(selectedCourse.offeringGroups).map((offeringGroup) => (
                                <TableRow key={offeringGroup.offeringGroupId}>
                                  <TableCell className="px-3 font-medium text-slate-800">
                                    {formatCourseTerm(offeringGroup.term)}
                                  </TableCell>
                                  <TableCell className="px-3 text-slate-700">{offeringGroup.section || '-'}</TableCell>
                                  <TableCell className="px-3">
                                    <div className="flex flex-wrap gap-1.5">
                                      {offeringGroup.courseCodes.map((courseCode) => (
                                        <span
                                          key={courseCode}
                                          className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-slate-700"
                                        >
                                          {courseCode}
                                        </span>
                                      ))}
                                    </div>
                                  </TableCell>
                                  <TableCell className="px-3 text-xs text-slate-600">
                                    {getVisibleDepartmentDisplayNames(offeringGroup.departments).length > 0
                                      ? getVisibleDepartmentDisplayNames(offeringGroup.departments).join(', ')
                                      : '-'}
                                  </TableCell>
                                  <TableCell className="px-3">
                                    <Badge
                                      variant="outline"
                                      className={
                                        offeringGroup.program === 'graduate'
                                          ? 'border-violet-200 bg-violet-50 text-violet-700'
                                          : 'border-slate-200 bg-white text-slate-600'
                                      }
                                    >
                                      {offeringGroup.program === 'graduate'
                                        ? '대학원'
                                        : offeringGroup.program === 'undergraduate'
                                          ? '학사'
                                          : '미확인'}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="px-3 text-xs text-slate-600">
                                    {offeringGroup.instructors.join(', ') || '미정'}
                                  </TableCell>
                                  <TableCell className="px-3 text-xs font-bold">
                                    {offeringGroup.capacityStatus === 'pending' || offeringGroup.capacity === 0 ? (
                                      <span
                                        className="text-amber-600"
                                        title="현재 0명으로 게시되어 추후 변경될 수 있습니다."
                                      >
                                        미정
                                      </span>
                                    ) : (
                                      <span className="text-slate-700">{offeringGroup.capacity ?? '-'}명</span>
                                    )}
                                  </TableCell>
                                  <TableCell className="max-w-[360px] px-3">
                                    {offeringGroup.meetingBadges.length > 0 ? (
                                      <div className="flex flex-wrap gap-1.5">
                                        {offeringGroup.meetingBadges.map((badge) => (
                                          <MeetingBadge key={badge.key} badge={badge} tone="emerald" />
                                        ))}
                                      </div>
                                    ) : (
                                      <span className="text-xs text-slate-400">시간 미확인</span>
                                    )}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      ) : (
                        <div className="rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-600">
                          {selectedCourse.lifecycleStatus === 'active'
                            ? '강의 목록에는 등록되어 있지만, 현재 시간표 원천에서 확인된 분반은 없습니다.'
                            : '현재 확인된 개설 분반 정보가 없습니다.'}
                        </div>
                      )}
                    </div>

                    {/* 학사편람 수록 이력 */}
                    {selectedCourse.manualListings.length > 0 && (
                      <div className="space-y-3">
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900">학사편람 수록 이력</h4>
                          <p className="mt-1 text-xs text-gray-500">
                            연도별 학사편람 수록 정보입니다. 요일/시간은 확인된 시간표가 있는 경우에만 표시합니다.
                          </p>
                        </div>
                        <div className="w-full max-w-full min-w-0 overflow-x-auto overscroll-x-contain rounded-lg border border-slate-200">
                          <table className="min-w-[760px] text-sm">
                            <thead className="bg-slate-50 text-xs text-slate-500">
                              <tr>
                                <th className="px-3 py-2 text-left font-medium">연도</th>
                                <th className="px-3 py-2 text-left font-medium">학수번호</th>
                                <th className="px-3 py-2 text-left font-medium">강:실:학</th>
                                <th className="px-3 py-2 text-left font-medium">시간표</th>
                                <th className="px-3 py-2 text-left font-medium">쪽</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {groupManualListings(selectedCourse, selectedCourse.manualListings).map((group) => (
                                <tr key={group.key}>
                                  <td className="px-3 py-2 text-slate-800">{group.academicYear}</td>
                                  <td className="px-3 py-2">
                                    <div className="flex flex-wrap gap-1.5">
                                      {group.courseCodes.map((courseCode) => (
                                        <span
                                          key={courseCode}
                                          className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-slate-700"
                                        >
                                          {courseCode}
                                        </span>
                                      ))}
                                    </div>
                                  </td>
                                  <td className="px-3 py-2 text-slate-700">{group.hoursLabel}</td>
                                  <td className="max-w-[360px] px-3 py-2 text-xs text-slate-600">
                                    {group.scheduleBadges.length > 0 ? (
                                      <div className="flex flex-wrap gap-1.5">
                                        {group.scheduleBadges.map((schedule) => (
                                          <MeetingBadge key={schedule.key} badge={schedule} tone="sky" />
                                        ))}
                                      </div>
                                    ) : (
                                      '-'
                                    )}
                                  </td>
                                  <td className="px-3 py-2 text-xs text-slate-700">
                                    <div className="flex flex-col gap-1">
                                      {group.listings.map((listing) => (
                                        <span key={listing.id}>
                                          <span className="font-mono">{listing.courseCode}</span>
                                          {listing.page ? ` p.${listing.page}` : ' -'}
                                        </span>
                                      ))}
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* 태그 */}
                    {getStudentVisibleTags(selectedCourse).length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-gray-900">분류 태그</h4>
                        <div className="flex flex-wrap gap-2">
                          {getStudentVisibleTags(selectedCourse).map((tag, idx) => (
                            <Badge key={idx} variant="outline" className={OUTLINE_PILL_BADGE_CLASS}>
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 별칭 코드 */}
                    {selectedCourse.aliasCodes.filter((code) => code !== selectedCourse.primaryCourseCode).length >
                      0 && (
                      <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-gray-900">별칭 과목코드</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedCourse.aliasCodes
                            .filter((code) => code !== selectedCourse.primaryCourseCode)
                            .map((code, idx) => (
                              <Badge key={idx} variant="outline" className={MONO_PILL_BADGE_CLASS}>
                                {code}
                              </Badge>
                            ))}
                        </div>
                      </div>
                    )}

                    {/* 강의 설명 */}
                    {selectedCourse.description && (
                      <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-gray-900">강의 설명</h4>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap text-gray-600">
                          {selectedCourse.description}
                        </p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              )}
            </>
          )}
        </SheetContent>
      </Sheet>
    </DashboardPageShell>
  );
}
