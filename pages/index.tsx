'use client';

import React, { useRef } from 'react';
import router from 'next/router';
import { Package, BarChart, Calendar, GraduationCap, Map, Clock, FileCheck, BookOpen, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { NextSeo, OrganizationJsonLd } from 'next-seo';
import Head from 'next/head';

import { InfiniteMovingCards } from '@components/ui/infinite-moving-cards';
import MainLayoutHeader from '@components/layouts/main-layout-header';
import { cn } from '@/lib/utils';

export default function MainPage() {
  const targetRef = useRef<HTMLDivElement>(null);

  const scrollIntoView = () => {
    targetRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

  const features = [
    {
      title: '졸업요건 분석',
      description: '성적표 업로드 한 번으로 졸업요건 충족 여부를 자동 분석합니다.',
      icon: <GraduationCap className="h-6 w-6" />,
      gradient: 'from-blue-500 to-cyan-500',
      size: 'large',
    },
    {
      title: '시간표 생성기',
      description: '드래그 앤 드롭으로 다음 학기 시간표를 간편하게 계획하세요.',
      icon: <Clock className="h-6 w-6" />,
      gradient: 'from-violet-500 to-purple-500',
      size: 'normal',
    },
    {
      title: '로드맵 빌더',
      description: '졸업까지의 수강 계획을 시각적으로 구성하고 관리합니다.',
      icon: <Map className="h-6 w-6" />,
      gradient: 'from-emerald-500 to-teal-500',
      size: 'normal',
    },
    {
      title: '강의 검색',
      description: '학기별 개설 과목을 빠르게 검색하고 필터링하세요.',
      icon: <BarChart className="h-6 w-6" />,
      gradient: 'from-orange-500 to-amber-500',
      size: 'normal',
    },
    {
      title: '졸업요건 가이드',
      description: '학번별 졸업요건을 한눈에 확인하고 비교해보세요.',
      icon: <BookOpen className="h-6 w-6" />,
      gradient: 'from-pink-500 to-rose-500',
      size: 'normal',
    },
    {
      title: '확인서 생성기',
      description: '졸업 이수요건 확인서를 엑셀 파일로 자동 생성합니다.',
      icon: <FileCheck className="h-6 w-6" />,
      gradient: 'from-indigo-500 to-blue-500',
      size: 'large',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <NextSeo
        title="홈"
        description="GIST 학부생을 위한 졸업 요건 분석 및 로드맵 관리 플랫폼. 성적표 하나로 졸업 준비 끝!"
      />
      <OrganizationJsonLd
        type="Organization"
        name="Gijol"
        url="https://gijol.vercel.app"
        logo="https://gijol.vercel.app/favicon.svg"
      />
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'Gijol',
              description: 'GIST 학부생을 위한 졸업 요건 분석 및 로드맵 관리 플랫폼',
              url: 'https://gijol.vercel.app',
              applicationCategory: 'EducationalApplication',
              operatingSystem: 'Web',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'KRW',
              },
            }),
          }}
        />
      </Head>
      <MainLayoutHeader />

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-blue-50/50 to-transparent" />

        <div className="relative mx-auto max-w-6xl px-6 pt-20 pb-24">
          {/* Badge */}
          <div className="mb-8 flex justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2"
            >
              <span className="text-sm font-medium text-[#0B62DA]">✨ GIST 학부생을 위한 졸업 관리 플랫폼</span>
            </motion.div>
          </div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-center text-4xl leading-tight font-bold tracking-tight text-[#1D2530] md:text-6xl"
          >
            <span className="bg-linear-to-r from-[#0B62DA] to-cyan-500 bg-clip-text text-transparent">졸업까지</span>
            의 모든 여정을
            <br />
            한눈에 관리하세요
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mx-auto mt-6 max-w-2xl text-center text-lg leading-relaxed text-gray-600"
          >
            성적표 업로드로 졸업요건 분석, 맞춤형 수강 추천,
            <br className="hidden md:block" />
            강의 로드맵까지. Gijol이 함께합니다.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <button
              onClick={() => router.push('/dashboard')}
              className="group rounded-xl bg-[#0B62DA] px-8 py-3.5 font-semibold text-white shadow-lg shadow-blue-500/25 transition-all duration-200 hover:bg-[#0952B8] hover:shadow-xl hover:shadow-blue-500/30"
            >
              바로 시작하기
              <ArrowRight className="ml-2 inline-block h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
            <button
              onClick={scrollIntoView}
              className="rounded-xl border border-gray-200 bg-white px-8 py-3.5 font-semibold text-gray-700 transition-all duration-200 hover:bg-gray-50"
            >
              기능 살펴보기
            </button>
          </motion.div>

          {/* Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="relative mt-16"
          >
            <div className="pointer-events-none absolute inset-0 z-10 h-full bg-linear-to-t from-[#F9FAFB] via-transparent to-transparent" />
            <div className="overflow-hidden rounded-2xl border border-gray-800 bg-[#1E293B] shadow-2xl">
              <div className="flex items-center gap-2 border-b border-gray-700 bg-[#0F172A] px-4 py-3">
                <div className="flex gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500" />
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                </div>
                <div className="flex-1 text-center">
                  <span className="text-xs text-gray-400">Gijol Dashboard</span>
                </div>
              </div>
              <div className="p-8">
                {/* Mock Dashboard Content */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  {/* Progress Card */}
                  <div className="rounded-xl border border-gray-700 bg-[#0F172A] p-6">
                    <div className="mb-2 text-sm text-gray-400">총 이수 학점</div>
                    <div className="mb-4 text-3xl font-bold text-white">102 / 130</div>
                    <div className="h-2 overflow-hidden rounded-full bg-gray-700">
                      <div className="h-full w-[78%] rounded-full bg-linear-to-r from-[#0B62DA] to-cyan-400" />
                    </div>
                    <div className="mt-2 text-xs text-gray-500">78% 완료</div>
                  </div>

                  {/* Major Credits */}
                  <div className="rounded-xl border border-gray-700 bg-[#0F172A] p-6">
                    <div className="mb-2 text-sm text-gray-400">전공 학점</div>
                    <div className="mb-4 text-3xl font-bold text-white">45 / 54</div>
                    <div className="h-2 overflow-hidden rounded-full bg-gray-700">
                      <div className="h-full w-[83%] rounded-full bg-linear-to-r from-emerald-500 to-emerald-400" />
                    </div>
                    <div className="mt-2 text-xs text-gray-500">83% 완료</div>
                  </div>

                  {/* GPA Card */}
                  <div className="rounded-xl border border-gray-700 bg-[#0F172A] p-6">
                    <div className="mb-2 text-sm text-gray-400">누적 평점</div>
                    <div className="mb-4 text-3xl font-bold text-white">3.85 / 4.5</div>
                    <div className="h-2 overflow-hidden rounded-full bg-gray-700">
                      <div className="h-full w-[85%] rounded-full bg-linear-to-r from-amber-500 to-amber-400" />
                    </div>
                    <div className="mt-2 text-xs text-gray-500">상위 15%</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Features Section - Bento Grid Style */}
      <div className="mx-auto max-w-6xl px-6 py-24" ref={targetRef}>
        <div className="mb-4 text-center">
          <span className="text-sm font-semibold tracking-wide text-[#0B62DA]">FEATURES</span>
        </div>
        <h2 className="text-center text-3xl font-bold tracking-tight text-[#1D2530] md:text-4xl">
          졸업 준비, 이제 쉽고 빠르게
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-gray-600">
          Gijol의 다양한 기능으로 복잡한 학사 관리를 간편하게 해결하세요
        </p>

        {/* Bento Grid */}
        <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className={cn(
                'group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 transition-all duration-300 hover:border-gray-300 hover:shadow-xl',
                feature.size === 'large' && 'md:col-span-2 lg:col-span-1',
              )}
            >
              {/* Gradient background on hover */}
              <div
                className={cn(
                  'absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-5',
                  feature.gradient,
                )}
              />

              {/* Icon */}
              <div
                className={cn(
                  'mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-white transition-transform duration-300 group-hover:scale-110',
                  feature.gradient,
                )}
              >
                {feature.icon}
              </div>

              {/* Content */}
              <h3 className="mb-2 text-lg font-bold text-gray-900">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Reviews Section */}
      <div className="border-y border-gray-100 bg-white py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-4 text-center">
            <span className="text-sm font-semibold tracking-wide text-[#0B62DA]">REVIEWS</span>
          </div>
          <h2 className="mb-12 text-center text-3xl font-bold tracking-tight text-[#1D2530] md:text-4xl">
            학생들의 생생한 후기
          </h2>
          <InfiniteMovingCards items={reviews} direction="right" speed="slow" />
        </div>
      </div>

      {/* Bottom CTA Section */}
      <div className="relative overflow-hidden bg-[#0F172A] py-24">
        {/* Gradient orbs */}
        <div className="absolute top-0 left-1/4 h-96 w-96 -translate-x-1/2 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute right-1/4 bottom-0 h-96 w-96 translate-x-1/2 rounded-full bg-cyan-500/20 blur-3xl" />

        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="mb-6 text-3xl font-bold tracking-tight text-white md:text-5xl"
          >
            지금 바로 시작하세요
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="mx-auto mb-10 max-w-xl text-lg text-gray-400"
          >
            성적표 업로드 한 번으로 졸업까지의 모든 여정을 계획하고 관리할 수 있습니다.
          </motion.p>
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            onClick={() => router.push('/dashboard')}
            className="group rounded-xl bg-[#0B62DA] px-10 py-4 text-lg font-semibold text-white transition-all duration-200 hover:bg-[#0952B8]"
          >
            무료로 시작하기
            <ArrowRight className="ml-2 inline-block h-5 w-5 transition-transform group-hover:translate-x-1" />
          </motion.button>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-[#0F172A] py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0B62DA]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                  <path d="M6 12v5c3 3 9 3 12 0v-5" />
                </svg>
              </div>
              <span className="text-lg font-bold text-white">Gijol</span>
            </div>
            <div className="flex gap-6 text-sm text-gray-400">
              <a href="#" className="transition-colors hover:text-white">
                이용약관
              </a>
              <a href="#" className="transition-colors hover:text-white">
                개인정보처리방침
              </a>
              <a
                href="https://choieungi-project.notion.site/Team-Gijol-e5e279e91a0646c2a84b548873601a3f"
                target="_blank"
                rel="noreferrer"
                className="transition-colors hover:text-white"
              >
                팀 소개
              </a>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-800 pt-8 text-center text-sm text-gray-500">
            <p>© {new Date().getFullYear()} Gijol. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
