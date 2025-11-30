"use client";

import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import type * as React from "react";

import { cn } from "@/lib/utils";

function TooltipProvider({
  delayDuration = 0,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      {...props}
    />
  );
}

function Tooltip({ ...props }: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return (
    <TooltipProvider>
      <TooltipPrimitive.Root data-slot="tooltip" {...props} />
    </TooltipProvider>
  );
}

function TooltipTrigger({ ...props }: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}

function TooltipContent({
  className,
  sideOffset = 0,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className="z-50 group/tooltip"
        {...props}
      >
        <div
          className={cn(
            "relative bg-card text-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 w-fit origin-(--radix-tooltip-content-transform-origin) rounded-md px-3 py-1.5 text-xs text-balance border-border border shadow-sm -z-10",
            className,
          )}
        >
          {children}
        </div>
        <TooltipPrimitive.Arrow className="bg-card fill-card size-2.5 translate-y-[calc(-50%-2px)] group-data-[side=bottom]/tooltip:translate-x-[calc(-50%+2px)] group-data-[side=top]/tooltip:translate-x-[calc(50%-2px)] rotate-45 rounded-[2px] border-border border shadow-sm" />
        <TooltipPrimitive.Arrow className="bg-card fill-card w-4 h-2 translate-y-[calc(-50%-5px)] -translate-x-1" />
        <TooltipPrimitive.Arrow className="bg-card fill-card w-4 h-2 translate-y-[calc(-50%-5px)] translate-x-1" />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
