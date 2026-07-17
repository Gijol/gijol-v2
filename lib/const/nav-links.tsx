import { ClipboardList, Home, Upload, Search, Route, Award, Calendar, BookOpen, LucideIcon } from 'lucide-react';

type NavLink = {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: React.ReactNode;
};

export const navLinks: NavLink[] = [
  { label: '홈', href: '/dashboard', icon: Home },
  {
    label: '내 수강현황',
    href: '/dashboard/course/my',
    icon: ClipboardList,
  },
  {
    label: '강의 검색',
    href: '/dashboard/course/search',
    icon: Search,
  },
  {
    label: '시간표 생성기',
    href: '/dashboard/timetable',
    icon: Calendar,
  },
  {
    label: '로드맵',
    href: '/dashboard/roadmap',
    icon: Route,
  },
  {
    label: '이수요건 확인서',
    href: '/dashboard/graduation/certificate-builder',
    icon: Award,
  },
];

export const guideLinks: NavLink[] = [
  {
    label: '졸업요건 안내',
    href: '/dashboard/graduation/requirements-guide',
    icon: BookOpen,
  },
];
