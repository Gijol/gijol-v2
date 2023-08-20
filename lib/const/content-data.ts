import {
  IconChalkboard,
  IconClipboardList,
  IconDeviceDesktopAnalytics,
  IconListSearch,
  IconThumbUp,
} from '@tabler/icons-react';

export const homeContents = {
  main: {
    title: 'Gijol에 오신것을 환영합니다',
    cntFeatures: [
      {
        title: '내 수강현황',
        description: '개인 수강 현황을 시각화해서 보여주는 서비스입니다!',
        icon: IconClipboardList,
        route: `/dashboard/course/my`,
        with_auth: true,
      },
      {
        title: '졸업요건 확인 기능',
        description:
          '개인 수강정보를 기반으로 졸업요건 충족 여부를 확인하여 그 결과와 강의 추천까지 해드립니다!',
        icon: IconDeviceDesktopAnalytics,
        route: `/dashboard/graduation`,
        with_auth: true,
      },
      {
        title: '강의목록 확인 기능',
        description: '2023년도 학사편람을 기반으로 한 강의 정보를 확인하세요!',
        icon: IconChalkboard,
        route: `/dashboard/course/search`,
        with_auth: false,
      },
    ],
    newFeatures: [
      {
        title: '로그인 기능',
        description: '로그인 기능이 추가되었습니다! 이제 나의 성적표를 저장할 수 있습니다!',
      },
    ],
    betaFeatures: [
      {
        title: '강의 추천 기능',
        description:
          '이제 강의 추천기능이 더욱 고도화 될 것입니다! Gijol 유저들의 정보 기반으로 학번별, 전공별, 난이도별 추천이 이뤄질 것으로 예상됩니다!',
        icon: IconThumbUp,
      },
      {
        title: '강의 검색 기능',
        description:
          '강의에 대한 정보를 확인할 수 있을 것입니다! 단순히 과목명과 설명을 넘어서 난이도, 학기별 오픈 여부, 수강생 수 등의 정보를 확인할 수 있을 것으로 예상됩니다!',
        icon: IconListSearch,
      },
    ],
  },
};
