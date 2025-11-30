import { cn } from "@/lib/utils";

interface PostWrapperProps {
  children: React.ReactNode;
  isAncestry?: boolean;
}

export function PostWrapper({ children, isAncestry }: PostWrapperProps) {
  return (
    <div
      className={cn(
        "relative dark:bg-card dark:border-border bg-muted/20 border border-border rounded-xl",
        {
          "bg-transparent border-none dark:bg-transparent dark:border-none": isAncestry,
        },
      )}
    >
      {children}
    </div>
  );
}
