import { MarkdownViewer } from "@/components/markdown-viewer/markdown-viewer";
import { UserProfilePopoverCard } from "@/components/user-profile/user-profile-popover-card";
import { PostProvider } from "@/context/post-provider";
import { formatDateTime } from "@/lib/format-time";
import { getRelativeTime } from "@/lib/relative-time";
import { cn } from "@/lib/utils";
import type { NestedPost } from "@/types/nested-posts";
import { Avatar, Card, CardBody, CardHeader, Tooltip } from "@heroui/react";
import Link from "next/link";

interface CondensedUserPostProps {
  post: NestedPost;
  className?: string;
}

export function CondensedUserPost({ post, className }: CondensedUserPostProps) {
  const { user, content, created_at } = post;

  return (
    <PostProvider post={post} isThread={false} isNavigationDisabled>
      <Card
        className={cn(
          "relative flex flex-row gap-2 p-2 dark:bg-content2/50 bg-default-200/20 border border-content3 [box-shadow:none]",
          className,
        )}
        tabIndex={0}
        as="article"
      >
        <div className="flex justify-center relative pt-1">
          <Link href={`/@${user?.username}`} className="h-fit">
            <Tooltip content={<UserProfilePopoverCard user={user} />} delay={1000}>
              <Avatar
                src={user?.image_url ?? ""}
                alt={user?.display_name ?? ""}
                className="size-6 flex-shrink-0 z-20"
              />
            </Tooltip>
          </Link>
        </div>

        <div className="w-full overflow-hidden">
          <CardHeader className="flex items-center gap-2 pb-1 flex-1 p-0">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-1.5">
                <Tooltip content={<UserProfilePopoverCard user={user} />} delay={1000}>
                  <Link href={`/@${user?.username}`} className="flex flex-row gap-1 items-center">
                    <span className="font-semibold text-sm">{user?.display_name}</span>
                    <span className="text-xs text-content4-foreground/50">@{user?.username}</span>
                  </Link>
                </Tooltip>
                <span className="text-xs text-content4-foreground/50">·</span>
                <time
                  className="text-xs text-content4-foreground/50"
                  title={formatDateTime(created_at as unknown as Date)}
                >
                  {getRelativeTime(new Date(created_at as unknown as Date))}
                </time>
              </div>
            </div>
          </CardHeader>

          <CardBody className="py-0 text-sm p-0">
            <MarkdownViewer markdown={content ?? ""} postId={post.id ?? ""} />
          </CardBody>
        </div>
      </Card>
    </PostProvider>
  );
}
