import {
  IconCalendarTime,
  IconCertificate,
  IconChalkboard,
  IconClipboardList,
  IconDeviceDesktopAnalytics,
  IconHome,
  IconUpload,
} from '@tabler/icons-react';
import { Badge } from '@mantine/core';

type NavLink = {
  label: string;
  href: string;
  icon: any;
  badge?: React.ReactNode;
};

// custom badge function
function createBadge(content: string, color: string = 'blue') {
  return (
    <Badge color={color} size="sm">
      {content}
    </Badge>
  );
}

export const navLinks: NavLink[] = [
  { label: '홈', href: '/dashboard', icon: IconHome },
  { label: '파일 업로드', href: '/dashboard/graduation/upload', icon: IconUpload },
  {
    label: '내 수강현황',
    href: '/dashboard/course/my',
    icon: IconClipboardList,
  },
  {
    label: '내 졸업요건',
    href: '/dashboard/graduation',
    icon: IconDeviceDesktopAnalytics,
  },
  // {
  //   label: '강의 정보',
  //   href: '/dashboard/course/search',
  //   icon: IconChalkboard,
  // },
  // {
  //   label: '졸업요건 확인서 만들기 ✨',
  //   href: '/dashboard/graduation/certificate-builder',
  //   icon: IconCertificate,
  // },
  // { label: '시간표 제작하기 ✨', href: '/dashboard/course/timetable', icon: IconCalendarTime },
];
