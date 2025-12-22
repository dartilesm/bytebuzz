"use client";

import type * as React from "react";
import { findImageSrcInChildren } from "@/components/ui/gradient-background/functions/find-image-src-in-children";
import { useGradientColors } from "@/hooks/use-gradient-colors";
import { generateGradientFromColors } from "@/lib/image-color-extractor";
import { cn } from "@/lib/utils";

interface GradientBackgroundProps {
  /**
   * Image URL to extract colors from
   * If not provided, will attempt to extract from img elements in children
   */
  imageUrl?: string;
  /**
   * Pre-computed colors (for SSR or performance optimization)
   * Takes precedence over imageUrl
   */
  colors?: string[];
  /**
   * Content to wrap with gradient background
   */
  children: React.ReactNode;
  /**
   * Gradient direction (default: "to bottom")
   */
  direction?: string;
  /**
   * Blur amount in pixels (default: 40)
   */
  blur?: number;
  /**
   * Gradient opacity 0-1 (default: 0.6)
   */
  opacity?: number;
  /**
   * Fallback CSS gradient if color extraction fails
   */
  fallbackGradient?: string;
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Component that extracts dominant colors from an image and generates a gradient backdrop
 */
export function GradientBackground({
  imageUrl: providedImageUrl,
  colors: providedColors,
  children,
  direction = "to bottom",
  blur = 40,
  opacity = 0.6,
  fallbackGradient = "linear-gradient(to bottom, #667eea, #764ba2)",
  className,
}: GradientBackgroundProps) {
  // Detect image in children if no imageUrl provided
  const detectedImageUrl =
    !providedImageUrl && !providedColors ? findImageSrcInChildren(children) : null;

  // Determine which image URL to use
  const imageUrl = providedImageUrl || detectedImageUrl || undefined;

  // Extract colors using hook
  const { colors, isLoading } = useGradientColors({
    imageUrl,
    colors: providedColors,
    colorCount: 5,
  });

  // Generate gradient CSS
  const gradient =
    colors.length > 0 ? generateGradientFromColors(colors, direction) : fallbackGradient;

  return (
    <div className={cn("relative", className)}>
      {/* Gradient backdrop */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background: gradient,
          filter: `blur(${blur}px)`,
          opacity: isLoading ? 0 : opacity,
          transition: "opacity 0.3s ease-in-out",
        }}
      />
      {/* Content */}
      {children}
    </div>
  );
}
