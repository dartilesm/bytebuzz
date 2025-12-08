"use client";

import { usePathname, useRouter } from "next/navigation";
import { getAllContentFromMarkdown } from "@/components/markdown-viewer/functions/get-all-content-from-markdown";
import { PostAvatarAndThreadLine } from "@/components/post/post-avatar-and-thread-line";
import { Card } from "@/components/ui/card";
import { useContentViewerContext } from "@/hooks/use-content-viewer-context";
import { usePostContext } from "@/hooks/use-post-context";
import { cn } from "@/lib/utils";

const navigationDisabledElementSelectors = [
  "a",
  "button",
  "#post-card-footer",
  "#post-card-header",
];

interface PostCardProps {
  children: React.ReactNode;
  className?: string;
  ref?: React.RefObject<HTMLDivElement>;
}

export function PostCard({ children, className, ref }: PostCardProps) {
  const { isThreadPagePost, post, isNavigationDisabled } = usePostContext();
  const { isOpen, openViewer, closeViewer } = useContentViewerContext();
  const router = useRouter();
  const pathname = usePathname();

  function handleClick(event: React.MouseEvent<HTMLDivElement>) {
    const isNavigationDisabledElement = navigationDisabledElementSelectors.some((selector) =>
      (event.target as HTMLElement).closest(selector),
    );

    if (isNavigationDisabledElement || isNavigationDisabled) return;

    // Casting to a more specific type to fix TypeScript errors
    const pushPath = `/@${post.user?.username}/thread/${post.id}` as `/${string}/thread/${string}`;

    if (pathname !== pushPath) router.push(pushPath);

    // If modal is open, check if post has viewable content and switch to it
    if (isOpen) {
      const contentItems = getAllContentFromMarkdown({
        markdown: post.content ?? "",
        postId: post.id ?? "",
      });

      if (contentItems.length > 0) return openViewer(contentItems, post.id ?? "", 0);
      closeViewer();
    }
  }

  return (
    <div onClick={handleClick} ref={ref} id={`post-${post.id}`} className="scroll-mt-20">
      <Card
        className={cn(
          "relative flex flex-row dark:bg-card bg-card shadow-none overflow-hidden py-0 gap-0 border-0",
          {
            "cursor-pointer": !isNavigationDisabled,
          },
          className,
        )}
        tabIndex={0}
      >
        {!isThreadPagePost && <PostAvatarAndThreadLine />}
        <div className="w-full">{children}</div>
      </Card>
    </div>
  );
}
