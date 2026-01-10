import { IconSchool, IconBook, IconClipboardList, IconAlertTriangle } from '@tabler/icons-react';
import { StatCard } from '@components/ui/stat-card';

interface StatsRowProps {
  totalCreditsEarned: number;
  totalRequiredCredits: number;
  remainingCredits: number;
  completedCourses: number;
  unsatisfiedRequirements: number;
}

export function StatsRow({
  totalCreditsEarned,
  totalRequiredCredits,
  remainingCredits,
  completedCourses,
  unsatisfiedRequirements,
}: StatsRowProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <StatCard
        title="총 이수 학점"
        value={`${totalCreditsEarned}`}
        subtitle={`/ ${totalRequiredCredits}학점`}
        variant="blue"
        icon={<IconSchool className="w-5 h-5" />}
      />
      <StatCard
        title="남은 학점"
        value={`${remainingCredits}`}
        subtitle="졸업까지"
        variant="gray"
        icon={<IconBook className="w-5 h-5" />}
      />
      <StatCard
        title="수강 과목 수"
        value={`${completedCourses}`}
        subtitle="수강완료"
        variant="gray"
        icon={<IconClipboardList className="w-5 h-5" />}
      />
      <StatCard
        title="미충족 요건"
        value={`${unsatisfiedRequirements}`}
        subtitle="카테고리"
        variant="yellow"
        icon={<IconAlertTriangle className="w-5 h-5" />}
      />
    </div>
  );
}
