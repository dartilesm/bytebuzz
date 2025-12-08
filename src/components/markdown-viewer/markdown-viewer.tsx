"use client";

import Image from "next/image";
import type { ComponentPropsWithoutRef, ReactElement } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getAllContentFromMarkdown } from "@/components/markdown-viewer/functions/get-all-content-from-markdown";
import { getImagesFromMarkdown } from "@/components/markdown-viewer/functions/get-images-from-markdown";
import { parseCodeBlockMetadata } from "@/components/markdown-viewer/functions/parse-code-block-metadata";
import { serializeImageUrl } from "@/components/markdown-viewer/functions/serialize-image-url";
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
import { cn } from "@/lib/utils";
import type { MarkdownComponentEvent } from "@/types/markdown-component-events";

const ALLOWED_MEDIA_ELEMENTS = ["img", "p"] as const;

function getAllowedMediaElements(disallowedMediaElements: DisallowedMediaElements) {
  const allowedMediaElementsSet = new Set(ALLOWED_MEDIA_ELEMENTS);
  const disallowedMediaElementsSet = new Set(disallowedMediaElements);

  const allowedMediaElements = allowedMediaElementsSet.difference(disallowedMediaElementsSet);
  const allowedMediaElementsArray = Array.from(allowedMediaElements);

  return allowedMediaElementsArray;
}

export type DisallowedMediaElements = Exclude<(typeof ALLOWED_MEDIA_ELEMENTS)[number], "p">[];

type ReactElementWithNode = ReactElement & { props: { node: { tagName: string } } };

type MarkdownImageProps = ComponentPropsWithoutRef<"img">;

export type MarkdownViewerProps = {
  markdown: string;
  postId: string;
  disallowedMediaElements?: DisallowedMediaElements;
  /**
   * Generic event handler for all markdown component events
   * Use this instead of componentEvents for better scalability
   */
  onEvent?: (event: MarkdownComponentEvent) => void;
};

export function MarkdownViewer({
  markdown,
  postId,
  disallowedMediaElements = [],
  onEvent,
}: MarkdownViewerProps) {
  const allowedMediaElements = getAllowedMediaElements(disallowedMediaElements);

  // Extract all content (images and code blocks) from markdown
  const allContent = getAllContentFromMarkdown({ markdown, postId });

  // Extract images separately for backward compatibility with image grid rendering
  const images = getImagesFromMarkdown({ markdown, postId });

  const imageCount = images.length;
  const shouldHideImages = disallowedMediaElements.includes("img");

  return (
    <>
      <Markdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ node, ...props }) => {
            const { children, className } = props;

            const isChildImage = (children as ReactElementWithNode)?.props?.node?.tagName === "img";
            if (isChildImage) return <>{children}</>;

            if (!children) return null;

            return (
              <p
                className={className}
                onClick={() => {
                  onEvent?.({ source: "p", type: "click", payload: undefined });
                }}
              >
                {children}
              </p>
            );
          },
          code: ({ node, ...props }) => {
            const { children, className } = props;
            const language = className?.replace("language-", "");
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
                onClick={() => {
                  onEvent?.({
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
                <CodeBlockHeader className="h-10 flex justify-between items-center">
                  {filename && (
                    <CodeBlockFiles>
                      {(item) =>
                        item && <CodeBlockFilename key={item.code + item.language} data={item} />
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
                onClick={() => {
                  onEvent?.({ source: "ul", type: "click", payload: undefined });
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
                onClick={() => {
                  onEvent?.({ source: "ol", type: "click", payload: undefined });
                }}
              >
                {children}
              </ol>
            );
          },
        }}
        disallowedElements={["img"]}
      >
        {markdown}
      </Markdown>
      {imageCount > 0 && !shouldHideImages && (
        <div
          className={cn(
            "rounded-medium aspect-video border dark:border-content2 border-content3 overflow-hidden grid",
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

                // Use nuqs serializer to properly merge postId with existing URL and query params
                // This handles cases where URL already has query params or postId
                const imageUrl = serializeImageUrl(src, { postId });

                // Find index of this image in the allContent array
                const index = allContent.findIndex(
                  (item) => item.type === "image" && item.data.src === imageUrl,
                );

                return (
                  <div
                    className={cn(
                      "relative outline-[0.5px] dark:outline-content2 outline-content3 cursor-pointer",
                    )}
                    onClick={() => {
                      onEvent?.({
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
            allowedElements={allowedMediaElements}
          >
            {markdown}
          </Markdown>
        </div>
      )}
    </>
  );
}
