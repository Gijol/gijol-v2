import React, { useRef } from 'react';
import Image from 'next/image';
import router from 'next/router';
import {
  IconPackages,
  IconPresentationAnalytics,
  IconUser
} from '@tabler/icons-react';
import { Button } from '@components/ui/button';
import { MovingBorder as MovingBorderButton } from '@components/ui/moving-border';
import { BackgroundBeams } from '@components/ui/background-beams'; 
import { BentoGrid, BentoGridItem } from '@components/ui/bento-grid'; 

import MainLayoutHeader from '@components/layouts/main-layout-header';

import macImg from '/public/images/MacBookAir.png';

export default function MainPage() {
  const targetRef = useRef<HTMLDivElement>(null);

  const scrollIntoView = () => {
    targetRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const reviews = [
    {
      name: '익명',
      title: '전기전자컴퓨터공학부 2학년',
      quote:
        '학교 생활을 어느정도 지내다 보니, 3학년을 지나 4학년을 앞두고 있는데 지금까지 어떤 강의를 들었고, 앞으로 어떤 강의를 들어야 하는지 너무 막막했었어요. 그런데 Gijol 서비스를 이용하고 나니 길이 보이는 것 같아요! 이런 서비스 만들어주셔서 감사합니다!',
    },
    {
      name: '황인선',
      title: '전기전자컴퓨터공학부 3학년',
      quote:
        '학사편람 책으로 졸업이수조건을 찾아가며 불편하게 졸업 학점을 계산했는데, 클릭 몇 번만으로 어떤 수업을 들어야할지 알 수 있어 너무 편리해요..!! 🥹',
    },
    {
      name: '최승규',
      title: '물리광과학부 4학년',
      quote:
        '들은 과목이 너무 많아서 졸업을 위해 필요한게 무엇인지 정리하기 어려웠는데 한눈에 보기좋게 정리해 보여줘서 짱이다!',
    },
     // Duplicate for better infinite scroll effect if needed, but component handles it by cloning
  ];

  const services = [
    {
      title: '졸업요건 확인하기',
      description: '나의 졸업요건 충족 여부와 피드백을 받아보세요',
      header: <SkeletonOne />,
      icon: <IconPackages className="h-4 w-4 text-neutral-500" />,
    },
    {
      title: '강의정보 확인하기',
      description: '매 학기 열리는 강의 정보를 검색해보세요',
      header: <SkeletonTwo />,
      icon: <IconPresentationAnalytics className="h-4 w-4 text-neutral-500" />,
    },
    {
      title: '내 정보 확인하기',
      description: '나의 학적 정보와 이수 현황을 한눈에 확인하세요',
      header: <SkeletonThree />,
      icon: <IconUser className="h-4 w-4 text-neutral-500" />,
    },
  ];

  return (
    <>
      <MainLayoutHeader />

      {/* Hero Section with Background Beams */}
      <div className="relative w-full h-[60rem] md:h-screen bg-neutral-950 flex flex-col items-center justify-center antialiased overflow-hidden">
        <div className="max-w-2xl mx-auto p-4 relative z-10 w-full pt-20 md:pt-0">
          <h1 className="relative z-10 text-5xl md:text-7xl bg-clip-text text-transparent bg-gradient-to-b from-neutral-200 to-neutral-600  text-center font-sans font-bold tracking-tight">
            학교 생활을 <br /> 더욱 편리하게
          </h1>
          <p className="text-neutral-500 max-w-lg mx-auto my-4 text-sm text-center relative z-10">
            Gijol과 함께 복잡한 졸업 요건 계산부터 강의 정보 검색까지, 대학 생활의 모든 것을 똑똑하게 관리하세요.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mt-10">
            <MovingBorderButton
              borderRadius="1.75rem"
              className="bg-neutral-900 text-white border-neutral-800 font-semibold"
              onClick={scrollIntoView}
            >
              기능 보러가기
            </MovingBorderButton>
            <MovingBorderButton
              borderRadius="1.75rem"
              className="bg-white text-black border-neutral-200 font-semibold"
              containerClassName="bg-white text-black" 
              onClick={() => router.push('/dashboard')}
            >
              대쉬보드 이용하기
            </MovingBorderButton>
          </div>
        </div>
        
        {/* Mockup Image floating */}
        <div className="relative z-10 mt-10 w-full max-w-[800px] px-4 hidden md:block">
            <div style={{transform: 'perspective(1000px) rotateX(15deg) scale(0.9)', margin: 'auto'}}>
                <Image
                src={macImg}
                alt="macbook air image"
                width={800}
                height={500}
                className="drop-shadow-2xl mx-auto"
                style={{
                  filter: "drop-shadow(0 20px 30px rgba(0,0,0,0.5))"
                }}
                />
            </div>
        </div>

        <BackgroundBeams />
      </div>

      {/* Features Section with Bento Grid */}
      <div className="w-full bg-white dark:bg-black py-20" ref={targetRef}>
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-10 text-neutral-800 dark:text-neutral-200">
            주요 기능 소개
          </h2>
          <BentoGrid>
            {services.map((item, i) => (
              <BentoGridItem
                key={i}
                title={item.title}
                description={item.description}
                header={item.header}
                icon={item.icon}
                className={i === 1 ? "md:col-span-1" : ""}
              />
            ))}
          </BentoGrid>
        </div>
      </div>

      {/* Reviews Section with Infinite Moving Cards */}
      <div className="h-[30rem] rounded-md flex flex-col antialiased bg-white dark:bg-black dark:bg-grid-white/[0.05] items-center justify-center relative overflow-hidden">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-10 text-neutral-800 dark:text-neutral-200 z-10">
          사용자 후기
        </h2>
        {/* InfiniteMovingCards removed as component does not exist */}
        {/* <InfiniteMovingCards
          items={reviews}
          direction="right"
          speed="slow"
        /> */}
      </div>
    </>
  );
}

// Skeletons for Bento Grid placeholders
const SkeletonOne = () => (
  <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-neutral-200 dark:from-neutral-900 dark:to-neutral-800 to-neutral-100 items-center justify-center">
    <IconPackages className="h-20 w-20 text-neutral-300 dark:text-neutral-700" />
  </div>
);
const SkeletonTwo = () => (
  <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-neutral-200 dark:from-neutral-900 dark:to-neutral-800 to-neutral-100 items-center justify-center">
    <IconPresentationAnalytics className="h-20 w-20 text-neutral-300 dark:text-neutral-700" />
  </div>
);
const SkeletonThree = () => (
  <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-neutral-200 dark:from-neutral-900 dark:to-neutral-800 to-neutral-100 items-center justify-center">
    <IconUser className="h-20 w-20 text-neutral-300 dark:text-neutral-700" />
  </div>
);
