"use client";

import { usePostContext } from "@/hooks/use-post-context";
import { CardBody, cn } from "@heroui/react";

interface PostContentProps {
  children?: React.ReactNode;
}

export function PostContent({ children }: PostContentProps) {
  const { isThreadPagePost, post = {} } = usePostContext();
  const { content } = post;

  return (
    <CardBody
      className={cn("flex-1 py-0", {
        "px-8.5": isThreadPagePost,
      })}
    >
      {children ?? <p className="text-sm">{content}</p>}
    </CardBody>
  );
}
