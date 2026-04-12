'use client';

import * as React from 'react';
import { Popover as PopoverPrimitive } from 'radix-ui';

import { cn } from '@/lib/utils';

function Popover({
    ...props
}: React.ComponentProps<typeof PopoverPrimitive.Root>) {
    return <PopoverPrimitive.Root data-slot="popover" {...props} />;
}

function PopoverTrigger({
    ...props
}: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
    return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />;
}

function PopoverPortal({
    ...props
}: React.ComponentProps<typeof PopoverPrimitive.Portal>) {
    return <PopoverPrimitive.Portal data-slot="popover-portal" {...props} />;
}

function PopoverContent({
    className,
    align = 'center',
    sideOffset = 8,
    ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content>) {
    return (
        <PopoverPortal>
            <PopoverPrimitive.Content
                data-slot="popover-content"
                align={align}
                sideOffset={sideOffset}
                className={cn(
                    'z-50 w-72 rounded-3xl p-2 text-popover-foreground shadow-2xl ring-1 ring-white/10 outline-none glass data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-open:slide-in-from-bottom-2 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 data-closed:slide-out-to-bottom-2',
                    className,
                )}
                {...props}
            />
        </PopoverPortal>
    );
}

function PopoverAnchor({
    ...props
}: React.ComponentProps<typeof PopoverPrimitive.Anchor>) {
    return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />;
}

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor };
