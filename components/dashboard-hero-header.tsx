import React from 'react';
import { CustomDots } from './custom-dots';
import Balancer from 'react-wrap-balancer';
import { cn } from '@/lib/utils';

export default function DashboardHeroHeader() {
  return (
    <div className="relative pt-[80px] pb-[60px] sm:pt-[120px] sm:pb-[80px] w-full max-w-7xl mx-auto px-4">
      {/* Dots positioned absolutely */}
      <CustomDots className="absolute text-gray-100 dark:text-[#2C2E33] hidden sm:block top-0 left-0" />
      <CustomDots className="absolute text-gray-100 dark:text-[#2C2E33] hidden sm:block top-0 left-[60px]" />
      <CustomDots className="absolute text-gray-100 dark:text-[#2C2E33] hidden sm:block top-[140px] left-0" />
      <CustomDots className="absolute text-gray-100 dark:text-[#2C2E33] hidden sm:block top-[60px] right-0" />

      <div className="relative z-10">
        <h1 className={cn(
          "text-center font-black text-[28px] xs:text-[40px] tracking-tight mb-2.5",
          "text-black dark:text-white",
          "font-[Greycliff CF, sans-serif]",
          "sm:text-[40px] text-left sm:text-center"
        )}>
          <span className="text-blue-600 dark:text-blue-400">
            Gijol-v2
          </span>{' '}
          에 오신 것을 환영합니다! 🙌
        </h1>

        <div className="max-w-[600px] mx-auto text-left sm:text-center">
          <p className="text-lg text-muted-foreground pt-6">
            <Balancer>
              아래에서{' '}
              <span className="text-red-500 font-bold text-xl">
                주의사항
              </span>
              을 꼭 확인하시고, 대시보드의 다양한 기능들을 활용해보세요!
            </Balancer>
          </p>
        </div>
      </div>
    </div>
  );
}
