"use client";

import { PostInteraction } from "@/components/post-interaction";
import type { NestedPost } from "@/types/nested-posts";
import { Button, cn, Modal, ModalBody, ModalContent, ModalHeader } from "@heroui/react";
import { Repeat2Icon, XIcon } from "lucide-react";

interface PostActionModalProps {
  post: NestedPost;
  isOpen: boolean;
  action: "reply" | "clone";
  onOpenChange: () => void;
}

export function PostActionModal({ post, action, onOpenChange }: PostActionModalProps) {
  return (
    <Modal
      onClose={onOpenChange}
      defaultOpen
      size="xl"
      backdrop="blur"
      scrollBehavior="outside"
      hideCloseButton
    >
      <ModalContent
        className={cn({
          "bg-content2 has-[&_form:hover]:bg-content3": action === "clone",
          "bg-content1": action === "reply",
        })}
      >
        {(onClose) => (
          <>
            <ModalHeader className="flex justify-between p-2 pl-4 items-center">
              <span className="text-sm font-medium flex items-center gap-1 text-content4-foreground/60">
                <Repeat2Icon size={14} />
                {action === "reply" ? "Reply to" : "Repost"} @{post.user?.username}'s post
              </span>
              <Button isIconOnly variant="light" onPress={onClose} size="sm">
                <XIcon size={14} />
              </Button>
            </ModalHeader>
            <ModalBody className="p-0 -mt-4">
              <PostInteraction post={post} action={action} onSubmit={onClose} />
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
