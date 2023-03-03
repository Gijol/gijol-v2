import { Navbar, NavLink } from '@mantine/core';
import {
  IconSchool,
  IconHome,
  IconCalendar,
  IconTimeline,
  IconUsers,
  IconBuildingCommunity,
  IconInfoCircle,
  IconHomeQuestion,
} from '@tabler/icons-react';
import Link from 'next/link';

export function LayoutNavbar({ opened }: { opened: boolean }) {
  return (
    <Navbar p="md" hiddenBreakpoint="sm" hidden={!opened} width={{ sm: 200, lg: 240 }}>
      <Navbar.Section grow>
        <Link href="/" style={{ textDecoration: 'unset' }}>
          <NavLink label="홈" icon={<IconHome size="1rem" stroke={1.5} />} />
        </Link>
        <NavLink label="내 강의" icon={<IconSchool size="1rem" stroke={1.5} />} childrenOffset={28}>
          <Link href="/course" style={{ textDecoration: 'unset' }}>
            <NavLink label="수강 현황" icon={<IconTimeline size="1rem" stroke={1.5} />} />
          </Link>
          <Link href="/course/schedule" style={{ textDecoration: 'unset' }}>
            <NavLink label="시간표" icon={<IconCalendar size="1rem" stroke={1.5} />} />
          </Link>
        </NavLink>

        <NavLink
          label="학교 생활"
          icon={<IconBuildingCommunity size="1rem" stroke={1.5} />}
          childrenOffset={28}
          defaultOpened
        >
          <Link href="/school" style={{ textDecoration: 'unset' }}>
            <NavLink label="내 모임" icon={<IconUsers size="1rem" stroke={1.5} />} />
          </Link>
          <Link href="/school/dorm" style={{ textDecoration: 'unset' }}>
            <NavLink label="기숙사" icon={<IconHomeQuestion size="1rem" stroke={1.5} />} />
          </Link>
          <Link href="/school/info" style={{ textDecoration: 'unset' }}>
            <NavLink label="유용한 정보" icon={<IconInfoCircle size="1rem" stroke={1.5} />} />
          </Link>
        </NavLink>
      </Navbar.Section>
      <Navbar.Section>
        <div>User section</div>
      </Navbar.Section>
    </Navbar>
  );
}
