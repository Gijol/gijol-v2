import React, { useRef } from 'react';
import router from 'next/router';
import {
  IconPackages,
  IconPresentationAnalytics,
  IconUser,
  IconCalendarEvent
} from '@tabler/icons-react';

import { HoverEffect } from '@components/ui/card-hover-effect';
import { InfiniteMovingCards } from '@components/ui/infinite-moving-cards'; 

import MainLayoutHeader from '@components/layouts/main-layout-header';

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
        '학교 생활을 어느정도 지내다 보니, 3학년을 지나 4학년을 앞두고 있는데 지금까지 어떤 강의를 들었고, 앞으로 어떤 강의를 들어야 하는지 너무 막막했었어요. 그런데 Gijol 서비스를 이용하고 나니 길이 보이는 것 같아요!',
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
  ];

  const services = [
    {
      title: '졸업요건 확인하기',
      description: '나의 졸업요건 충족 여부와 상세한 피드백을 받아보세요. 학사편람을 일일이 확인하지 않아도 됩니다.',
      icon: <IconPackages className="h-6 w-6" strokeWidth={1.5} />,
    },
    {
      title: '강의정보 검색',
      description: '매 학기 열리는 강의 정보를 빠르게 검색하고, 나에게 필요한 과목을 찾아보세요.',
      icon: <IconPresentationAnalytics className="h-6 w-6" strokeWidth={1.5} />,
    },
    {
      title: '내 정보 관리',
      description: '나의 학적 정보와 이수 현황을 한눈에 확인하고 효율적으로 관리하세요.',
      icon: <IconUser className="h-6 w-6" strokeWidth={1.5} />,
    },
    {
      title: '학업 계획 수립',
      description: '남은 학기 동안 들어야 할 과목을 계획하고 졸업까지의 로드맵을 세워보세요.',
      icon: <IconCalendarEvent className="h-6 w-6" strokeWidth={1.5} />,
    },
  ];

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <MainLayoutHeader />

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-transparent pointer-events-none" />
        
        <div className="max-w-6xl mx-auto px-6 pt-20 pb-24 relative">
          {/* Badge */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100">
              <span className="text-sm font-medium text-[#0B62DA]">✨ GIST 학부생을 위한 졸업 관리 플랫폼</span>
            </div>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl md:text-6xl font-bold text-center text-[#1D2530] leading-tight tracking-tight">
            <span className="bg-gradient-to-r from-[#0B62DA] to-cyan-500 bg-clip-text text-transparent">졸업까지</span>의 모든 여정을
            <br />
            한눈에 관리하세요
          </h1>

          {/* Description */}
          <p className="mt-6 text-lg text-gray-600 max-w-2xl text-center mx-auto leading-relaxed">
            성적표 업로드만으로 졸업요건 분석, 맞춤형 수강 추천,
            <br className="hidden md:block" />
            취업 연계 로드맵까지. GradPath가 함께합니다.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row gap-4 items-center justify-center">
            <button
              onClick={() => router.push('/dashboard')}
              className="px-8 py-3.5 bg-[#0B62DA] hover:bg-[#0952B8] text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30"
            >
              무료로 시작하기 →
            </button>
            <button
              onClick={scrollIntoView}
              className="px-8 py-3.5 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-xl border border-gray-200 transition-all duration-200"
            >
              기능 살펴보기
            </button>
          </div>

          {/* Dashboard Preview */}
          <div className="mt-16 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-[#F9FAFB] via-transparent to-transparent z-10 pointer-events-none h-full" />
            <div className="bg-[#1E293B] rounded-2xl shadow-2xl overflow-hidden border border-gray-800">
              <div className="flex items-center gap-2 px-4 py-3 bg-[#0F172A] border-b border-gray-700">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className="flex-1 text-center">
                  <span className="text-xs text-gray-400">GradPath Dashboard</span>
                </div>
              </div>
              <div className="p-8">
                {/* Mock Dashboard Content */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Progress Card */}
                  <div className="bg-[#0F172A] rounded-xl p-6 border border-gray-700">
                    <div className="text-sm text-gray-400 mb-2">총 이수 학점</div>
                    <div className="text-3xl font-bold text-white mb-4">102 / 130</div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full w-[78%] bg-gradient-to-r from-[#0B62DA] to-cyan-400 rounded-full" />
                    </div>
                    <div className="text-xs text-gray-500 mt-2">78% 완료</div>
                  </div>
                  
                  {/* Major Credits */}
                  <div className="bg-[#0F172A] rounded-xl p-6 border border-gray-700">
                    <div className="text-sm text-gray-400 mb-2">전공 학점</div>
                    <div className="text-3xl font-bold text-white mb-4">45 / 54</div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full w-[83%] bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full" />
                    </div>
                    <div className="text-xs text-gray-500 mt-2">83% 완료</div>
                  </div>
                  
                  {/* GPA Card */}
                  <div className="bg-[#0F172A] rounded-xl p-6 border border-gray-700">
                    <div className="text-sm text-gray-400 mb-2">누적 평점</div>
                    <div className="text-3xl font-bold text-white mb-4">3.85 / 4.5</div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full w-[85%] bg-gradient-to-r from-amber-500 to-amber-400 rounded-full" />
                    </div>
                    <div className="text-xs text-gray-500 mt-2">상위 15%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-5xl mx-auto px-6 py-20" ref={targetRef}>
        <div className="text-center mb-4">
          <span className="text-sm font-semibold text-[#0B62DA] tracking-wide">FEATURES</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-center text-[#1D2530] tracking-tight">
          졸업 준비, 이제 쉽고 빠르게
        </h2>
        <p className="mt-4 text-gray-600 text-center max-w-2xl mx-auto">
          GradPath의 다양한 기능으로 복잡한 학사 관리를 간편하게 해결하세요
        </p>
        <HoverEffect
          items={services.map((s) => ({
            title: s.title,
            description: s.description,
            link: '#',
            icon: s.icon,
          }))}
        />
      </div>

      {/* Reviews Section */}
      <div className="py-20 bg-white border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-4">
            <span className="text-sm font-semibold text-[#0B62DA] tracking-wide">REVIEWS</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-center text-[#1D2530] mb-12 tracking-tight">
            학생들의 생생한 후기
          </h2>
          <InfiniteMovingCards items={reviews} direction="right" speed="slow" />
        </div>
      </div>

      {/* Bottom CTA Section */}
      <div className="bg-[#0F172A] py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">
            지금 바로 시작하세요
          </h2>
          <p className="text-lg text-gray-400 mb-10 max-w-xl mx-auto">
            성적표 업로드 한 번으로 졸업까지의 모든 여정을 계획하고 관리할 수 있습니다.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <button
              onClick={() => router.push('/dashboard')}
              className="px-10 py-4 bg-[#0B62DA] hover:bg-[#0952B8] text-white font-semibold rounded-xl transition-all duration-200 text-lg"
            >
              무료로 시작하기
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-10 py-4 bg-transparent hover:bg-white/10 text-white font-semibold rounded-xl border border-gray-600 transition-all duration-200 text-lg"
            >
              데모 보기
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#0F172A] border-t border-gray-800 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#0B62DA] flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-5 h-5"
                >
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                  <path d="M6 12v5c3 3 9 3 12 0v-5" />
                </svg>
              </div>
              <span className="font-bold text-lg text-white">GradPath</span>
            </div>
            <div className="flex gap-6 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors">이용약관</a>
              <a href="#" className="hover:text-white transition-colors">개인정보처리방침</a>
              <a href="https://choieungi-project.notion.site/Team-Gijol-e5e279e91a0646c2a84b548873601a3f" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">팀 소개</a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-500">
            <p>© {new Date().getFullYear()} GradPath (Gijol). All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
