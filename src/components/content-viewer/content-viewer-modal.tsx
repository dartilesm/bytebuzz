"use client";

import { useQuery } from "@tanstack/react-query";
import { XIcon } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useScrollLock } from "usehooks-ts";
import { UserPostLoading } from "@/components/loading/user-post.loading";
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
import { Skeleton } from "@/components/ui/skeleton";
import { POST_QUERY_TYPE } from "@/constants/post-query-type";
import { PostsProvider } from "@/context/posts-context";
import { postQueries } from "@/hooks/queries/options/post-queries";
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
  const { data: threadData, isLoading } = useQuery(postQueries.thread({ postId }));
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
  const mainPost = postAncestry.length > 0 ? postAncestry[postAncestry.length - 1] : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={closeViewer}
        aria-hidden="true"
      />

      {/* Modal Content */}
      <div className="relative z-10 flex h-full w-full">
        {/* Left Panel - Carousel Display */}
        <div className="relative flex flex-1 items-center justify-center bg-background">
          {/* Close Button - Top Left (X style) */}
          <Button
            variant="flat"
            size="icon-sm"
            onClick={closeViewer}
            className="absolute top-4 left-4 z-20"
            aria-label="Close viewer"
          >
            <XIcon />
          </Button>

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
                  <div className="relative w-full h-full flex items-center justify-center p-4">
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
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex justify-center gap-2 z-10">
                  {images.map((_, index) => (
                    <Button
                      key={index}
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        api?.scrollTo(index);
                      }}
                      aria-label={`Go to slide ${index + 1}`}
                      className={cn(
                        "h-2 rounded-full transition-all bg-white/50 hover:bg-white/70",
                        {
                          "w-8 bg-white": index === current,
                          "w-2": index !== current,
                        },
                      )}
                    />
                  ))}
                </div>
              </>
            )}
          </Carousel>
        </div>

        {/* Right Panel - Post Thread */}
        <div className="w-full border-l border-border bg-background hidden md:block md:max-w-lg h-dvh">
          {/* Scrollable Content */}
          <div className="overflow-y-auto max-h-full">
            <div className="flex flex-col p-4">
              {isLoading && (
                <div className="flex flex-col gap-4">
                  <UserPostLoading />
                  <Skeleton className="h-6 w-20" />
                  <UserPostLoading />
                  <UserPostLoading />
                  <UserPostLoading />
                  <UserPostLoading />
                  <UserPostLoading />
                </div>
              )}
              {!isLoading && (
                <>
                  {postAncestry.length > 0 && (
                    <PostsProvider initialPosts={directReplies}>
                      <PostWrapper isAncestry>
                        <UserPost ancestry={postAncestry} isNavigationDisabled />
                      </PostWrapper>
                      <h3 className="text-base font-medium mt-4 mb-2">Replies</h3>
                      {postId && (
                        <PostComposer
                          placeholder={`Reply to @${mainPost?.user?.username || "post"}`}
                          replyPostId={postId}
                        />
                      )}
                      <div className="flex flex-col gap-4 mt-4 min-h-dvh">
                        {directReplies.length > 0 && (
                          <PostList postQueryType={POST_QUERY_TYPE.POST_REPLIES} postId={postId} />
                        )}
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
