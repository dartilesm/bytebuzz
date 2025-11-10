import { cn } from "@/lib/utils";

interface PostWrapperProps {
  children: React.ReactNode;
  isAncestry?: boolean;
}

export function PostWrapper({ children, isAncestry }: PostWrapperProps) {
  return (
    <div
      className={cn(
        "relative dark:bg-content1 dark:border-content2 bg-default-200/20 border border-content3 rounded-large",
        {
          "bg-transparent border-none dark:bg-transparent dark:border-none": isAncestry,
        }
      )}
    >
      {children}
    </div>
  );
}
