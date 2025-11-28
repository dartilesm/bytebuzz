"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { type CSSProperties, type MouseEvent, useEffect, useState } from "react";
import { type ThemeRegistration, codeToHtml } from "shiki";

import githubDarkHighContrast from "@shikijs/themes/github-dark-high-contrast";
import githubLightTheme from "@shikijs/themes/github-light";
import { CheckIcon, CopyIcon, DownloadIcon, XIcon } from "lucide-react";
import { addLineNumbers, formatLanguage, getFileExtension } from "./functions/code-block-functions";
import { log } from "@/lib/logger/logger";
import { useCopyToClipboard, useDebounceCallback } from "usehooks-ts";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

const enum COPY_STATUS {
  IDLE = "idle",
  COPIED = "copied",
  ERROR = "error",
}

interface CodeBlockProps {
  code: string;
  language?: string;
  metadata?: string;
  showLineNumbers?: boolean;
  className?: string;
  hideSymbol?: boolean;
  tooltipProps?: {
    content?: string;
    color?: "primary" | "default" | "secondary" | "success" | "warning" | "danger" | "foreground";
    [key: string]: unknown;
  };
}

/**
 * CodeBlock component that renders syntax highlighted code using Shiki
 */
export function CodeBlock({
  code = "",
  language = "javascript",
  metadata,
  showLineNumbers = true,
  className = "",
  hideSymbol = false,
}: CodeBlockProps) {
  const { resolvedTheme } = useTheme();

  const [copyStatus, setCopyStatus] = useState<COPY_STATUS>(COPY_STATUS.IDLE);
  const debouncedSetCopyStatus = useDebounceCallback(setCopyStatus, 2000);

  const [_, copyCodeBlock] = useCopyToClipboard();

  const codeTheme: ThemeRegistration =
    resolvedTheme === "dark" ? githubDarkHighContrast : githubLightTheme;

  const { data: highlightedHtml } = useQuery({
    queryKey: ["code-block", code, language, showLineNumbers, hideSymbol, codeTheme],
    queryFn: () => getHighlightedCode(),
    enabled: !!code,
  });

  async function getHighlightedCode() {
    if (!code) return "";

    try {
      const highlighted = await codeToHtml(code, {
        lang: language.toLowerCase(),
        theme: codeTheme,
        defaultColor: "dark",
      });

      const processedHtml = addLineNumbers(highlighted, showLineNumbers, hideSymbol);
      return processedHtml;
    } catch (error) {
      log.error("Error highlighting code", { error });
      // Fallback to plain text
      const plainHtml = `<pre class="shiki ${codeTheme}" tabindex="0"><code>${code}</code></pre>`;
      const processedHtml = addLineNumbers(plainHtml, showLineNumbers, hideSymbol);
      return processedHtml;
    }
  }

  /**
   * Handles copying code to clipboard
   */
  async function handleCopy() {
    try {
      throw new Error("Failed to copy code");
      await copyCodeBlock(code);
      setCopyStatus(COPY_STATUS.COPIED);
    } catch (error) {
      log.error("Failed to copy code", { error });
      toast.warning("Failed to copy code");
      setCopyStatus(COPY_STATUS.ERROR);
    } finally {
      debouncedSetCopyStatus(COPY_STATUS.IDLE);
    }
  }

  /**
   * Handles downloading code as a file
   */
  function handleDownload() {
    if (!code) return;

    const extension = getFileExtension(language);
    const filename = `code.${extension}`;

    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.style.display = "none";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

  function handleClick(event: MouseEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();
  }

  if (!highlightedHtml) return <Skeleton className='w-full h-full'>{code}</Skeleton>;

  return (
    <div
      className={cn(
        "rounded-lg overflow-hidden border border-border bg-muted/50 cursor-default group/code-block",
        className
      )}
      style={
        {
          "--editor-background": codeTheme.colors?.["editor.background"] || "inherit",
        } as CSSProperties
      }
      onClick={handleClick}
      data-metadata={metadata || undefined}
    >
      <div className='flex items-center justify-between px-2 pt-1 pr-1 bg-(--editor-background)'>
        <div className='flex items-center gap-2'>
          <span className='text-xs font-base cursor-text font-sans text-muted-foreground'>
            {formatLanguage(language)}
          </span>
        </div>
        <div className='flex items-center gap-2 opacity-0 group-hover/code-block:opacity-100 transition-opacity duration-200'>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant='ghost'
                  onClick={handleDownload}
                  aria-label='Download code'
                  className='size-6 text-muted-foreground hover:text-foreground group/download-button rounded-md'
                >
                  <DownloadIcon className='size-3 text-muted-foreground/60 group-hover/download-button:text-foreground' />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Download code</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant='ghost'
                  onClick={handleCopy}
                  aria-label='Copy code'
                  className='size-6 text-muted-foreground hover:text-foreground group/copy-button rounded-md'
                >
                  {copyStatus === COPY_STATUS.IDLE && (
                    <CopyIcon className='size-3 text-muted-foreground/60 group-hover/copy-button:text-foreground' />
                  )}
                  {copyStatus === COPY_STATUS.COPIED && (
                    <CheckIcon className='size-3 text-muted-foreground/60 group-hover/copy-button:text-foreground' />
                  )}
                  {copyStatus === COPY_STATUS.ERROR && (
                    <XIcon className='size-3 text-muted-foreground/60 group-hover/copy-button:text-foreground' />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {copyStatus === COPY_STATUS.IDLE && "Copy code"}
                {copyStatus === COPY_STATUS.COPIED && "Copied!"}
                {copyStatus === COPY_STATUS.ERROR && "Failed to copy code"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <ScrollArea className='max-h-[500px] bg-(--editor-background)'>
        <div
          className='text-xs cursor-text [&>pre]:p-2 [&>pre]:m-0'
          dangerouslySetInnerHTML={{ __html: highlightedHtml }}
        />
        <ScrollBar orientation='horizontal' />
      </ScrollArea>
    </div>
  );
}
