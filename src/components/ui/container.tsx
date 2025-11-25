import type * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Section component that provides consistent padding across the app.
 * Default padding: p-2 md:p-4
 * Can be extended with custom className and other div props.
 */
export function Section({ className, ...props }: React.ComponentProps<"section">) {
  return <section className={cn("p-2 md:p-4", className)} {...props} />;
}
