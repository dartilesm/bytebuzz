"use client";

import { PostInteraction } from "@/components/post-interaction";
import type { NestedPost } from "@/types/nested-posts";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Repeat2Icon, XIcon } from "lucide-react";

interface PostActionModalProps {
  post: NestedPost;
  isOpen: boolean;
  action: "reply" | "clone";
  onOpenChange: (open?: boolean) => void;
}

export function PostActionModal({ post, action, onOpenChange }: PostActionModalProps) {
  return (
    <Dialog open={true} onOpenChange={(open) => !open && onOpenChange(false)}>
      <DialogContent
        className={cn("max-w-xl p-0 gap-0 overflow-hidden [&>button]:hidden rounded-xl")}
      >
        <DialogHeader
          className={cn("flex flex-row justify-between p-2 pl-4 items-center space-y-0", {
            "dark:bg-card": action === "reply",
            "dark:bg-muted": action === "clone",
          })}
        >
          <DialogTitle className="text-sm font-medium flex items-center gap-1 text-muted-foreground/60">
            <Repeat2Icon size={14} />
            {action === "reply" ? "Reply to" : "Repost"} @{post.user?.username}&apos;s post
          </DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="h-8 w-8 rounded-full"
          >
            <XIcon size={14} />
          </Button>
        </DialogHeader>
        <PostInteraction post={post} action={action} onSubmit={onOpenChange} />
      </DialogContent>
    </Dialog>
  );
}
