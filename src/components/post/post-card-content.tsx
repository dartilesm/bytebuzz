"use client";

import { usePostContext } from "@/hooks/use-post-context";
import { CardBody, cn } from "@heroui/react";
import { ExpandablePostContent } from "./expandable-post-content";

interface PostContentProps {
  children?: React.ReactNode;
}

export function PostContent({ children }: PostContentProps) {
  const { isThreadPagePost, post } = usePostContext();
  const { content } = post;

  return (
    <CardBody
      className={cn("flex-1 py-0 flex flex-col gap-2 text-sm", {
        "px-8.5": isThreadPagePost,
      })}
    >
      <ExpandablePostContent content={content ?? ""} postId={post.id ?? ""} />
      {children}
    </CardBody>
  );
}
