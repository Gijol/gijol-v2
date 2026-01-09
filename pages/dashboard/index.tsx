import { homeContents } from '@const/content-data';
import { useRouter } from 'next/router';
import { IconCheck, IconUpload } from '@tabler/icons-react';
import DashboardHeroHeader from '@components/dashboard-hero-header';
import DashboardFeatureCard from '@components/dashboard-feature-card';
import { Button } from '@components/ui/button';
import { cn } from '@/lib/utils';

export default function HomePage() {
  const router = useRouter();
  const cntFeatures = homeContents.main.cntFeatures;
  // const futureFeatures = homeContents.main.betaFeatures; // Unused for now

  return (
    <div className="w-full">
      <DashboardHeroHeader />
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        {/* ▶️ ZEUS 엑셀 업로드 안내 박스 */}
        <div className="mt-10 rounded-md border border-red-600 bg-red-50 p-6 dark:bg-red-950/20 dark:border-red-800">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-red-600 mb-1.5">
                먼저 성적표 엑셀을 업로드해주세요
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                현재 Gijol-v2는 <b>로그인 없이</b> 동작하며, 한 번의 엑셀 업로드로
                <b> 졸업요건 확인</b>과 <b>내 수강현황</b>을 확인할 수 있습니다.
              </p>

              <p className="text-sm font-medium mt-2 mb-1 text-gray-900 dark:text-gray-100">
                ✅ 업로드해야 하는 파일 (ZEUS 기준):
              </p>
              <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                <ListItem>학교 제우스(Zeus) 시스템 접속</ListItem>
                <ListItem>
                  상단 메뉴에서 <b>성적 &gt; 개인성적조회</b>로 이동
                </ListItem>
                <ListItem>
                  화면 <b>상단 우측</b>에 있는 <b>“Report card (KOR)”</b> 버튼 클릭
                </ListItem>
                <ListItem>다운로드된 엑셀 파일을 Gijol에서 업로드</ListItem>
              </ul>
            </div>
            <Button
              size="lg"
              className={cn(
                "bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white border-0",
                "shadow-[0_0_0_0_rgba(0,122,255,0.4)] animate-[pulse_1.8s_infinite]"
              )}
              onClick={() => router.push('/dashboard/graduation/upload')}
            >
              <IconUpload className="mr-2 h-5 w-5" />
              업로드하러 가기
            </Button>
          </div>
        </div>

        <div className="h-8" />

        {/* 🔹 지금 이용 가능한 기능들 (졸업요건 / 수강현황) */}
        <h2 className="text-2xl font-semibold my-4 text-gray-900 dark:text-gray-100">
          지금 이용 가능한 서비스
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          성적표 엑셀을 업로드하면, 아래 기능들을 바로 사용하실 수 있어요.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cntFeatures.map((feat) => (
            <DashboardFeatureCard key={feat.title} feat={feat} />
          ))}
        </div>

        <div className="h-24" />
      </div>
    </div>
  );
}

function ListItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <div className="mt-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 shrink-0">
        <IconCheck size={10} />
      </div>
      <span>{children}</span>
    </li>
  )
}
