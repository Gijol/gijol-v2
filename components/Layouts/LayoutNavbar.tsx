import { Navbar, NavLink } from '@mantine/core';
import {
  IconSchool,
  IconHome,
  IconCalendar,
  IconUsers,
  IconBuildingCommunity,
  IconInfoCircle,
  IconHomeQuestion,
  IconChartInfographic,
  IconChalkboard,
} from '@tabler/icons-react';
import Link from 'next/link';

export function LayoutNavbar({ opened }: { opened: boolean }) {
  return (
    <Navbar p="md" hiddenBreakpoint="sm" hidden={!opened} width={{ sm: 200, lg: 240 }}>
      <Navbar.Section grow>
        <Link href="/dashboard" style={{ textDecoration: 'unset' }}>
          <NavLink label="홈" icon={<IconHome size="1rem" stroke={1.5} />} />
        </Link>
        <NavLink label="내 강의" icon={<IconSchool size="1rem" stroke={1.5} />} childrenOffset={28}>
          <Link href="/dashboard/course" style={{ textDecoration: 'unset' }}>
            <NavLink
              label="졸업요건 현황"
              icon={<IconChartInfographic size="1rem" stroke={1.5} />}
            />
          </Link>
          <Link href="/dashboard/course/evaluation" style={{ textDecoration: 'unset' }}>
            <NavLink label="강의평가" icon={<IconChalkboard size="1rem" stroke={1.5} />} />
          </Link>
          <Link href="/dashboard/course/schedule" style={{ textDecoration: 'unset' }}>
            <NavLink label="시간표" icon={<IconCalendar size="1rem" stroke={1.5} />} />
          </Link>
        </NavLink>

        <NavLink
          label="학교 생활"
          icon={<IconBuildingCommunity size="1rem" stroke={1.5} />}
          childrenOffset={28}
          defaultOpened
        >
          <Link href="/dashboard/school" style={{ textDecoration: 'unset' }}>
            <NavLink label="내 모임" icon={<IconUsers size="1rem" stroke={1.5} />} />
          </Link>
          <Link href="/dashboard/school/dorm" style={{ textDecoration: 'unset' }}>
            <NavLink label="기숙사" icon={<IconHomeQuestion size="1rem" stroke={1.5} />} />
          </Link>
          <Link href="/dashboard/school/info" style={{ textDecoration: 'unset' }}>
            <NavLink label="유용한 정보" icon={<IconInfoCircle size="1rem" stroke={1.5} />} />
          </Link>
        </NavLink>
      </Navbar.Section>
    </Navbar>
  );
}
