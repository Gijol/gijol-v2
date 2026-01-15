import React, { useState, useMemo } from 'react';
import { Input } from '@components/ui/input';
import { Badge } from '@components/ui/badge';
import { Card, CardContent } from '@components/ui/card';
import { IconSearch, IconBook, IconFilter } from '@tabler/icons-react';
import { getAllCourses, type CourseMaster } from '@const/course-master';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select';

// 과목 레벨 표시용 헬퍼
function getLevelBadge(level: number) {
  if (level === 0)
    return (
      <Badge variant="secondary" className="text-xs">
        필수
      </Badge>
    );
  if (level >= 4000) return <Badge className="bg-purple-100 text-xs text-purple-700">4000단위</Badge>;
  if (level >= 3000) return <Badge className="bg-indigo-100 text-xs text-indigo-700">3000단위</Badge>;
  if (level >= 2000) return <Badge className="bg-blue-100 text-xs text-blue-700">2000단위</Badge>;
  return <Badge className="bg-green-100 text-xs text-green-700">1000단위</Badge>;
}

// 학과별 색상
function getDepartmentColor(department?: string) {
  if (!department) return 'bg-gray-50 border-gray-200';
  if (department.includes('전기전자컴퓨터')) return 'bg-blue-50/50 border-blue-200';
  if (department.includes('신소재')) return 'bg-emerald-50/50 border-emerald-200';
  if (department.includes('기계')) return 'bg-orange-50/50 border-orange-200';
  if (department.includes('생명')) return 'bg-pink-50/50 border-pink-200';
  if (department.includes('환경')) return 'bg-green-50/50 border-green-200';
  if (department.includes('AI')) return 'bg-purple-50/50 border-purple-200';
  return 'bg-gray-50 border-gray-200';
}

// 카테고리 필터 옵션
const CATEGORY_OPTIONS = [
  { value: 'all', label: '전체' },
  { value: 'mandatory', label: '필수/공통' },
  { value: 'humanities', label: '인문사회 (HUS/PPE)' },
  { value: 'science', label: '기초과학' },
  { value: 'major', label: '전공' },
];

export default function CourseSearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('all');

  // 전체 과목 데이터
  const allCourses = useMemo(() => getAllCourses(), []);

  // 검색 및 필터링된 과목
  const filteredCourses = useMemo(() => {
    let courses = allCourses;

    // 카테고리 필터
    if (category !== 'all') {
      courses = courses.filter((c) => {
        const code = c.courseCode;
        switch (category) {
          case 'mandatory':
            return code.startsWith('UC') || code.startsWith('GS1');
          case 'humanities':
            return code.startsWith('HS');
          case 'science':
            return code.startsWith('GS') && !code.startsWith('GS1');
          case 'major':
            return ['EC', 'MA', 'MC', 'BS', 'EV', 'AI', 'PH', 'CH'].some((p) => code.startsWith(p));
          default:
            return true;
        }
      });
    }

    // 검색어 필터
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      courses = courses.filter(
        (c) =>
          c.courseNameKo.toLowerCase().includes(query) ||
          c.courseCode.toLowerCase().includes(query) ||
          (c.department && c.department.toLowerCase().includes(query)),
      );
    }

    return courses;
  }, [allCourses, searchQuery, category]);

  return (
    <div className="container mx-auto max-w-6xl px-4 pb-12">
      {/* Header */}
      <div className="mt-8 mb-8">
        <h1 className="text-2xl font-bold text-gray-900">강의 검색</h1>
        <p className="mt-1 text-sm text-gray-500">GIST 개설 강의 {allCourses.length}개 중 검색</p>
      </div>

      {/* Search & Filter Bar */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <IconSearch className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="과목명 또는 과목코드로 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <IconFilter className="mr-2 h-4 w-4 text-gray-400" />
            <SelectValue placeholder="카테고리" />
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

      {/* Results Count */}
      <div className="mb-4 text-sm text-gray-500">
        검색 결과: <span className="font-medium text-gray-900">{filteredCourses.length}</span>개
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredCourses.map((course) => (
          <Card
            key={course.courseCode}
            className={`transition-all hover:shadow-md ${getDepartmentColor(course.department)}`}
          >
            <CardContent className="p-4">
              <div className="mb-2 flex items-start justify-between gap-2">
                <div className="flex-1">
                  <h3 className="line-clamp-1 font-medium text-gray-900">{course.courseNameKo}</h3>
                  <p className="mt-0.5 font-mono text-xs text-gray-500">{course.courseCode}</p>
                </div>
                <Badge variant="outline" className="shrink-0 border-slate-300">
                  {course.credits}학점
                </Badge>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {getLevelBadge(course.level)}
                {course.department && <span className="text-xs text-gray-500">{course.department}</span>}
                {!course.isOffered && (
                  <Badge variant="secondary" className="bg-gray-100 text-xs text-gray-500">
                    미개설
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredCourses.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <IconBook className="h-12 w-12 text-gray-300" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">검색 결과가 없습니다</h3>
          <p className="mt-1 text-sm text-gray-500">다른 검색어나 카테고리를 시도해보세요</p>
        </div>
      )}
    </div>
  );
}
