import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface StepperProps {
  steps: readonly string[];
  currentStep: number;
  onStepClick: (index: number) => void;
}

export function Stepper({ steps, currentStep, onStepClick }: StepperProps) {
  return (
    <nav aria-label="확인서 작성 진행 단계" className="w-full overflow-x-auto">
      <ol className="flex min-w-max items-center md:min-w-0 md:justify-center">
        {steps.map((title, index) => {
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;

          return (
            <li key={title} className="flex items-center">
              <button
                type="button"
                onClick={() => onStepClick(index)}
                aria-current={isActive ? 'step' : undefined}
                aria-label={`${index + 1}단계: ${title}`}
                className={cn(
                  'flex touch-manipulation items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-[background-color,color,box-shadow,transform] duration-150 ease-[var(--ease-ui-out)] active:scale-[0.97] motion-reduce:transition-colors motion-reduce:active:scale-100',
                  'focus-visible:ring-brand-primary focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
                  isActive
                    ? 'bg-brand-primary text-white shadow-sm'
                    : isCompleted
                      ? 'bg-brand-primary-soft text-brand-primary hover:bg-brand-primary-muted'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200',
                )}
              >
                <span
                  className={cn(
                    'flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold transition-colors',
                    isActive ? 'bg-white/20' : isCompleted ? 'bg-brand-primary text-white' : 'bg-gray-200',
                  )}
                >
                  {isCompleted ? <Check aria-hidden="true" className="h-3.5 w-3.5" /> : index + 1}
                </span>
                <span className="hidden md:inline">{title}</span>
              </button>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'mx-2 h-0.5 w-6 transition-colors md:w-10',
                    isCompleted ? 'bg-brand-primary' : 'bg-gray-200',
                  )}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
