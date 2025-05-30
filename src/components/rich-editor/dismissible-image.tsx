"use client";

import { Button, cn, Image, type ImageProps } from "@heroui/react";
import { useHover } from "@uidotdev/usehooks";
import { CrossIcon, XIcon } from "lucide-react";

interface DismissibleImageProps extends Omit<ImageProps, "onLoad" | "onError"> {
  /**
   * Callback function called when the dismiss button is clicked
   */
  onDismiss?: () => void;
  /**
   * Whether to show the dismiss button
   * @default true
   */
  showDismiss?: boolean;
}

/**
 * A dismissible image component that renders an image with a cross icon
 * at the top-right corner for self-elimination functionality
 */
export function DismissibleImage({
  onDismiss,
  showDismiss = true,
  className = "w-12 h-12",
  classNames,
  ...imageProps
}: DismissibleImageProps) {
  const [hoverRef, isImageHovered] = useHover();

  /**
   * Handles the dismiss button click event
   */
  function handleDismiss() {
    onDismiss?.();
  }

  return (
    <div className="relative inline-block group w-fit" ref={hoverRef}>
      <Image
        className={className}
        classNames={{
          wrapper: cn("border border-default-300", classNames?.wrapper),
          img: cn("object-cover", classNames?.img),
          blurredImg: cn(classNames?.blurredImg),
          zoomedWrapper: cn(classNames?.zoomedWrapper),
        }}
        {...imageProps}
      />
      <div className="absolute -top-2 -right-2 rounded-full p-1 size-6 flex items-center justify-center z-10 bg-transparent has-[button]:hover:bg-default-300 has-[button]:dark:hover:bg-content4 transition-background duration-200">
        <Button
          isIconOnly
          size="sm"
          radius="full"
          variant="solid"
          className="text-gray-500 dark:bg-content2 bg-default-200 transition-opacity size-4  rounded-full flex items-center justify-center min-w-auto opacity-0 group-hover:opacity-100 border-2 dark:border-default-50 border-default-50"
          onPress={handleDismiss}
          aria-label="Remove image"
          tabIndex={isImageHovered ? 0 : -1} // Only focusable when hovered
        >
          <XIcon size={10} />
        </Button>
      </div>
    </div>
  );
}
