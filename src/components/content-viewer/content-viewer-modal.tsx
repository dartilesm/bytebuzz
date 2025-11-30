"use client";

import { XIcon } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { PostList } from "@/components/post/post-list";
import { PostWrapper } from "@/components/post/post-wrapper";
import { UserPost } from "@/components/post/user-post";
import { PostComposer } from "@/components/post-composer/post-composer";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PostsProvider } from "@/context/posts-context";
import { usePostThreadQuery } from "@/hooks/queries/use-post-thread-query";
import { useContentViewerContext } from "@/hooks/use-content-viewer-context";

/**
 * Full-screen content viewer modal with split layout
 * Left panel displays the carousel of images
 * Right panel displays the post thread and replies
 */
export function ContentViewerModal() {
  const { isOpen, images, initialImageIndex, postId, closeViewer } = useContentViewerContext();
  console.log({ isOpen, images, initialImageIndex, postId, closeViewer });
  const { data: threadData, isLoading } = usePostThreadQuery(postId);
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) return;

    setCurrent(api.selectedScrollSnap());
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  useEffect(() => {
    if (api && initialImageIndex > 0) {
      api.scrollTo(initialImageIndex);
    }
  }, [api, initialImageIndex]);

  if (!isOpen) {
    return null;
  }

  const postAncestry = threadData?.postAncestry || [];
  const directReplies = threadData?.directReplies || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-accent/80 backdrop-blur-sm"
        onClick={closeViewer}
        aria-hidden="true"
      />

      {/* Modal Content */}
      <div className="relative z-10 flex h-full w-full bg-background">
        {/* Left Panel - Carousel Display */}
        <div className="flex flex-1 items-center justify-center bg-accent p-4">
          <Carousel
            setApi={setApi}
            opts={{
              align: "center",
            }}
            className="size-full flex *:data-[slot=carousel-content]:size-full"
          >
            <CarouselContent>
              {images.map((image, index) => (
                <CarouselItem key={index} className="h-full flex items-center justify-center">
                  <div className="relative w-full h-full flex items-center justify-center">
                    <Image
                      src={image.src}
                      alt={image.alt || `Image ${index + 1}`}
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {images.length > 1 && (
              <>
                <CarouselPrevious className="left-4" />
                <CarouselNext className="right-4" />
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-accent/50 px-3 py-1 rounded-full text-accent-foreground text-sm">
                  {current + 1} / {images.length}
                </div>
              </>
            )}
          </Carousel>
        </div>

        {/* Right Panel - Post Thread */}
        <div className="flex w-full flex-col border-l border-border bg-background md:w-[400px]">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border p-4">
            <h2 className="text-lg font-semibold">Post</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={closeViewer}
              className="h-8 w-8 rounded-full"
              aria-label="Close viewer"
            >
              <XIcon size={18} />
            </Button>
          </div>

          {/* Scrollable Content */}
          <ScrollArea className="flex-1">
            <div className="flex flex-col gap-4 p-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <span className="text-sm text-muted-foreground">Loading...</span>
                </div>
              ) : (
                <>
                  {postAncestry.length > 0 && (
                    <PostsProvider initialPosts={directReplies}>
                      <PostWrapper isAncestry>
                        <UserPost ancestry={postAncestry} isNavigationDisabled hideMedia={true} />
                      </PostWrapper>
                      <h3 className="text-base font-medium">Replies</h3>
                      {postId && (
                        <PostComposer
                          placeholder={`Reply to @${postAncestry?.at(-1)?.user?.username || "post"}`}
                          replyPostId={postId}
                        />
                      )}
                      <div className="flex flex-col gap-4">
                        {directReplies.length > 0 && <PostList />}
                      </div>
                    </PostsProvider>
                  )}
                  {postAncestry.length === 0 && (
                    <div className="flex items-center justify-center py-8">
                      <span className="text-sm text-muted-foreground">Post not found</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
