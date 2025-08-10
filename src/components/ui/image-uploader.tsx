"use client";

import { cn } from "@/lib/utils";
import { CameraIcon, ImageIcon, type LucideIcon } from "lucide-react";
import { createElement, useRef, type ReactNode } from "react";

const aspect_ratios = ["1:1", "3:1", "16:9", "4:3", "3:2", "2:1", "11:4"] as const;

type AspectRatio = (typeof aspect_ratios)[number];

interface ImageUploaderProps {
  /** Callback function when image file is selected */
  onImageChange: (file: File) => void;
  /** Aspect ratio for the image container (e.g., "1:1", "3:1", "16:9") */
  aspectRatio?: AspectRatio;
  /** Children components to render inside the uploader */
  children?: ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Custom upload area content when no image is present */
  uploadContent?: {
    icon?: LucideIcon;
    iconSize?: number;
    title?: string;
    description?: string;
  };
  /** Configuration for file validation */
  validation?: {
    maxSize?: number; // in bytes
    allowedTypes?: string[];
  };
  /** Whether to show hover overlay when image is present */
  showHoverOverlay?: boolean;
  /** Custom hover overlay content */
  hoverOverlayContent?: {
    icon?: LucideIcon;
    iconSize?: number;
    text?: string;
  };
  /** Whether the uploader is disabled */
  disabled?: boolean;
}

/**
 * Generic ImageUploader component for handling file selection and validation
 * Supports customizable aspect ratios, descriptions, validation, and hover effects
 *
 * @param onImageChange - Callback function when image file is selected
 * @param aspectRatio - Aspect ratio for the image container
 * @param children - Child components to render
 * @param className - Additional CSS classes
 * @param uploadContent - Custom content for upload area
 * @param validation - File validation configuration
 * @param showHoverOverlay - Whether to show hover overlay on images
 * @param hoverOverlayContent - Custom hover overlay content
 * @param disabled - Whether the uploader is disabled
 */
export function ImageUploader({
  onImageChange,
  aspectRatio = "1:1",
  children,
  className = "",
  uploadContent = {
    icon: ImageIcon,
    iconSize: 24,
    title: "Click to upload image",
    description: undefined,
  },
  validation = {
    maxSize: 5 * 1024 * 1024, // 5MB default
    allowedTypes: ["image/*"],
  },
  showHoverOverlay = true,
  hoverOverlayContent = {
    icon: CameraIcon,
    iconSize: 24,
    text: "Click to change",
  },
  disabled = false,
}: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Validates the selected file against the validation rules
   */
  function validateFile(file: File): { isValid: boolean; error?: string } {
    // Check file type
    if (validation.allowedTypes && validation.allowedTypes.length > 0) {
      const isValidType = validation.allowedTypes.some((type) => {
        if (type === "image/*") {
          return file.type.startsWith("image/");
        }
        return file.type === type;
      });

      if (!isValidType) {
        return {
          isValid: false,
          error: "Please select a valid image file.",
        };
      }
    }

    // Check file size
    if (validation.maxSize && file.size > validation.maxSize) {
      const maxSizeMB = (validation.maxSize / (1024 * 1024)).toFixed(1);
      return {
        isValid: false,
        error: `File size must be less than ${maxSizeMB}MB.`,
      };
    }

    return { isValid: true };
  }

  /**
   * Handles file selection and passes the file to the parent component
   */
  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>): void {
    const files = event.target.files;

    if (files && files.length > 0) {
      const file = files[0];

      // Validate file
      const validationResult = validateFile(file);
      if (!validationResult.isValid) {
        alert(validationResult.error);
        return;
      }

      // Pass the file to the parent component
      onImageChange(file);

      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  /**
   * Triggers the hidden file input when the component is clicked
   */
  function triggerFileInput(event: React.MouseEvent): void {
    if (disabled) return;

    // Prevent triggering file input if clicking on a button
    const target = event.target as HTMLElement;
    if (target.closest("button")) {
      return;
    }

    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }

  const CustomImageIcon = createElement(uploadContent.icon || ImageIcon, {
    size: uploadContent.iconSize || 24,
    className: "mb-2",
  });

  const CustomHoverOverlayIcon = createElement(hoverOverlayContent.icon || CameraIcon, {
    size: hoverOverlayContent.iconSize || 24,
    className: "mb-1",
  });

  return (
    <div
      className={cn(
        "cursor-pointer overflow-hidden",
        {
          "opacity-50 cursor-not-allowed": disabled,
          "aspect-[11/4]": aspectRatio === "11:4",
          "aspect-[2/1]": aspectRatio === "2:1",
          "aspect-[3/2]": aspectRatio === "3:2",
          "aspect-[4/3]": aspectRatio === "4:3",
          "aspect-video": aspectRatio === "16:9",
          "aspect-[3/1]": aspectRatio === "3:1",
          "aspect-square": aspectRatio === "1:1",
        },
        className,
      )}
      onClick={triggerFileInput}
    >
      {children || (
        <div className="w-full h-full bg-default-100 flex items-center justify-center border-2 border-dashed border-default-300 hover:border-default-400 transition-colors rounded-lg">
          <div className="flex flex-col items-center justify-center text-default-500 p-4">
            {CustomImageIcon}
            {uploadContent.title && <p className="text-small text-center">{uploadContent.title}</p>}
            {uploadContent.description && (
              <p className="text-tiny text-center text-default-400 mt-1">
                {uploadContent.description}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Hover overlay for existing images */}
      {showHoverOverlay && children && (
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
          <div className="flex flex-col items-center text-white">
            {CustomHoverOverlayIcon}
            <p className="text-small">{hoverOverlayContent.text || "Click to change"}</p>
          </div>
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={validation.allowedTypes?.join(",") || "image/*"}
        className="hidden"
        aria-label="Upload image"
        disabled={disabled}
      />
    </div>
  );
}
