import * as React from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';

import { cn } from '@/lib/utils';

const Popover = PopoverPrimitive.Root;

const PopoverTrigger = PopoverPrimitive.Trigger;

interface PopoverContentProps extends React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content> {
  portalled?: boolean;
}

const PopoverContent = React.forwardRef<React.ElementRef<typeof PopoverPrimitive.Content>, PopoverContentProps>(
  ({ className, align = 'center', sideOffset = 4, portalled = true, ...props }, ref) => {
    const content = (
      <PopoverPrimitive.Content
        ref={ref}
        align={align}
        sideOffset={sideOffset}
        className={cn(
          'bg-popover text-popover-foreground z-[9999] w-72 origin-[--radix-popover-content-transform-origin] rounded-md border border-slate-300 p-4 opacity-100 shadow-md transition-[opacity,transform] duration-150 ease-[var(--ease-ui-out)] outline-none data-[state=closed]:scale-95 data-[state=closed]:opacity-0 data-[state=open]:scale-100 data-[state=open]:opacity-100 motion-reduce:transition-opacity',
          className,
        )}
        {...props}
      />
    );

    return portalled ? <PopoverPrimitive.Portal>{content}</PopoverPrimitive.Portal> : content;
  },
);
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

export { Popover, PopoverTrigger, PopoverContent };
