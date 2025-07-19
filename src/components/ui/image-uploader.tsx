"use client";

import { Icon } from "@iconify/react";
import React from "react";

interface ImageUploaderProps {
  /** Callback function when image is uploaded */
  onImageUpload: (imageUrl: string) => void;
  /** Aspect ratio for the image container (e.g., "1:1", "3:1", "16:9") */
  aspectRatio?: string;
  /** Children components to render inside the uploader */
  children?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Custom upload area content when no image is present */
  uploadContent?: {
    icon?: string;
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
    icon?: string;
    iconSize?: number;
    text?: string;
  };
  /** Whether the uploader is disabled */
  disabled?: boolean;
}

/**
 * Generic ImageUploader component for handling file uploads and generating blob URLs
 * Supports customizable aspect ratios, descriptions, validation, and hover effects
 *
 * @param onImageUpload - Callback function when image is uploaded
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
  onImageUpload,
  aspectRatio = "1:1",
  children,
  className = "",
  uploadContent = {
    icon: "lucide:image",
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
    icon: "lucide:camera",
    iconSize: 24,
    text: "Click to change",
  },
  disabled = false,
}: ImageUploaderProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  /**
   * Gets the height based on aspect ratio for responsive design
   */
  function getAspectRatioHeight(): string {
    const ratioMap: Record<string, string> = {
      "1:1": "aspect-square",
      "3:1": "aspect-[3/1]",
      "16:9": "aspect-video",
      "4:3": "aspect-[4/3]",
      "3:2": "aspect-[3/2]",
      "2:1": "aspect-[2/1]",
    };

    return ratioMap[aspectRatio] || "aspect-square";
  }

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
   * Handles file selection and creates a blob URL for the selected image
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

      // Create blob URL for immediate preview
      const blobUrl = URL.createObjectURL(file);
      onImageUpload(blobUrl);

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

  return (
    <div
      className={`cursor-pointer ${getAspectRatioHeight()} ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
      onClick={triggerFileInput}
    >
      {children || (
        <div className="w-full h-full bg-default-100 flex items-center justify-center border-2 border-dashed border-default-300 hover:border-default-400 transition-colors rounded-lg">
          <div className="flex flex-col items-center justify-center text-default-500 p-4">
            <Icon
              icon={uploadContent.icon || "lucide:image"}
              width={uploadContent.iconSize || 24}
              className="mb-2"
            />
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
            <Icon
              icon={hoverOverlayContent.icon || "lucide:camera"}
              width={hoverOverlayContent.iconSize || 24}
              className="mb-1"
            />
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
