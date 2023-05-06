import { IconClipboardList, IconDeviceDesktopAnalytics, IconHome } from '@tabler/icons-react';

export const navLinks = [
  { label: '홈', href: '/dashboard', icon: IconHome },
  { label: '내 강의 현황', href: '/dashboard/course/my', icon: IconClipboardList },
  { label: '내 졸업요건', href: '/dashboard/course', icon: IconDeviceDesktopAnalytics },
];
