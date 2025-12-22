"use client";

import Image from "next/image";
import type * as React from "react";
import { cn } from "@/lib/utils";

interface GradientBackgroundProps {
  /**
   * Image URL to use as blurred background
   */
  imageUrl: string;
  /**
   * Content to wrap with blurred background
   */
  children: React.ReactNode;
  /**
   * Blur amount in pixels (default: 40)
   */
  blur?: number;
  /**
   * Background opacity 0-1 (default: 0.6)
   */
  opacity?: number;
  /**
   * Overlay to apply on top of background for better text readability
   * @default "rgba(0, 0, 0, 0.3)"
   */
  overlay?: string;
  /**
   * Scale factor for the background image (creates zoom effect to hide blur edges)
   * @default 1.1
   */
  backgroundScale?: number;
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Component that renders a blurred image as background
 */
export function GradientBackground({
  imageUrl,
  children,
  blur = 40,
  opacity = 0.6,
  overlay = "rgba(0, 0, 0, 0.3)",
  backgroundScale = 1.1,
  className,
}: GradientBackgroundProps) {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      <Image
        src={imageUrl}
        alt=""
        fill
        className="absolute inset-0 -z-10 object-cover"
        style={{
          filter: `blur(${blur}px)`,
          transform: `scale(${backgroundScale})`,
          opacity,
          transition: "opacity 0.3s ease-in-out",
        }}
        unoptimized
      />
      {overlay && <div className="absolute inset-0 -z-10" style={{ backgroundColor: overlay }} />}
      {children}
    </div>
  );
}
