'use client';

import * as React from 'react';
import { X, ChevronDown, Check } from 'lucide-react';
import { Badge } from '@components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@components/ui/popover';
import { cn } from '@/lib/utils';

export type Option = {
  label: string;
  value: string;
};

interface MultiSelectProps {
  options: Option[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = 'Select items...',
  className,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');

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

  const handleRemove = (value: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selected.filter((item) => item !== value));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div
          role="combobox"
          aria-expanded={open}
          className={cn(
            'border-input ring-offset-background hover:bg-accent/5 flex w-full cursor-pointer flex-wrap items-center justify-between rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm shadow-sm',
            className,
          )}
        >
          <div className="flex flex-wrap gap-1">
            {selected.length === 0 && <span className="text-muted-foreground">{placeholder}</span>}
            {selected.map((value) => {
              const label = options.find((o) => o.value === value)?.label || value;
              return (
                <Badge key={value} variant="secondary" className="mr-1">
                  {label}
                  <button
                    className="ring-offset-background focus:ring-ring ml-1 rounded-full outline-none focus:ring-2 focus:ring-offset-2"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onClick={(e) => handleRemove(value, e)}
                  >
                    <X className="text-muted-foreground hover:text-foreground h-3 w-3" />
                  </button>
                </Badge>
              );
            })}
          </div>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-full max-w-[300px] p-0 z-[100]" align="start">
        <div className="flex items-center border-b px-3">
          <input
            className="placeholder:text-muted-foreground flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="max-h-[200px] overflow-y-auto p-1">
          {filteredOptions.length === 0 ? (
            <p className="text-muted-foreground py-6 text-center text-sm">No items found.</p>
          ) : (
            filteredOptions.map((option) => (
              <div
                key={option.value}
                className={cn(
                  'hover:bg-accent hover:text-accent-foreground relative flex cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm outline-none select-none',
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
                  <Check className="h-4 w-4" />
                </div>
                {option.label}
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
