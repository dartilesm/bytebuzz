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
  CarouselDots,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  type BundledLanguage,
  CodeBlock,
  CodeBlockBody,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockFilename,
  CodeBlockFiles,
  CodeBlockHeader,
  CodeBlockItem,
} from "@/components/ui/code-block/code-block";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { POST_QUERY_TYPE } from "@/constants/post-query-type";
import { PostsProvider } from "@/context/posts-context";
import { postQueries } from "@/hooks/queries/options/post-queries";
import { useContentViewerContext } from "@/hooks/use-content-viewer-context";

/**
 * Full-screen content viewer modal with split layout
 * Left panel displays the carousel of images
 * Right panel displays the post thread and replies
 */
export function ContentViewerModal() {
  const { isOpen, contentItems, initialContentIndex, postId, closeViewer } =
    useContentViewerContext();

  useScrollLock();

  const { data: threadData, isLoading } = useQuery(postQueries.thread({ postId: postId ?? "" }));
  const [api, setApi] = useState<CarouselApi>();

  useEffect(() => {
    if (api && initialContentIndex > 0) {
      api.scrollTo(initialContentIndex);
    }
  }, [api, initialContentIndex]);

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
              active: contentItems?.length > 1,
            }}
            className="size-full flex [&>div]:data-[slot=carousel-content]:size-full"
          >
            <CarouselContent className="flex-1 h-full">
              {contentItems.map((item, index) => (
                <CarouselItem key={item.id} className="h-full flex items-center justify-center">
                  {item.type === "image" && (
                    <div className="relative w-full h-full flex items-center justify-center p-4">
                      <Image
                        src={item.data.src || ""}
                        alt={item.data.alt || `Image ${index + 1}`}
                        fill
                        className="object-contain"
                        unoptimized
                      />
                    </div>
                  )}
                  {item.type === "code" && (
                    <ScrollArea className="w-full h-full max-w-4xl">
                      <div className="p-4">
                        <CodeBlock
                          defaultValue={item.data.language || "text"}
                          data={[
                            {
                              language: item.data.language || "text",
                              filename: item.data.filename || "",
                              code: item.data.code || "",
                            },
                          ]}
                        >
                          <CodeBlockHeader className="h-10 flex justify-between items-center">
                            {item.data.filename && (
                              <CodeBlockFiles>
                                {(item) =>
                                  item && (
                                    <CodeBlockFilename
                                      key={item.code + item.language}
                                      data={item}
                                    />
                                  )
                                }
                              </CodeBlockFiles>
                            )}
                            <div className="flex items-center">
                              <CodeBlockCopyButton />
                            </div>
                          </CodeBlockHeader>
                          <CodeBlockBody>
                            {(item) => (
                              <CodeBlockItem key={item.language} value={item.language}>
                                <CodeBlockContent
                                  language={item.language as BundledLanguage}
                                  className="text-xs [&>pre]:p-4"
                                >
                                  {item.code?.trim?.()}
                                </CodeBlockContent>
                              </CodeBlockItem>
                            )}
                          </CodeBlockBody>
                        </CodeBlock>
                      </div>
                    </ScrollArea>
                  )}
                </CarouselItem>
              ))}
            </CarouselContent>
            {contentItems.length > 1 && (
              <>
                <CarouselPrevious className="left-4" />
                <CarouselNext className="right-4" />
                <CarouselDots />
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
                          <PostList
                            key={postId}
                            postQueryType={POST_QUERY_TYPE.POST_REPLIES}
                            postId={postId}
                          />
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
