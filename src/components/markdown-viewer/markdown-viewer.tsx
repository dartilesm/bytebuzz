"use client";

import { extractCodeBlockMetadata } from "@/components/markdown-viewer/functions/get-code-block-metadata";

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
  CodeBlockLanguage,
} from "@/components/ui/code-block/client";
import { cn } from "@/lib/utils";
import Image from "next/image";
import type { ComponentPropsWithoutRef, ReactElement } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

type ReactElementWithNode = ReactElement & { props: { node: { tagName: string } } };

type MarkdownImageProps = ComponentPropsWithoutRef<"img">;

export function MarkdownViewer({ markdown, postId }: { markdown: string; postId: string }) {
  // Extract image count from markdown by counting ![] patterns
  const imageCount = (markdown.match(/!\[.*?\]\(.*?\)/g) || []).length;

  // Extract metadata from code blocks
  const codeBlockMetadata = extractCodeBlockMetadata(markdown);

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
            const filename = codeBlockMetadata.title;
            const languageValue = language || "text";

            return (
              <CodeBlock
                value={languageValue}
                data={[
                  {
                    language: languageValue,
                    filename: filename,
                    code: codeContent,
                  },
                ]}
              >
                <CodeBlockHeader className="h-8">
                  <CodeBlockLanguage />
                  <CodeBlockFiles>
                    {(item) => (
                      <CodeBlockFilename key={item.language} value={item.language}>
                        {item.filename}
                      </CodeBlockFilename>
                    )}
                  </CodeBlockFiles>
                  <CodeBlockCopyButton
                    onCopy={() => console.log("Copied code to clipboard")}
                    onError={() => console.error("Failed to copy code to clipboard")}
                  />
                </CodeBlockHeader>
                <CodeBlockBody>
                  {(item) => (
                    <CodeBlockItem key={item.language} value={item.language}>
                      <CodeBlockContent
                        language={item.language as BundledLanguage}
                        className="[&>pre]:p-2 [&>pre_.line]:p-0"
                      >
                        {item.code}
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
                const imageUrl = `${src}?postId=${postId}`;

                return (
                  <div
                    className={cn(
                      "relative outline-[0.5px] dark:outline-content2 outline-content3",
                    )}
                  >
                    <Image
                      className="h-full"
                      src={imageUrl}
                      alt={alt || "Image"}
                      fill
                      objectFit="cover"
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
