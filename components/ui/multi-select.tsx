import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Check, ChevronDown, X, XCircle } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@components/ui/popover';
import { Badge } from '@components/ui/badge';
import { Separator } from '@components/ui/separator';

/**
 * Variants for the multi-select component to handle different styles.
 * Uses class-variance-authority (cva) to define different styles based on "variant" prop.
 */
const multiSelectVariants = cva('m-1 transition-all duration-200 ease-in-out', {
  variants: {
    variant: {
      default: 'border-foreground/10 text-foreground bg-card hover:bg-card/80',
      secondary: 'border-foreground/10 bg-secondary text-secondary-foreground hover:bg-secondary/80',
      destructive: 'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
      inverted: 'inverted',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export type OptionType = {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
};

interface MultiSelectProps
  extends
    Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'defaultValue' | 'onChange'>,
    VariantProps<typeof multiSelectVariants> {
  options: OptionType[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  className?: string;
  /** Maximum number of items to display. Extra selected items will be summarized. */
  maxCount?: number;
  /** The modality of the popover. */
  modal?: boolean;
  /** If true, hides the select all option */
  hideSelectAll?: boolean;
  /** If true, hides the search input */
  hideClearAll?: boolean;
  /** Custom empty state message */
  emptyMessage?: string;
}

export function MultiSelect({
  options,
  selected,
  onChange,
  className,
  placeholder = '선택하세요...',
  maxCount = 3,
  modal = false,
  variant,
  hideSelectAll = false,
  hideClearAll = false,
  emptyMessage = '검색 결과가 없습니다.',
  ...props
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);

  const handleUnselect = (item: string) => {
    onChange(selected.filter((i) => i !== item));
  };

  const handleClear = () => {
    onChange([]);
  };

  const toggleAll = () => {
    const enabledOptions = options.filter((opt) => !opt.disabled);
    if (selected.length === enabledOptions.length) {
      onChange([]);
    } else {
      onChange(enabledOptions.map((opt) => opt.value));
    }
  };

  const toggleOption = (value: string) => {
    onChange(selected.includes(value) ? selected.filter((i) => i !== value) : [...selected, value]);
  };

  return (
    <Popover open={open} onOpenChange={setOpen} modal={modal}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'bg-background hover:bg-background flex h-auto min-h-10 w-full items-center justify-between rounded-md border border-slate-300 p-1 [&_svg]:pointer-events-auto',
            className,
          )}
          onClick={() => setOpen(!open)}
          {...props}
        >
          {selected.length > 0 ? (
            <div className="flex w-full items-center justify-between">
              <div className="flex flex-wrap items-center gap-1">
                {selected.slice(0, maxCount).map((value) => {
                  const option = options.find((opt) => opt.value === value);
                  if (!option) return null;
                  const IconComponent = option.icon;

                  return (
                    <Badge
                      key={value}
                      className={cn(multiSelectVariants({ variant }))}
                      style={{ animationDuration: '0.2s' }}
                    >
                      {IconComponent && <IconComponent className="mr-2 h-4 w-4" />}
                      <span>{option.label}</span>
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleUnselect(value);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            e.stopPropagation();
                            handleUnselect(value);
                          }
                        }}
                        aria-label={`${option.label} 제거`}
                        className="-m-0.5 ml-2 h-4 w-4 cursor-pointer rounded-sm p-0.5 hover:bg-white/20 focus:ring-1 focus:ring-white/50 focus:outline-none"
                      >
                        <XCircle className="h-3 w-3" />
                      </div>
                    </Badge>
                  );
                })}
                {selected.length > maxCount && (
                  <Badge
                    className={cn(
                      'border-foreground/1 text-foreground bg-transparent hover:bg-transparent',
                      multiSelectVariants({ variant }),
                    )}
                  >
                    {`+ ${selected.length - maxCount}개 더`}
                    <XCircle
                      className="ml-2 h-4 w-4 cursor-pointer"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        // Clear the extra items beyond maxCount
                        onChange(selected.slice(0, maxCount));
                      }}
                    />
                  </Badge>
                )}
              </div>
              <div className="flex items-center justify-between">
                {!hideClearAll && (
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleClear();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        e.stopPropagation();
                        handleClear();
                      }
                    }}
                    aria-label="모두 지우기"
                    className="text-muted-foreground hover:text-foreground focus:ring-ring mx-2 flex h-4 w-4 cursor-pointer items-center justify-center rounded-sm focus:ring-2 focus:ring-offset-1 focus:outline-none"
                  >
                    <X className="h-4 w-4" />
                  </div>
                )}
                <Separator orientation="vertical" className="flex h-full min-h-6" />
                <ChevronDown className="text-muted-foreground mx-2 h-4 cursor-pointer" aria-hidden="true" />
              </div>
            </div>
          ) : (
            <div className="mx-auto flex w-full items-center justify-between">
              <span className="text-muted-foreground mx-3 text-sm">{placeholder}</span>
              <ChevronDown className="text-muted-foreground mx-2 h-4 cursor-pointer" />
            </div>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] border-slate-300 p-0" align="start">
        <Command>
          <CommandInput placeholder="검색..." />
          <CommandList className="max-h-64 overflow-y-auto">
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            {!hideSelectAll && (
              <CommandGroup>
                <CommandItem
                  key="all"
                  onSelect={toggleAll}
                  className="cursor-pointer"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  aria-selected={selected.length === options.filter((opt) => !opt.disabled).length}
                >
                  <div
                    className={cn(
                      'border-primary mr-2 flex h-4 w-4 items-center justify-center rounded-sm border',
                      selected.length === options.filter((opt) => !opt.disabled).length
                        ? 'bg-primary text-primary-foreground'
                        : 'opacity-50 [&_svg]:invisible',
                    )}
                  >
                    <Check className="h-4 w-4" />
                  </div>
                  <span>(전체 선택)</span>
                </CommandItem>
              </CommandGroup>
            )}
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selected.includes(option.value);
                const IconComponent = option.icon;

                return (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    disabled={option.disabled}
                    onSelect={() => toggleOption(option.value)}
                    className="cursor-pointer"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    aria-selected={isSelected}
                  >
                    <div
                      className={cn(
                        'border-primary mr-2 flex h-4 w-4 items-center justify-center rounded-sm border',
                        isSelected ? 'bg-primary text-primary-foreground' : 'opacity-50 [&_svg]:invisible',
                      )}
                    >
                      <Check className="h-4 w-4" />
                    </div>
                    {IconComponent && <IconComponent className="text-muted-foreground mr-2 h-4 w-4" />}
                    {option.label}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
