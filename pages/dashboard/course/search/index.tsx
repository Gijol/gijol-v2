import React, { useState, useMemo } from 'react';
import { NextSeo } from 'next-seo';
import { GetStaticProps } from 'next';
import { Input } from '@components/ui/input';
import { Badge } from '@components/ui/badge';
import { Button } from '@components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@components/ui/sheet';
import { ScrollArea } from '@components/ui/scroll-area';
import { Search, Book, Filter, Clock, FlaskConical, ChevronLeft, ChevronRight } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select';
import {
  type CourseDB,
  filterCourses,
  getDepartmentDisplayName,
  getUniqueDepartments,
  getCourseLevel,
} from '@const/course-db';

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

// 카테고리 필터 옵션
const CATEGORY_OPTIONS = [
  { value: 'all', label: '전체' },
  { value: 'mandatory', label: '필수/공통' },
  { value: 'humanities', label: '인문사회 (HS)' },
  { value: 'science', label: '기초과학 (GS)' },
  { value: 'major', label: '전공' },
];

const ITEMS_PER_PAGE = 24;

export default function CourseSearchPage() {
  const [courses, setCourses] = useState<CourseDB[]>([]);
  const [loading, setLoading] = useState(true);
  // State for Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [selectedSemesters, setSelectedSemesters] = useState<string[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedCredit, setSelectedCredit] = useState('all');

  const [selectedCourse, setSelectedCourse] = useState<CourseDB | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  React.useEffect(() => {
    fetch('/api/courses')
      .then((res) => res.json())
      .then((data) => {
        setCourses(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load courses', err);
        setLoading(false);
      });
  }, []);

  // Derived Data
  const uniqueDepartments = useMemo(() => getUniqueDepartments(courses), [courses]);

  // 검색 및 필터링된 과목
  const filteredCourses = useMemo(() => {
    let result = courses;

    // 1. 카테고리 필터 (기존 로직 유지)
    if (category !== 'all') {
      result = result.filter((c) => {
        const code = c.primaryCourseCode;
        switch (category) {
          case 'mandatory':
            return code.startsWith('UC') || code.startsWith('GS1');
          case 'humanities':
            return code.startsWith('HS');
          case 'science':
            return code.startsWith('GS') && !code.startsWith('GS1');
          case 'major':
            return ['EC', 'MA', 'MC', 'BS', 'EV', 'AI', 'PS', 'CH', 'MM', 'MD', 'SE', 'CT', 'FE'].some((p) =>
              code.startsWith(p),
            );
          default:
            return true;
        }
      });
    }

    // 2. 개설 학기 필터 (2025-1, 2025-2)
    if (selectedSemesters.length > 0) {
      result = result.filter((c) => {
        if (selectedSemesters.includes('2025-1') && c.offered2025_1) return true;
        if (selectedSemesters.includes('2025-2') && c.offered2025_2) return true;
        return false;
      });
    }

    // 3. 학과 필터 (Department Context)
    if (selectedDepartment !== 'all') {
      result = result.filter((c) => c.departmentContext && c.departmentContext === selectedDepartment);
    }

    // 4. 학년/단위 필터 (Level)
    if (selectedLevel !== 'all') {
      const targetLevel = parseInt(selectedLevel, 10);
      if (!isNaN(targetLevel)) {
        if (targetLevel === 5000) {
          // 기타/연구 (5000단위 이상 또는 0)
          result = result.filter((c) => {
            const level = getCourseLevel(c.primaryCourseCode);
            return level >= 5000 || level === 0;
          });
        } else {
          result = result.filter((c) => getCourseLevel(c.primaryCourseCode) === targetLevel);
        }
      }
    }

    // 5. 학점 필터 (Credit)
    if (selectedCredit !== 'all') {
      const targetCredit = parseInt(selectedCredit, 10);
      if (!isNaN(targetCredit)) {
        if (targetCredit >= 4) {
          result = result.filter((c) => c.creditHours >= 4);
        } else {
          result = result.filter((c) => c.creditHours === targetCredit);
        }
      }
    }

    // 6. 검색어 필터
    if (searchQuery.trim()) {
      result = filterCourses(result, searchQuery);
    }

    return result;
  }, [courses, searchQuery, category, selectedSemesters, selectedDepartment, selectedLevel, selectedCredit]);

  // 페이지네이션 계산
  const totalPages = Math.ceil(filteredCourses.length / ITEMS_PER_PAGE);
  const paginatedCourses = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredCourses.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredCourses, currentPage]);

  // 필터 조건 변경 시 첫 페이지로 리셋
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, category, selectedSemesters, selectedDepartment, selectedLevel, selectedCredit]);

  const handleCourseClick = (course: CourseDB) => {
    setSelectedCourse(course);
    setIsSheetOpen(true);
  };

  return (
    <div className="container mx-auto max-w-6xl px-4 pb-12">
      <NextSeo title="강의 검색" description="GIST 개설 강의를 검색하세요" noindex />
      {/* Header */}
      <div className="mt-8 mb-8">
        <h1 className="text-2xl font-bold text-gray-900">강의 검색</h1>
        <p className="mt-1 text-sm text-gray-500">
          {loading ? '데이터를 불러오는 중...' : `GIST 개설 강의 ${courses.length}개 중 검색`}
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="mb-6 space-y-4">
        {/* Row 1: Search Input */}
        <div className="relative">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="과목명, 과목코드, 학과로 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-white pl-10 shadow-none"
          />
        </div>

        {/* Row 2: Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* 1. Semester Toggle */}
          <div className="flex items-center gap-1 rounded-md border border-slate-200 bg-white p-1 shadow-none">
            <button
              onClick={() => {
                const newValue = selectedSemesters.includes('2025-1')
                  ? selectedSemesters.filter((s) => s !== '2025-1')
                  : [...selectedSemesters, '2025-1'];
                setSelectedSemesters(newValue);
              }}
              className={`rounded px-3 py-1.5 text-sm font-medium transition-colors ${
                selectedSemesters.includes('2025-1')
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              2025-1학기
            </button>
            <button
              onClick={() => {
                const newValue = selectedSemesters.includes('2025-2')
                  ? selectedSemesters.filter((s) => s !== '2025-2')
                  : [...selectedSemesters, '2025-2'];
                setSelectedSemesters(newValue);
              }}
              className={`rounded px-3 py-1.5 text-sm font-medium transition-colors ${
                selectedSemesters.includes('2025-2') ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              2025-2학기
            </button>
          </div>

          {/* 2. Department Select */}
          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <SelectTrigger className="w-[180px] bg-white shadow-none">
              <SelectValue placeholder="학과/부서" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체 학과</SelectItem>
              {uniqueDepartments.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {getDepartmentDisplayName(dept)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* 3. Level Select */}
          <Select value={selectedLevel} onValueChange={setSelectedLevel}>
            <SelectTrigger className="w-[120px] bg-white shadow-none">
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

          {/* 4. Credit Select */}
          <Select value={selectedCredit} onValueChange={setSelectedCredit}>
            <SelectTrigger className="w-[110px] bg-white shadow-none">
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

          {/* 5. Category Select (Moved here) */}
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-[140px] bg-white shadow-none">
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

          {/* Reset Filters Filter */}
          {(selectedSemesters.length > 0 ||
            selectedDepartment !== 'all' ||
            selectedLevel !== 'all' ||
            selectedCredit !== 'all' ||
            category !== 'all') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setCategory('all');
                setSelectedSemesters([]);
                setSelectedDepartment('all');
                setSelectedLevel('all');
                setSelectedCredit('all');
                setSearchQuery('');
              }}
              className="ml-auto text-gray-500 hover:text-gray-900"
            >
              초기화
            </Button>
          )}
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4 text-sm text-gray-500">
        검색 결과: <span className="font-medium text-gray-900">{filteredCourses.length}</span>개
      </div>

      {/* Course Grid - Card Style */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {paginatedCourses.map((course) => (
          <button
            key={course.courseUid}
            className="group relative rounded-xl border border-slate-300 bg-white p-5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-300 focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:outline-none"
            onClick={() => handleCourseClick(course)}
          >
            {/* Header: 과목코드 + 학점 */}
            <div className="mb-3 flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="font-mono text-sm font-bold text-gray-500">{course.primaryCourseCode}</p>
                <p className="mt-1 truncate text-lg font-bold text-gray-900">{course.displayTitleKo}</p>
              </div>
              <Badge
                variant="outline"
                className="shrink-0 rounded-full border-slate-300 px-2.5 py-1 text-xs font-semibold"
              >
                {course.creditHours}학점
              </Badge>
            </div>

            {/* 정보 테이블 */}
            <table className="mt-3 w-full text-sm">
              <tbody>
                {/* 개설 학기 행 */}
                <tr>
                  <td className="w-20 py-1.5 align-top text-xs font-medium text-gray-500">개설 학기</td>
                  <td className="py-1.5">
                    {course.offered2025_1 || course.offered2025_2 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {course.offered2025_1 && (
                          <Badge variant="outline" className="rounded-full border-slate-300 px-2 py-0.5 text-xs">
                            2025-1학기
                          </Badge>
                        )}
                        {course.offered2025_2 && (
                          <Badge variant="outline" className="rounded-full border-slate-300 px-2 py-0.5 text-xs">
                            2025-2학기
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">없음</span>
                    )}
                  </td>
                </tr>
                {/* 분류 행 */}
                <tr>
                  <td className="w-20 py-1.5 align-top text-xs font-medium text-gray-500">분류</td>
                  <td className="py-1.5">
                    {course.departmentContext ? (
                      <Badge
                        variant="secondary"
                        className={`rounded-full border-0 px-2 py-0.5 text-xs font-medium ${getDepartmentBadgeColor(course.departmentContext)}`}
                      >
                        {getDepartmentDisplayName(course.departmentContext)}
                      </Badge>
                    ) : (
                      <span className="text-xs text-gray-400">없음</span>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </button>
        ))}
      </div>

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
              ({(currentPage - 1) * ITEMS_PER_PAGE + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, filteredCourses.length)}{' '}
              / {filteredCourses.length})
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
      {!loading && filteredCourses.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Book className="h-12 w-12 text-gray-300" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">검색 결과가 없습니다</h3>
          <p className="mt-1 text-sm text-gray-500">다른 검색어나 카테고리를 시도해보세요</p>
        </div>
      )}

      {/* Course Detail Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:max-w-lg">
          {selectedCourse && (
            <>
              <SheetHeader className="space-y-3">
                <Badge variant="outline" className="w-fit text-sm">
                  {selectedCourse.creditHours}학점
                </Badge>
                <SheetTitle className="text-xl leading-tight">{selectedCourse.displayTitleKo}</SheetTitle>
                <SheetDescription className="text-sm">{selectedCourse.displayTitleEn}</SheetDescription>
              </SheetHeader>

              <ScrollArea className="mt-6 h-[calc(100vh-200px)]">
                <div className="space-y-6 pr-4">
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
                    {selectedCourse.participatingDepartments.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {selectedCourse.participatingDepartments.map((dept, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {getDepartmentDisplayName(dept)}
                          </Badge>
                        ))}
                      </div>
                    ) : selectedCourse.departmentContext ? (
                      <Badge variant="secondary" className="text-xs">
                        {getDepartmentDisplayName(selectedCourse.departmentContext)}
                      </Badge>
                    ) : (
                      <p className="text-sm text-gray-500">정보 없음</p>
                    )}
                  </div>

                  {/* 2025학년도 개설 여부 */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-gray-900">2025학년도 개설</h4>
                    <div className="flex gap-3">
                      <div
                        className={`rounded-lg px-3 py-2 text-sm ${
                          selectedCourse.offered2025_1 ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        1학기: {selectedCourse.offered2025_1 ? '개설' : '미개설'}
                      </div>
                      <div
                        className={`rounded-lg px-3 py-2 text-sm ${
                          selectedCourse.offered2025_2 ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        2학기: {selectedCourse.offered2025_2 ? '개설' : '미개설'}
                      </div>
                    </div>
                  </div>

                  {/* 태그 */}
                  {selectedCourse.tags.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-gray-900">태그</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedCourse.tags.map((tag, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 별칭 코드 */}
                  {selectedCourse.aliasCodes.length > 1 && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-gray-900">별칭 과목코드</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedCourse.aliasCodes.map((code, idx) => (
                          <Badge key={idx} variant="outline" className="font-mono text-xs">
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
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
