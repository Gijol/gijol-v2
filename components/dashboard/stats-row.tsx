import { School, Book, AlertTriangle } from 'lucide-react';
import { StatCard } from '@components/ui/stat-card';

interface StatsRowProps {
  totalCreditsEarned: number;
  totalRequiredCredits: number;
  remainingCredits: number;
  unsatisfiedRequirements: number;
}

export function StatsRow({
  totalCreditsEarned,
  totalRequiredCredits,
  remainingCredits,
  unsatisfiedRequirements,
}: StatsRowProps) {
  return (
    <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
      <StatCard
        title="총 이수 학점"
        value={`${totalCreditsEarned}`}
        subtitle={`/ ${totalRequiredCredits}학점`}
        variant="blue"
        icon={<School className="h-5 w-5" />}
      />
      <StatCard
        title="남은 학점"
        value={`${remainingCredits}`}
        subtitle="졸업까지"
        variant="gray"
        icon={<Book className="h-5 w-5" />}
      />
      <StatCard
        title="미충족 요건"
        value={`${unsatisfiedRequirements}`}
        subtitle="카테고리"
        variant="yellow"
        icon={<AlertTriangle className="h-5 w-5" />}
      />
    </div>
  );
}
