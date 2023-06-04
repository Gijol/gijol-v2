import {
  IconChalkboard,
  IconClipboardList,
  IconDeviceDesktopAnalytics,
  IconHome,
} from '@tabler/icons-react';

export const navLinks = [
  { label: '홈', href: '/dashboard', icon: IconHome },
  { label: '내 수강현황', href: '/dashboard/course/my', icon: IconClipboardList },
  { label: '내 졸업요건', href: '/dashboard/graduation', icon: IconDeviceDesktopAnalytics },
  { label: '강의 정보 확인하기', href: '/dashboard/course/search', icon: IconChalkboard },
];
