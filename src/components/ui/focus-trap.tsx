import { type ReactNode, type RefObject, useEffect, useRef } from "react";
import { useEventListener } from "usehooks-ts";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), details, [tabindex]:not([tabindex="-1"])';

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
}

interface FocusTrapProps {
  children: ReactNode;
  isActive?: boolean;
  initialFocusRef?: RefObject<HTMLElement | null>;
  restoreFocus?: boolean;
  autoFocus?: boolean;
  className?: string;
}

/**
 * FocusTrap component
 *
 * Traps keyboard focus within the component's children when active.
 * Handles Tab and Shift+Tab navigation to cycle through focusable elements.
 * Automatically focuses the first element on mount and restores previous focus on unmount.
 *
 * @param props - Component props
 * @param props.children - The content to be rendered inside the trap
 * @param props.isActive - Whether the trap is currently active (default: true)
 * @param props.initialFocusRef - Optional ref to an element to focus when the trap activates
 * @param props.restoreFocus - Whether to restore focus to the previously active element on unmount (default: true)
 * @param props.autoFocus - Whether to automatically focus an element on mount (default: true)
 * @param props.className - Optional className for the wrapper div
 */
export function FocusTrap({
  children,
  isActive = true,
  initialFocusRef,
  restoreFocus = true,
  autoFocus = true,
  className,
}: FocusTrapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(handleHistoryFocus, [isActive, restoreFocus]);
  useEffect(handleInitialFocus, [isActive, autoFocus, initialFocusRef]);

  useEventListener("keydown", handleKeyDown);

  /**
   * Stores the currently focused element when the trap becomes active
   * and restores it when the trap deactivates or unmounts.
   */
  function handleHistoryFocus() {
    if (isActive) {
      previousFocusRef.current = document.activeElement as HTMLElement;
    }

    return () => {
      if (restoreFocus && isActive && previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }

  /**
   * Sets the initial focus when the trap becomes active.
   * Prioritizes initialFocusRef, then falls back to the first focusable element.
   */
  function handleInitialFocus() {
    if (!isActive || !autoFocus) return;

    if (initialFocusRef?.current) {
      initialFocusRef.current.focus();
      return;
    }

    if (containerRef.current) {
      const focusableElements = getFocusableElements(containerRef.current);
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      }
    }
  }

  /**
   * Handles keyboard interactions, specifically trapping Tab and Shift+Tab navigation.
   *
   * @param event - The keyboard event
   */
  function handleKeyDown(event: KeyboardEvent) {
    if (!isActive || event.key !== "Tab" || !containerRef.current) return;

    const focusableElements = getFocusableElements(containerRef.current);

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey) {
      if (document.activeElement === firstElement) {
        lastElement.focus();
        event.preventDefault();
      }
    } else {
      if (document.activeElement === lastElement) {
        firstElement.focus();
        event.preventDefault();
      }
    }
  }

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}
