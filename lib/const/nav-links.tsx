import { ClipboardList, Home, Upload, Search, Route, Award, LucideIcon } from 'lucide-react';

type NavLink = {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: React.ReactNode;
};

export const navLinks: NavLink[] = [
  { label: '홈', href: '/dashboard', icon: Home },
  { label: '파일 업로드', href: '/dashboard/graduation/upload', icon: Upload },
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
    label: '로드맵 (Beta)',
    href: '/dashboard/roadmap',
    icon: Route,
  },
  {
    label: '이수요건 확인서 ✨',
    href: '/dashboard/graduation/certificate-builder',
    icon: Award,
  },
];
