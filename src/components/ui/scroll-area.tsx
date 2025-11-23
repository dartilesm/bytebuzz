"use client"

import type * as React from "react"
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area"
import { useIntersectionObserver } from "usehooks-ts"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const scrollShadowVariants = cva(
  "pointer-events-none absolute left-0 right-0 bg-gradient-to-b from-card to-transparent transition-opacity duration-300 z-10",
  {
    variants: {
      size: {
        sm: "h-8",
        md: "h-12",
        lg: "h-16",
      },
      orientation: {
        top: "top-0 bg-gradient-to-b",
        bottom: "bottom-0 bg-gradient-to-t",
      },
    },
    defaultVariants: {
      size: "md",
      orientation: "top",
    },
  }
)

interface ScrollAreaProps
  extends React.ComponentProps<typeof ScrollAreaPrimitive.Root>,
  VariantProps<typeof scrollShadowVariants> {
  shadowVisibility?: "top" | "bottom" | "both" | "none"
  shadowSize?: "sm" | "md" | "lg"
}

function ScrollArea({
  className,
  children,
  shadowVisibility,
  shadowSize = "md",
  ...props
}: ScrollAreaProps) {
  const { isIntersecting: isTopIntersecting, ref: topSentinelRef } = useIntersectionObserver({
    threshold: 0,
    rootMargin: "0px",
  })
  const { isIntersecting: isBottomIntersecting, ref: bottomSentinelRef } = useIntersectionObserver({
    threshold: 0,
    rootMargin: "0px",
  })

  const showTopShadow =
    shadowVisibility === "top" ||
    shadowVisibility === "both" ||
    (shadowVisibility === undefined && !isTopIntersecting)

  const showBottomShadow =
    shadowVisibility === "bottom" ||
    shadowVisibility === "both" ||
    (shadowVisibility === undefined && !isBottomIntersecting)

  // If shadowVisibility is "none", force hide both
  const isTopVisible = shadowVisibility === "none" ? false : showTopShadow
  const isBottomVisible = shadowVisibility === "none" ? false : showBottomShadow

  return (
    <ScrollAreaPrimitive.Root
      data-slot="scroll-area"
      className={cn("relative", className)}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport
        data-slot="scroll-area-viewport"
        className="focus-visible:ring-ring/50 size-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:outline-1"
      >
        {/* Top Sentinel */}
        <div ref={topSentinelRef} className="h-px w-full absolute top-0 pointer-events-none opacity-0" />

        {children}

        {/* Bottom Sentinel */}
        <div ref={bottomSentinelRef} className="h-px w-full absolute bottom-0 pointer-events-none opacity-0" />
      </ScrollAreaPrimitive.Viewport>

      {/* Top Gradient */}
      <div
        className={cn(
          scrollShadowVariants({ size: shadowSize, orientation: "top" }),
          isTopVisible ? "opacity-100" : "opacity-0"
        )}
      />

      {/* Bottom Gradient */}
      <div
        className={cn(
          scrollShadowVariants({ size: shadowSize, orientation: "bottom" }),
          isBottomVisible ? "opacity-100" : "opacity-0"
        )}
      />

      <ScrollBar />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  )
}

function ScrollBar({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>) {
  return (
    <ScrollAreaPrimitive.ScrollAreaScrollbar
      data-slot="scroll-area-scrollbar"
      orientation={orientation}
      className={cn(
        "flex touch-none p-px transition-colors select-none",
        orientation === "vertical" &&
        "h-full w-2.5 border-l border-l-transparent",
        orientation === "horizontal" &&
        "h-2.5 flex-col border-t border-t-transparent",
        className
      )}
      {...props}
    >
      <ScrollAreaPrimitive.ScrollAreaThumb
        data-slot="scroll-area-thumb"
        className="bg-border relative flex-1 rounded-full"
      />
    </ScrollAreaPrimitive.ScrollAreaScrollbar>
  )
}

export { ScrollArea, ScrollBar }
