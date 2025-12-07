"use client";

import { XIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useScrollLock } from "usehooks-ts";
import { PostContent } from "@/components/post/post-card-content";
import { PostFooter } from "@/components/post/post-card-footer";
import { PostList } from "@/components/post/post-list";
import { PostComposer } from "@/components/post-composer/post-composer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Separator } from "@/components/ui/separator";
import { PostsProvider } from "@/context/posts-context";
import { PostProvider } from "@/context/post-provider";
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
        <div className="relative flex flex-1 items-center justify-center bg-black">
          {/* Close Button - Top Left (X style) */}
          <Button
            variant="ghost"
            size="icon"
            onClick={closeViewer}
            className="absolute top-4 left-4 z-20 h-10 w-10 rounded-full bg-black/50 hover:bg-black/70 text-white border border-white/20 backdrop-blur-sm"
            aria-label="Close viewer"
          >
            <XIcon size={20} />
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
                <CarouselPrevious className="left-4 h-10 w-10 rounded-full bg-black/50 hover:bg-black/70 text-white border border-white/20 backdrop-blur-sm" />
                <CarouselNext className="right-4 h-10 w-10 rounded-full bg-black/50 hover:bg-black/70 text-white border border-white/20 backdrop-blur-sm" />
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
        <div className="grid grid-rows-[auto_1fr] w-full border-l border-border bg-background md:w-[400px] h-dvh">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            {mainPost && mainPost.user ? (
              <Link
                href={`/@${mainPost.user.username}`}
                className="flex items-center gap-2 min-w-0 flex-1"
              >
                <Avatar className="size-8 shrink-0">
                  <AvatarImage src={mainPost.user.image_url ?? ""} alt={mainPost.user.display_name ?? ""} />
                  <AvatarFallback>{mainPost.user.display_name?.[0] ?? mainPost.user.username?.[0] ?? ""}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col min-w-0">
                  <span className="font-semibold text-sm truncate">{mainPost.user.display_name}</span>
                  <span className="text-xs text-muted-foreground truncate">@{mainPost.user.username}</span>
                </div>
              </Link>
            ) : (
              <h2 className="text-lg font-semibold">Post</h2>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={closeViewer}
              className="h-8 w-8 rounded-full shrink-0"
              aria-label="Close viewer"
            >
              <XIcon size={18} />
            </Button>
          </div>

          {/* Scrollable Content */}
          <div className="overflow-y-auto">
            <div className="flex flex-col p-4">
              {isLoading && (
                <div className="flex items-center justify-center py-8">
                  <span className="text-sm text-muted-foreground">Loading...</span>
                </div>
              )}
              {!isLoading && (
                <>
                  {mainPost && (
                    <PostsProvider initialPosts={directReplies}>
                      <PostProvider post={mainPost} isNavigationDisabled>
                        <div className="flex flex-col">
                          <PostContent />
                          <PostFooter />
                        </div>
                      </PostProvider>
                      <Separator className="my-4" />
                      <h3 className="text-base font-medium mb-2">Replies</h3>
                      {postId && (
                        <PostComposer
                          placeholder={`Reply to @${mainPost.user?.username || "post"}`}
                          replyPostId={postId}
                        />
                      )}
                      <div className="flex flex-col gap-4 mt-4">
                        {directReplies.length > 0 && <PostList />}
                      </div>
                    </PostsProvider>
                  )}
                  {!mainPost && (
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
