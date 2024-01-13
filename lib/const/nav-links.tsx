import {
  IconCalendarTime,
  IconCertificate,
  IconChalkboard,
  IconClipboardList,
  IconDeviceDesktopAnalytics,
  IconHome,
  IconUserCircle,
} from '@tabler/icons-react';
import { Badge } from '@mantine/core';

type NavLink = {
  label: string;
  href: string;
  icon: any;
  badge?: React.ReactNode;
};

export const navLinks = [
  { label: '홈', href: '/dashboard', icon: IconHome },
  { label: '프로필', href: '/dashboard/user-info', icon: IconUserCircle },
  {
    label: '내 수강현황',
    href: '/dashboard/course/my',
    icon: IconClipboardList,
    badge: (
      <Badge color="teal" size="sm">
        Update
      </Badge>
    ),
  },
  {
    label: '내 졸업요건',
    href: '/dashboard/graduation',
    icon: IconDeviceDesktopAnalytics,
    badge: (
      <Badge color="teal" size="sm">
        Update
      </Badge>
    ),
  },
  {
    label: '강의 정보',
    href: '/dashboard/course/search',
    icon: IconChalkboard,
    badge: (
      <Badge color="teal" size="sm">
        Update
      </Badge>
    ),
  },
  // {
  //   label: '졸업요건 확인서 만들기 ✨',
  //   href: '/dashboard/graduation/certificate-builder',
  //   icon: IconCertificate,
  // },
  // { label: '시간표 제작하기 ✨', href: '/dashboard/course/timetable', icon: IconCalendarTime },
];
