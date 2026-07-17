'use client';

import * as React from 'react';
import { Check, ChevronDown, Search } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@components/ui/popover';
import { cn } from '@/lib/utils';

export type Option = {
  label: string;
  value: string;
};

interface MultiSelectProps {
  id?: string;
  options: Option[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  optionName?: string;
  ariaLabel?: string;
  portalled?: boolean;
  className?: string;
}

export function MultiSelect({
  id,
  options,
  selected,
  onChange,
  placeholder = '선택…',
  searchPlaceholder,
  optionName = '선택지',
  ariaLabel,
  portalled = true,
  className,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const selectedLabels = selected.map((value) => options.find((option) => option.value === value)?.label || value);

  const filteredOptions = options.filter(
    (option) =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      option.value.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleSelect = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((item) => item !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) setSearchTerm('');
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          id={id}
          type="button"
          role="combobox"
          aria-label={ariaLabel || placeholder}
          aria-expanded={open}
          className={cn(
            'border-input ring-offset-background flex min-h-10 w-full touch-manipulation items-center gap-2 rounded-md border border-slate-300 bg-transparent px-3 py-2 text-left text-sm shadow-sm transition-[background-color,border-color,color] hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none dark:border-slate-700 dark:hover:bg-slate-900',
            className,
          )}
        >
          <span className={cn('min-w-0 flex-1 truncate', selected.length === 0 && 'text-muted-foreground')}>
            {selectedLabels.length > 0 ? selectedLabels.join(', ') : placeholder}
          </span>
          {selected.length > 0 && (
            <span className="shrink-0 rounded bg-blue-50 px-1.5 py-0.5 text-xs font-semibold text-blue-700 tabular-nums dark:bg-blue-950 dark:text-blue-300">
              {selected.length}
            </span>
          )}
          <ChevronDown aria-hidden="true" className="h-4 w-4 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        portalled={portalled}
        className="z-[100] w-[var(--radix-popover-trigger-width)] max-w-[calc(100vw-2rem)] min-w-[18rem] overflow-hidden p-0"
        align="start"
      >
        <div className="flex items-center gap-2 border-b border-slate-200 px-3 dark:border-slate-800">
          <Search aria-hidden="true" className="h-4 w-4 shrink-0 text-slate-400" />
          <input
            name="multi-select-search"
            autoComplete="off"
            className="placeholder:text-muted-foreground flex h-11 w-full min-w-0 bg-transparent py-3 text-sm focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            aria-label={`${optionName} 검색`}
            placeholder={searchPlaceholder || `${optionName} 검색…`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div
          className="max-h-80 overflow-y-auto overscroll-contain p-1.5"
          role="listbox"
          aria-label={optionName}
          aria-multiselectable="true"
        >
          {filteredOptions.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center text-sm">검색 결과가 없습니다.</p>
          ) : (
            filteredOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={selected.includes(option.value)}
                className={cn(
                  'hover:bg-accent hover:text-accent-foreground relative flex min-h-9 w-full touch-manipulation items-center rounded-md px-2.5 py-2 text-left text-sm transition-colors focus-visible:bg-blue-50 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none dark:focus-visible:bg-blue-950',
                  selected.includes(option.value) && 'bg-accent/50',
                )}
                onClick={() => handleSelect(option.value)}
              >
                <div
                  className={cn(
                    'border-primary mr-2 flex h-4 w-4 items-center justify-center rounded-sm border',
                    selected.includes(option.value)
                      ? 'bg-primary text-primary-foreground'
                      : 'opacity-50 [&_svg]:invisible',
                  )}
                >
                  <Check aria-hidden="true" className="h-4 w-4" />
                </div>
                <span className="min-w-0 flex-1 truncate">{option.label}</span>
              </button>
            ))
          )}
        </div>
        <p
          className="border-t border-slate-200 px-3 py-2 text-xs font-medium text-slate-500 tabular-nums dark:border-slate-800 dark:text-slate-400"
          aria-live="polite"
        >
          {searchTerm
            ? `검색 결과 ${filteredOptions.length}개 / 전체 ${options.length}개 ${optionName}`
            : `전체 ${options.length}개 ${optionName}`}
        </p>
      </PopoverContent>
    </Popover>
  );
}
