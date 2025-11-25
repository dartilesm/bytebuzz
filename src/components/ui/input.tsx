import type * as React from "react"

import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

const inputVariants = cva(
  "h-9 w-full rounded-md px-3 py-1 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm border-input",
  {
    variants: {
      variant: {
        default: "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 min-w-0 border bg-transparent text-base shadow-xs transition-[color,box-shadow] outline-none",
        flat: "shadow-none border-none bg-input/80 dark:bg-input/60 focus-visible:bg-input dark:focus-visible:bg-input/80",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

function Input({ className, variant, type, ...props }: React.ComponentProps<"input"> & VariantProps<typeof inputVariants>) {


  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        inputVariants({ variant }),
        className
      )}
      {...props}
    />
  )
}

export { Input }
