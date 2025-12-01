"use client";

import Image from "next/image";
import type { ComponentPropsWithoutRef, ReactElement } from "react";
import Markdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { getImagesFromMarkdown } from "@/components/markdown-viewer/functions/get-images-from-markdown";
import { parseCodeBlockMetadata } from "@/components/markdown-viewer/functions/parse-code-block-metadata";
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
  componentEvents?: {
    [key in keyof Omit<Components, "img">]?: {
      onClick?: () => void;
    };
  } & {
    img?: {
      onClick?: (event: {
        images: { src: string; alt: string }[];
        index: number;
        postId: string;
      }) => void;
    };
  };
};

export function MarkdownViewer({
  markdown,
  postId,
  disallowedMediaElements = [],
  componentEvents,
}: MarkdownViewerProps) {
  const allowedMediaElements = getAllowedMediaElements(disallowedMediaElements);

  // Extract images from markdown
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
              <p className={className} onClick={componentEvents?.p?.onClick}>
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
                onClick={componentEvents?.code?.onClick}
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
                onClick={componentEvents?.ul?.onClick}
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
                onClick={componentEvents?.ol?.onClick}
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
                const imageUrl = `${src}?postId=${postId}`;

                // Find index of this image in the images array
                const index = images.findIndex((img) => img.src === imageUrl);

                return (
                  <div
                    className={cn(
                      "relative outline-[0.5px] dark:outline-content2 outline-content3 cursor-pointer",
                    )}
                    onClick={() => {
                      componentEvents?.img?.onClick?.({ images, index, postId });
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
