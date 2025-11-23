"use client";

import { Command as CommandPrimitive } from "cmdk";
import { X } from "lucide-react";
import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Command, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { type VariantProps, cva } from "class-variance-authority";

/**
 * Variants for the multi-select component to handle different styles.
 * Uses class-variance-authority (cva) to define styles for the "trigger" element.
 */
const multiSelectVariants = cva(
  "m-1 transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-110 duration-300",
  {
    variants: {
      variant: {
        default: "border-foreground/10 text-foreground bg-card hover:bg-card/80",
        secondary:
          "border-foreground/10 bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        flat: "border-transparent bg-transparent text-foreground hover:bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface Option {
  value: string;
  label: string;
  disabled?: boolean;
  fixed?: boolean;
  icon?: React.ElementType;
  [key: string]: any;
}

interface MultiSelectContextProps {
  selectedValues: string[];
  onValueChange: (value: string[]) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  maxCount?: number;
  variant?: VariantProps<typeof multiSelectVariants>["variant"];
}

const MultiSelectContext = React.createContext<MultiSelectContextProps | null>(null);

const useMultiSelect = () => {
  const context = React.useContext(MultiSelectContext);
  if (!context) {
    throw new Error("useMultiSelect must be used within a MultiSelectProvider");
  }
  return context;
};

interface MultiSelectProps {
  children: React.ReactNode;
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  modalPopover?: boolean;
  maxCount?: number;
  variant?: VariantProps<typeof multiSelectVariants>["variant"];
}

const MultiSelect = ({
  children,
  defaultValue = [],
  onValueChange,
  defaultOpen = false,
  open: controlledOpen,
  onOpenChange,
  modalPopover = false,
  maxCount = 3,
  variant = "default",
}: MultiSelectProps) => {
  const [selectedValues, setSelectedValues] = React.useState<string[]>(defaultValue);
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = onOpenChange ?? setUncontrolledOpen;

  const handleValueChange = React.useCallback(
    (values: string[]) => {
      setSelectedValues(values);
      onValueChange?.(values);
    },
    [onValueChange],
  );

  return (
    <MultiSelectContext.Provider
      value={{
        selectedValues,
        onValueChange: handleValueChange,
        open,
        setOpen,
        maxCount,
        variant,
      }}
    >
      <Popover open={open} onOpenChange={setOpen} modal={modalPopover}>
        {children}
      </Popover>
    </MultiSelectContext.Provider>
  );
};

const MultiSelectTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof Button> & { placeholder?: string }
>(({ className, children, ...props }, ref) => {
  const { selectedValues, onValueChange, maxCount, variant } = useMultiSelect();

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onValueChange([]);
  };

  return (
    <PopoverTrigger asChild>
      <Button
        ref={ref}
        variant={variant}
        className={cn(
          "flex w-full p-1 rounded-md border min-h-10 h-auto items-center justify-between bg-inherit hover:bg-inherit",
          className,
        )}
        {...props}
      >
        {selectedValues.length > 0 ? (
          <div className="flex justify-between items-center w-full">
            <div className="flex flex-wrap items-center">
              {selectedValues.slice(0, maxCount).map((value) => (
                <Badge key={value} className={cn(multiSelectVariants({ variant }))}>
                  {value}
                  <div
                    className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.stopPropagation();
                        const newValues = selectedValues.filter((v) => v !== value);
                        onValueChange(newValues);
                      }
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const newValues = selectedValues.filter((v) => v !== value);
                      onValueChange(newValues);
                    }}
                  >
                    <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                  </div>
                </Badge>
              ))}
              {selectedValues.length > (maxCount || 0) && (
                <Badge
                  className={cn(
                    "bg-transparent text-foreground border-foreground/1 hover:bg-transparent",
                    multiSelectVariants({ variant }),
                  )}
                >
                  {`+ ${selectedValues.length - (maxCount || 0)} more`}
                </Badge>
              )}
            </div>
            <div className="flex items-center justify-between">
              <X className="h-4 mx-2 cursor-pointer text-muted-foreground" onClick={handleClear} />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between w-full mx-auto">
            <span className="text-sm text-muted-foreground mx-3">
              {props.placeholder ?? "Select options"}
            </span>
          </div>
        )}
      </Button>
    </PopoverTrigger>
  );
});

MultiSelectTrigger.displayName = "MultiSelectTrigger";

const MultiSelectContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof PopoverContent>
>(({ className, children, ...props }, ref) => {
  return (
    <PopoverContent ref={ref} className={cn("w-auto p-0", className)} align="start" {...props}>
      <Command>
        <CommandList>{children}</CommandList>
      </Command>
    </PopoverContent>
  );
});

MultiSelectContent.displayName = "MultiSelectContent";

const MultiSelectInput = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Input>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>
>(({ className, ...props }, ref) => {
  const { setOpen } = useMultiSelect();
  return (
    <CommandPrimitive.Input
      ref={ref}
      className={cn(
        "flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 px-2",
        className,
      )}
      onFocus={() => setOpen(true)}
      {...props}
    />
  );
});

MultiSelectInput.displayName = "MultiSelectInput";

const MultiSelectList = CommandList;

const MultiSelectGroup = CommandGroup;

const MultiSelectItem = React.forwardRef<
  React.ElementRef<typeof CommandItem>,
  React.ComponentPropsWithoutRef<typeof CommandItem>
>(({ className, children, ...props }, ref) => {
  const { selectedValues, onValueChange } = useMultiSelect();
  const value = props.value || "";
  const isSelected = selectedValues.includes(value);

  return (
    <CommandItem
      ref={ref}
      className={cn("cursor-pointer", className)}
      onSelect={() => {
        const newValues = isSelected
          ? selectedValues.filter((v) => v !== value)
          : [...selectedValues, value];
        onValueChange(newValues);
      }}
      {...props}
    >
      <div
        className={cn(
          "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
          isSelected ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible",
        )}
      >
        <svg
          className={cn("h-4 w-4")}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      {children}
    </CommandItem>
  );
});

MultiSelectItem.displayName = "MultiSelectItem";

const MultiSelectEmpty = CommandPrimitive.Empty;

export {
  MultiSelect,
  MultiSelectTrigger,
  MultiSelectContent,
  MultiSelectInput,
  MultiSelectList,
  MultiSelectGroup,
  MultiSelectItem,
  MultiSelectEmpty,
};
