"use client";

import { PostInteraction } from "@/components/post-interaction";
import type { NestedPost } from "@/types/nested-posts";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@heroui/react";

interface PostActionModalProps {
  post: NestedPost;
  isOpen: boolean;
  action: "reply" | "clone";
  onOpenChange: () => void;
}

export function PostActionModal({ post, action, onOpenChange }: PostActionModalProps) {
  return (
    <Modal onClose={onOpenChange} defaultOpen size="xl" backdrop="blur" scrollBehavior="outside">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader />
            <ModalBody>
              <PostInteraction post={post} action={action} onSubmit={onClose} />
            </ModalBody>
            <ModalFooter />
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
