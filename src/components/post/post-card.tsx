"use client";

import { PostAvatarAndThreadLine } from "@/components/post/post-avatar-and-thread-line";
import { usePostContext } from "@/hooks/use-post-context";
import { cn } from "@/lib/utils";
import { Card, type CardProps } from "@heroui/react";
import { usePathname, useRouter } from "next/navigation";
interface PostCardProps {
  children: React.ReactNode;
  className?: string;
  classNames?: CardProps["classNames"];
  ref?: React.RefObject<HTMLDivElement>;
}

export function PostCard({ children, className, classNames, ref }: PostCardProps) {
  const { isThreadPagePost, post, isNavigationDisabled } = usePostContext();
  const router = useRouter();
  const pathname = usePathname();

  function handleClick(event: React.MouseEvent<HTMLDivElement>) {
    // Check if the clicked element or its parents is an anchor tag
    const isAnchorElement = (event.target as HTMLElement).closest("a");
    if (isAnchorElement || isNavigationDisabled) return;

    const pushPath = `/@${post.user?.username}/thread/${post.id}`;

    if (pathname !== pushPath) router.push(pushPath);
  }

  return (
    <div onClick={handleClick} ref={ref}>
      <Card
        className={cn(
          "relative flex flex-row dark:bg-content1 bg-[transparent] [box-shadow:none]",
          {
            "cursor-pointer": !isNavigationDisabled,
          },
          className,
        )}
        classNames={classNames}
        tabIndex={0}
        as="article"
      >
        {!isThreadPagePost && <PostAvatarAndThreadLine />}
        <div className="w-full">{children}</div>
      </Card>
    </div>
  );
}
