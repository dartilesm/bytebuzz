"use client";

import type * as React from "react";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import { useIntersectionObserver } from "usehooks-ts";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const scrollShadowVariants = cva(
  "pointer-events-none absolute from-card to-transparent transition-opacity duration-300 z-10",
  {
    variants: {
      orientation: {
        vertical: "left-0 right-0",
        horizontal: "top-0 bottom-0",
      },
      size: {
        sm: "",
        md: "",
        lg: "",
      },
      visibility: {
        top: "top-0 bg-gradient-to-b",
        bottom: "bottom-0 bg-gradient-to-t",
        left: "left-0 bg-gradient-to-r",
        right: "right-0 bg-gradient-to-l",
      },
    },
    compoundVariants: [
      {
        orientation: "vertical",
        size: "sm",
        class: "h-8",
      },
      {
        orientation: "vertical",
        size: "md",
        class: "h-12",
      },
      {
        orientation: "vertical",
        size: "lg",
        class: "h-16",
      },
      {
        orientation: "horizontal",
        size: "sm",
        class: "w-8",
      },
      {
        orientation: "horizontal",
        size: "md",
        class: "w-12",
      },
      {
        orientation: "horizontal",
        size: "lg",
        class: "w-16",
      },
    ],
    defaultVariants: {
      orientation: "vertical",
      size: "md",
      visibility: "top",
    },
  }
);

interface ScrollAreaProps
  extends React.ComponentProps<typeof ScrollAreaPrimitive.Root>,
    VariantProps<typeof scrollShadowVariants> {
  shadowVisibility?: "top" | "bottom" | "left" | "right" | "both" | "none";
  shadowSize?: "sm" | "md" | "lg";
  orientation?: "vertical" | "horizontal";
  shadowClassName?: string;
}

function ScrollArea({
  className,
  children,
  shadowVisibility,
  shadowSize = "md",
  orientation = "vertical",
  shadowClassName,
  ...props
}: ScrollAreaProps) {
  const { isIntersecting: isStartIntersecting, ref: startSentinelRef } = useIntersectionObserver({
    threshold: 0,
    rootMargin: "0px",
  });
  const { isIntersecting: isEndIntersecting, ref: endSentinelRef } = useIntersectionObserver({
    threshold: 0,
    rootMargin: "0px",
  });

  const isVertical = orientation === "vertical";

  const showStartShadow =
    (shadowVisibility === undefined ||
      shadowVisibility === "both" ||
      shadowVisibility === (isVertical ? "top" : "left")) &&
    !isStartIntersecting;

  const showEndShadow =
    (shadowVisibility === undefined ||
      shadowVisibility === "both" ||
      shadowVisibility === (isVertical ? "bottom" : "right")) &&
    !isEndIntersecting;

  return (
    <ScrollAreaPrimitive.Root
      data-slot='scroll-area'
      className={cn("relative", className)}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport
        data-slot='scroll-area-viewport'
        className='focus-visible:ring-ring/50 size-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:outline-1 [&>div]:relative [&>div]:overflow-hidden'
      >
        {/* Start Sentinel */}
        <div
          ref={startSentinelRef}
          className={cn("absolute pointer-events-none", {
            "h-px w-full top-0": isVertical,
            "w-px h-full left-0": !isVertical,
          })}
        />

        {children}

        {/* End Sentinel */}
        <div
          ref={endSentinelRef}
          className={cn("absolute pointer-events-none", {
            "h-px w-full bottom-0": isVertical,
            "w-px h-full right-0": !isVertical,
          })}
        />
      </ScrollAreaPrimitive.Viewport>

      {/* Start Gradient */}
      <div
        className={cn(
          scrollShadowVariants({
            orientation,
            size: shadowSize,
            visibility: isVertical ? "top" : "left",
          }),
          shadowClassName,
          showStartShadow ? "opacity-100" : "opacity-0"
        )}
      />

      {/* End Gradient */}
      <div
        className={cn(
          scrollShadowVariants({
            orientation,
            size: shadowSize,
            visibility: isVertical ? "bottom" : "right",
          }),
          shadowClassName,
          showEndShadow ? "opacity-100" : "opacity-0"
        )}
      />

      <ScrollBar orientation={orientation} />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  );
}

function ScrollBar({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>) {
  return (
    <ScrollAreaPrimitive.ScrollAreaScrollbar
      data-slot='scroll-area-scrollbar'
      orientation={orientation}
      className={cn(
        "flex touch-none p-px transition-colors select-none",
        orientation === "vertical" && "h-full w-2.5 border-l border-l-transparent",
        orientation === "horizontal" && "h-2.5 flex-col border-t border-t-transparent",
        className
      )}
      {...props}
    >
      <ScrollAreaPrimitive.ScrollAreaThumb
        data-slot='scroll-area-thumb'
        className='bg-border relative flex-1 rounded-full'
      />
    </ScrollAreaPrimitive.ScrollAreaScrollbar>
  );
}

export { ScrollArea, ScrollBar };
