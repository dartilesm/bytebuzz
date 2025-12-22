import type * as React from "react";
import { isValidElement } from "react";

/**
 * Recursively finds the first img element in React children and returns its src
 * @param children - React children to search through
 * @returns The src URL of the first img element found, or null if none found
 */
export function findImageSrcInChildren(children: React.ReactNode): string | null {
  let imageSrc: string | null = null;

  function traverse(node: React.ReactNode): void {
    console.log("traverse", node);
    if (imageSrc) return;

    if (typeof node === "string" || typeof node === "number") {
      return;
    }

    if (Array.isArray(node)) {
      for (const child of node) {
        traverse(child);
      }
      return;
    }

    if (isValidElement(node)) {
      const props = node.props as { src?: string; children?: React.ReactNode };
      const nodeType = node.type;

      // Check if it's an img element
      if (nodeType === "img" && typeof props.src === "string") {
        imageSrc = props.src;
        return;
      }

      // Check if it's a Next.js Image component (forward ref) or any component with src prop
      // Next.js Image is a forward ref, so we check for $$typeof symbol or render function
      const isForwardRef =
        typeof nodeType === "object" &&
        nodeType !== null &&
        ("$$typeof" in nodeType || "render" in nodeType);

      // Check if it's a component (not a string) and has src prop
      if (typeof nodeType !== "string" && typeof props.src === "string") {
        // Additional check: if it's a forward ref, verify it might be Next.js Image
        // or just accept any component with src prop as a potential image
        if (isForwardRef) {
          imageSrc = props.src;
          return;
        }
      }

      // Recursively check children
      if (props.children) {
        traverse(props.children);
      }
    }
  }

  traverse(children);
  return imageSrc;
}
