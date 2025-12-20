"use client";

import Image from "next/image";
import { createSerializer, parseAsString } from "nuqs/server";
import type { ComponentPropsWithoutRef, ReactElement } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { parseCodeBlockMetadata } from "@/components/markdown-viewer/functions/parse-code-block-metadata";
import { Mention } from "@/components/markdown-viewer/mention";
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

type ReactElementWithNode = ReactElement & { props: { node: { tagName: string } } };

type MarkdownImageProps = ComponentPropsWithoutRef<"img">;

export function MarkdownViewer({ markdown, postId }: { markdown: string; postId: string }) {
  // Extract image count from markdown by counting ![] patterns
  const imageCount = (markdown.match(/!\[.*?\]\(.*?\)/g) || []).length;

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

            return <p className={className}>{children}</p>;
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
                    {/* <CodeBlockActionButton tooltipContent="Save to snippets">
                      <Button size="icon-sm" variant="ghost">
                        <BookmarkIcon className="size-3.5" />
                      </Button>
                    </CodeBlockActionButton> */}
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
              <ul className={cn("list-disc pl-4 mb-2 flex flex-col gap-1.5", className)}>
                {children}
              </ul>
            );
          },
          ol: ({ ...props }) => {
            const { children, className } = props;
            return (
              <ol className={cn("list-decimal pl-4 mb-2 flex flex-col gap-1.5", className)}>
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
        disallowedElements={["img"]}
      >
        {markdown}
      </Markdown>
      {imageCount > 0 && (
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
                // Parser for postId query parameter, it will ensure that the postId is properly set in the image URLs
                const postIdParser = {
                  postId: parseAsString,
                };

                // Serializer for postId query parameter, it will merge the postId with the existing URL and query params
                const serializePostId = createSerializer(postIdParser);

                // Use nuqs serializer to properly merge postId with existing URL and query params
                // This handles cases where URL already has query params or postId
                const imageUrl = serializePostId(src, { postId });

                return (
                  <div
                    className={cn(
                      "relative outline-[0.5px] dark:outline-content2 outline-content3",
                    )}
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
              a: ({ node, ...props }) => {
                const { children, href } = props;

                // Mentions can also appear in image alt text or nearby, though rare in this specific block
                if (href?.startsWith("mention:")) {
                  const parts = href.replace("mention:", "").split(":");
                  const username = parts[1];

                  return (
                    <span
                      className="inline-flex items-center text-primary font-medium bg-accent/50 dark:bg-accent/60 px-1 py-0.5 rounded-md hover:no-underline cursor-pointer"
                      title={`@${username}`}
                    >
                      {children}
                    </span>
                  );
                }

                return (
                  <a href={href} className="text-blue-500 underline hover:text-blue-700">
                    {children}
                  </a>
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
