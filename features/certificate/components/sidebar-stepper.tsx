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
    <nav aria-label="Form progress" className="flex flex-col gap-1">
      {steps.map((title, index) => {
        const isActive = index === currentStep;
        const isCompleted = completedSteps[index];

        return (
          <button
            key={title}
            type="button"
            onClick={() => onStepClick(index)}
            aria-current={isActive ? 'step' : undefined}
            aria-label={`Step ${index + 1}: ${title}`}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium transition-all duration-200 hover:cursor-pointer',
              'focus-visible:ring-brand-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
              isActive
                ? 'bg-brand-primary text-white shadow-sm'
                : isCompleted
                  ? 'bg-brand-primary-soft text-brand-primary hover:bg-brand-primary-muted'
                  : 'text-gray-600 hover:bg-gray-100',
            )}
          >
            <span
              className={cn(
                'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors',
                isActive
                  ? 'bg-white/20 text-white'
                  : isCompleted
                    ? 'bg-brand-primary text-white'
                    : 'bg-gray-200 text-gray-600',
              )}
            >
              {isCompleted ? <Check className="h-4 w-4" /> : index + 1}
            </span>
            <span className="truncate">{title}</span>
          </button>
        );
      })}
    </nav>
  );
}
