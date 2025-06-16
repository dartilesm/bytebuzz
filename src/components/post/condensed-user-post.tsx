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
  /**
   * Controls whether the avatar and username have hover effects and tooltips
   * @default false
   */
  isInteractive?: boolean;
}

export function CondensedUserPost({
  post,
  className,
  isInteractive = false,
}: CondensedUserPostProps) {
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
          {isInteractive ? (
            <Link href={`/@${user?.username}`} className="h-fit">
              <Tooltip content={<UserProfilePopoverCard user={user} />} delay={1000}>
                <UserAvatar user={user} />
              </Tooltip>
            </Link>
          ) : (
            <UserAvatar user={user} />
          )}
        </div>

        <div className="w-full overflow-hidden">
          <CardHeader className="flex items-center gap-2 pb-1 flex-1 p-0">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-1.5">
                {isInteractive ? (
                  <Tooltip content={<UserProfilePopoverCard user={user} />} delay={1000}>
                    <Link href={`/@${user?.username}`}>
                      <UserInfo user={user} />
                    </Link>
                  </Tooltip>
                ) : (
                  <UserInfo user={user} />
                )}
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

function UserInfo({ user }: { user: NestedPost["user"] }) {
  return (
    <div className="flex flex-row gap-1 items-center">
      <span className="font-semibold text-sm">{user?.display_name}</span>
      <span className="text-xs text-content4-foreground/50">@{user?.username}</span>
    </div>
  );
}

function UserAvatar({ user }: { user: NestedPost["user"] }) {
  return (
    <Avatar
      src={user?.image_url ?? ""}
      alt={user?.display_name ?? ""}
      className="size-6 flex-shrink-0 z-20"
    />
  );
}
