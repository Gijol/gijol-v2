import {
  IconCalendarTime,
  IconCertificate,
  IconChalkboard,
  IconClipboardList,
  IconDeviceDesktopAnalytics,
  IconHome,
  IconUserCircle,
} from '@tabler/icons-react';

export const navLinks = [
  { label: '홈', href: '/dashboard', icon: IconHome },
  { label: '내 정보', href: '/dashboard/user-info', icon: IconUserCircle },
  { label: '내 수강현황', href: '/dashboard/course/my', icon: IconClipboardList },
  { label: '내 졸업요건', href: '/dashboard/graduation', icon: IconDeviceDesktopAnalytics },
  { label: '강의 정보 확인하기', href: '/dashboard/course/search', icon: IconChalkboard },
  {
    label: '졸업요건 확인서 만들기 ✨',
    href: '/dashboard/graduation/certificate-builder',
    icon: IconCertificate,
  },
  { label: '시간표 제작하기 ✨', href: '/dashboard/course/timetable', icon: IconCalendarTime },
];
