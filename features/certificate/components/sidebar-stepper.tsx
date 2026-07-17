import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface SidebarStepperProps {
  steps: readonly string[];
  currentStep: number;
  completedSteps: boolean[];
  onStepClick: (index: number) => void;
}

export function SidebarStepper({ steps, currentStep, completedSteps, onStepClick }: SidebarStepperProps) {
  return (
    <nav aria-label="확인서 작성 단계" className="flex flex-col gap-1">
      {steps.map((title, index) => {
        const isActive = index === currentStep;
        const isCompleted = completedSteps[index];

        return (
          <button
            key={title}
            type="button"
            onClick={() => onStepClick(index)}
            aria-current={isActive ? 'step' : undefined}
            aria-label={`${index + 1}단계: ${title}${isCompleted ? ', 입력 완료' : ''}`}
            className={cn(
              'flex touch-manipulation items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-[transform,background-color,color] duration-150 ease-[var(--ease-ui-out)] active:scale-[0.98]',
              'focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none motion-reduce:transition-none motion-reduce:active:scale-100',
              isActive
                ? 'bg-blue-600 text-white'
                : isCompleted
                  ? 'bg-blue-50 text-blue-800 hover:bg-blue-100'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950',
            )}
          >
            <span
              className={cn(
                'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold tabular-nums',
                isActive
                  ? 'bg-white/20 text-white'
                  : isCompleted
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-200 text-slate-600',
              )}
            >
              {isCompleted ? <Check aria-hidden="true" className="h-4 w-4" /> : index + 1}
            </span>
            <span className="truncate">{title}</span>
          </button>
        );
      })}
    </nav>
  );
}
