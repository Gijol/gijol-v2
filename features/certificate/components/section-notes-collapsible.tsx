'use client';

import { ChevronDown, Info } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { sectionNotes } from '@/features/certificate/section-notes';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export function SectionNotesCollapsible({ stepIndex }: { stepIndex: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const notes = sectionNotes[stepIndex];

  if (!notes) return null;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mb-4">
      <CollapsibleTrigger className="flex w-full items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-left text-sm font-medium text-amber-800 transition-colors hover:bg-amber-100">
        <Info className="h-4 w-4 shrink-0" />
        <span className="flex-1">{notes.title}</span>
        <ChevronDown className={cn('h-4 w-4 shrink-0 transition-transform duration-200', isOpen && 'rotate-180')} />
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-2">
        <div className="rounded-lg border border-amber-100 bg-amber-50/50 p-4">
          <ul className="space-y-2 text-sm text-amber-900">
            {notes.items.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="mt-0.5 text-amber-500">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
