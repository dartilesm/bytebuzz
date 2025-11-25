"use client";

import { PostAvatarAndThreadLine } from "@/components/post/post-avatar-and-thread-line";
import { usePostContext } from "@/hooks/use-post-context";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";

const navigationDisabledElementSelectors = ["a", "button", "#post-card-footer", "#post-card-header"];

interface PostCardProps {
  children: React.ReactNode;
  className?: string;
  ref?: React.RefObject<HTMLDivElement>;
}

export function PostCard({ children, className, ref }: PostCardProps) {
  const { isThreadPagePost, post, isNavigationDisabled } = usePostContext();
  const router = useRouter();
  const pathname = usePathname();

  function handleClick(event: React.MouseEvent<HTMLDivElement>) {
    const isNavigationDisabledElement = navigationDisabledElementSelectors.some(selector => (event.target as HTMLElement).closest(selector));

    if (isNavigationDisabledElement || isNavigationDisabled) return;

    // Casting to a more specific type to fix TypeScript errors
    const pushPath = `/@${post.user?.username}/thread/${post.id}` as `/${string}/thread/${string}`;

    if (pathname !== pushPath) router.push(pushPath);
  }

  return (
    <div onClick={handleClick} ref={ref}>
      <Card
        className={cn(
          "relative flex flex-row dark:bg-card bg-card shadow-none overflow-hidden py-0 gap-0 border-0",
          {
            "cursor-pointer": !isNavigationDisabled,
          },
          className
        )}
        tabIndex={0}
      >
        {!isThreadPagePost && <PostAvatarAndThreadLine />}
        <div className='w-full'>{children}</div>
      </Card>
    </div>
  );
}
