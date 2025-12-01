"use client";

import { XIcon } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useScrollLock } from "usehooks-ts";
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
import { PostsProvider } from "@/context/posts-context";
import { usePostThreadQuery } from "@/hooks/queries/use-post-thread-query";
import { useContentViewerContext } from "@/hooks/use-content-viewer-context";
import { cn } from "@/lib/utils";

/**
 * Full-screen content viewer modal with split layout
 * Left panel displays the carousel of images
 * Right panel displays the post thread and replies
 */
export function ContentViewerModal() {
  const { isOpen, images, initialImageIndex, postId, closeViewer } = useContentViewerContext();
  useScrollLock();
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
        <div className="flex flex-1 items-center justify-center bg-accent p-0">
          <Carousel
            setApi={setApi}
            opts={{
              align: "center",
            }}
            className="size-full flex [&>div]:data-[slot=carousel-content]:size-full"
          >
            <CarouselContent className="flex-1 h-full">
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
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex justify-center gap-2 z-10">
                  {images.map((_, index) => (
                    <Button
                      key={index}
                      type="button"
                      size="icon"
                      variant={index === current ? "default" : "outline"}
                      onClick={() => {
                        api?.scrollTo(index);
                      }}
                      aria-label={`Go to slide ${index + 1}`}
                      className={cn("h-2 rounded-full transition-all", {
                        "w-2": index !== current,
                      })}
                    />
                  ))}
                </div>
              </>
            )}
          </Carousel>
        </div>

        {/* Right Panel - Post Thread */}
        <div className="grid grid-rows-[auto_1fr] w-full border-l border-border bg-background md:w-[400px] max-h-dvh">
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
          <div className="overflow-y-auto">
            <div className="flex flex-col gap-4 p-4">
              {isLoading && (
                <div className="flex items-center justify-center py-8">
                  <span className="text-sm text-muted-foreground">Loading...</span>
                </div>
              )}
              {!isLoading && (
                <>
                  {postAncestry.length > 0 && (
                    <PostsProvider initialPosts={directReplies}>
                      <PostWrapper isAncestry>
                        <UserPost ancestry={postAncestry} isNavigationDisabled />
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
          </div>
        </div>
      </div>
    </div>
  );
}
