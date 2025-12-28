"use client";

import { ExpandIcon } from "lucide-react";
import Image from "next/image";
import type { ComponentPropsWithoutRef, ReactElement } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getAllContentFromMarkdown } from "@/components/markdown-viewer/functions/get-all-content-from-markdown";
import { getImagesFromMarkdown } from "@/components/markdown-viewer/functions/get-images-from-markdown";
import { parseCodeBlockMetadata } from "@/components/markdown-viewer/functions/parse-code-block-metadata";
import { serializeImageUrl } from "@/components/markdown-viewer/functions/serialize-image-url";
import { Mention } from "@/components/markdown-viewer/mention";
import {
  type BundledLanguage,
  CodeBlock,
  CodeBlockActionButton,
  CodeBlockBody,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockFilename,
  CodeBlockFiles,
  CodeBlockHeader,
  CodeBlockItem,
} from "@/components/ui/code-block/code-block";
import type { PostClickEvent } from "@/context/post-provider";
import { resolveCustomEmojiUrl } from "@/lib/emojis/custom-emojis";
import { cn } from "@/lib/utils";

const ALLOWED_ELEMENTS = ["img", "p", "code"] as const;

export type DisallowedElements = Exclude<(typeof ALLOWED_ELEMENTS)[number], "p">[];

type ReactElementWithNode = ReactElement & { props: { node: { tagName: string } } };

type MarkdownImageProps = ComponentPropsWithoutRef<"img">;

export type MarkdownViewerProps = {
  markdown: string;
  postId: string;
  disallowedElements?: DisallowedElements;
  /**
   * Generic event handler for all markdown component events
   * Use this instead of componentEvents for better scalability
   */
  onEvent?: (event: PostClickEvent) => void;
};

export function MarkdownViewer({
  markdown,
  postId,
  disallowedElements = [],
  onEvent,
}: MarkdownViewerProps) {
  // Extract all content (images and code blocks) from markdown
  const allContent = getAllContentFromMarkdown({ markdown, postId });

  // Extract images separately for backward compatibility with image grid rendering
  const images = getImagesFromMarkdown({ markdown, postId });

  const imageCount = images.length;
  const shouldHideImages = disallowedElements.includes("img");

  return (
    <>
      <Markdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ node, ...props }) => {
            const { children, className } = props;

            // If strict structure check handles pure images, we might mostly rely on that
            // But for emojis mixed with text, we want the P to render
            // So we just return standard p with children
            return (
              <p
                className={className}
                onClick={(event) => {
                  onEvent?.({ ...event, source: "p", type: "click", payload: undefined });
                }}
              >
                {children}
              </p>
            );
          },
          img: (props: MarkdownImageProps) => {
            const { src, alt } = props;
            if (!src) return null;

            if (alt?.startsWith("emoji:")) {
              const resolvedSrc = typeof src === "string" ? resolveCustomEmojiUrl(src) || src : src;
              return (
                <img
                  src={resolvedSrc}
                  alt={alt}
                  className="inline-block w-5 h-5 align-text-bottom object-contain mx-0.5"
                  draggable={false}
                />
              );
            }

            // Hide regular images from main flow (they go to grid)
            return null;
          },
          code: ({ node, ...props }) => {
            const { children, className } = props;
            const language = className?.replace("language-", "");

            // Check if code blocks should be hidden (only block code, not inline)
            const shouldHideCode = disallowedElements.includes("code");
            if (shouldHideCode) return null;

            if (!className)
              return (
                <code className="text-xs bg-muted px-1 py-0.5 rounded-sm font-mono">
                  {children}
                </code>
              );

            // Extract metadata for this code block
            const codeContent = (children as string) || "";
            const languageValue = language || "text";

            const metadata = parseCodeBlockMetadata(node?.data?.meta ?? "");
            const filename = metadata?.fileName;

            // Find this code block's index in allContent
            const codeIndex = allContent.findIndex(
              (item) =>
                item.type === "code" &&
                item.data.language === languageValue &&
                item.data.code === codeContent.trim() &&
                item.data.filename === filename,
            );

            return (
              <CodeBlock
                defaultValue={languageValue}
                data={[
                  {
                    language: languageValue,
                    filename: filename,
                    code: codeContent,
                  },
                ]}
              >
                <CodeBlockHeader className="h-10 flex justify-between items-center">
                  {filename && (
                    <CodeBlockFiles>
                      {(item) =>
                        item && <CodeBlockFilename key={item.code + item.language} data={item} />
                      }
                    </CodeBlockFiles>
                  )}
                  <div className="flex items-center">
                    <CodeBlockActionButton
                      tooltipContent="Expand"
                      onClick={(event) => {
                        onEvent?.({
                          ...event,
                          source: "code",
                          type: "click",
                          payload: {
                            contentItems: allContent,
                            index: codeIndex !== -1 ? codeIndex : 0,
                            postId,
                          },
                        });
                      }}
                    >
                      <ExpandIcon className="size-3.5" />
                    </CodeBlockActionButton>
                    <CodeBlockCopyButton />
                  </div>
                </CodeBlockHeader>
                <CodeBlockBody>
                  {(item) => (
                    <CodeBlockItem key={item.language} value={item.language}>
                      <CodeBlockContent
                        language={item.language as BundledLanguage}
                        className="text-xs [&>pre]:p-2 [&>pre_.line]:p-0"
                      >
                        {item.code?.trim?.()}
                      </CodeBlockContent>
                    </CodeBlockItem>
                  )}
                </CodeBlockBody>
              </CodeBlock>
            );
          },
          ul: ({ ...props }) => {
            const { children, className } = props;
            return (
              <ul
                className={cn("list-disc pl-4 mb-2 flex flex-col gap-1.5", className)}
                onClick={(event) => {
                  onEvent?.({ ...event, source: "ul", type: "click", payload: undefined });
                }}
              >
                {children}
              </ul>
            );
          },
          ol: ({ ...props }) => {
            const { children, className } = props;
            return (
              <ol
                className={cn("list-decimal pl-4 mb-2 flex flex-col gap-1.5", className)}
                onClick={(event) => {
                  onEvent?.({ ...event, source: "ol", type: "click", payload: undefined });
                }}
              >
                {children}
              </ol>
            );
          },
          a: ({ node, ...props }) => {
            const { children, href = "" } = props;
            const isMentionLink = href.startsWith("/mention:");

            // Check if this is a mention link: mention:id:username:avatarUrl
            if (isMentionLink) {
              const parts = href.replace("/mention:", "").split(":");
              const [userId, username] = parts;

              return <Mention key={href} userId={userId} username={username} />;
            }

            return (
              <a href={href} className="text-primary underline hover:text-primary-foreground">
                {children}
              </a>
            );
          },
        }}
        // Removed img from disallowedElements to allow custom emoji handling
        disallowedElements={disallowedElements.filter((el) => el !== "img")}
      >
        {markdown}
      </Markdown>
      {imageCount > 0 && !shouldHideImages && (
        <div
          className={cn(
            "rounded-medium aspect-video border border-accent overflow-hidden grid rounded-md",
            {
              "grid-cols-2": imageCount === 2,
              "grid-cols-2 grid-rows-2": imageCount === 3 || imageCount >= 4,
            },
            imageCount === 3 && [
              "[&_>:nth-child(1)]:[grid-area:1/1/3/2]",
              "[&_>:nth-child(2)]:[grid-area:1/2/2/3]",
              "[&_>:nth-child(3)]:[grid-area:2/2/3/3]",
            ],
          )}
        >
          <Markdown
            remarkPlugins={[remarkGfm]}
            components={{
              p: ({ node, ...props }) => {
                const { children } = props;
                // Only render children (images) for the grid viewer
                const isChildImage =
                  (children as ReactElementWithNode)?.props?.node?.tagName === "img";
                if (isChildImage) return <>{children}</>;
                return null;
              },
              img: (props: MarkdownImageProps) => {
                const { src, alt } = props;

                if (!src || typeof src !== "string") {
                  return null;
                }

                // Strictly skip custom emojis in grid
                if (alt?.startsWith("emoji:")) {
                  return null;
                }

                // Use nuqs serializer to properly merge postId with existing URL and query params
                // This handles cases where URL already has query params or postId
                const imageUrl = serializeImageUrl(src, { postId });

                // Find index of this image in the allContent array
                const index = allContent.findIndex(
                  (item) => item.type === "image" && item.data.src === imageUrl,
                );

                return (
                  <div
                    className={cn("relative outline-[0.5px] outline-accent")}
                    onClick={(event) => {
                      onEvent?.({
                        ...event,
                        source: "img",
                        type: "click",
                        payload: {
                          contentItems: allContent,
                          index: index !== -1 ? index : 0,
                          postId,
                        },
                      });
                    }}
                  >
                    <Image
                      className="h-full object-cover"
                      src={imageUrl}
                      alt={alt || "Image"}
                      fill
                      unoptimized
                    />
                  </div>
                );
              },
            }}
            allowedElements={["img", "p"]}
          >
            {markdown}
          </Markdown>
        </div>
      )}
    </>
  );
}
