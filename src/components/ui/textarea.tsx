import type * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const textareaVariants = cva(
  "w-full rounded-md px-3 py-2 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm border-input flex field-sizing-content min-h-16",
  {
    variants: {
      variant: {
        default: "placeholder:text-muted-foreground dark:bg-input/30 border bg-transparent text-base shadow-xs transition-[color,box-shadow] outline-none",
        flat: "shadow-none border-none bg-input/80 dark:bg-input/60 focus-visible:bg-input dark:focus-visible:bg-input/80",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

function Textarea({ className, variant, ...props }: React.ComponentProps<"textarea"> & VariantProps<typeof textareaVariants>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        textareaVariants({ variant }),
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
