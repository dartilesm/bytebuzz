"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import React, { type CSSProperties, useEffect } from "react";
import { type ThemeRegistration, codeToHtml } from "shiki";

import oneDarkProTheme from "@shikijs/themes/github-dark";
import oneLightTheme from "@shikijs/themes/one-light";
import { CopyIcon, DownloadIcon } from "lucide-react";
import { addLineNumbers, formatLanguage, getFileExtension } from "./functions/code-block-functions";
import { log } from "@/lib/logger/logger";

interface CodeBlockProps {
  code: string;
  language?: string;
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
  showLineNumbers = true,
  className = "",
  hideSymbol = false,
  tooltipProps = {},
}: CodeBlockProps) {
  const { resolvedTheme } = useTheme();
  const [copied, setCopied] = React.useState(false);
  const [highlightedHtml, setHighlightedHtml] = React.useState<string>("");

  const codeTheme: ThemeRegistration = resolvedTheme === "dark" ? oneDarkProTheme : oneLightTheme;

  // Highlight code with Shiki
  useEffect(() => {
    if (!code) {
      setHighlightedHtml("");
      return;
    }

    /**
     * Highlights code using Shiki
     */
    async function highlightCode() {
      try {
        const highlighted = await codeToHtml(code, {
          lang: language.toLowerCase(),
          theme: codeTheme,
          defaultColor: "dark",
        });

        const processedHtml = addLineNumbers(highlighted, showLineNumbers, hideSymbol);
        setHighlightedHtml(processedHtml);
      } catch (error) {
        log.error("Error highlighting code", { error });
        // Fallback to plain text
        const plainHtml = `<pre class="shiki ${codeTheme}" tabindex="0"><code>${code}</code></pre>`;
        const processedHtml = addLineNumbers(plainHtml, showLineNumbers, hideSymbol);
        setHighlightedHtml(processedHtml);
      }
    }

    highlightCode();
  }, [code, language, showLineNumbers, hideSymbol, resolvedTheme]);

  /**
   * Handles copying code to clipboard
   */
  function handleCopy() {
    navigator.clipboard.writeText(code);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
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

  function handleClick(event: React.MouseEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();
  }

  if (!highlightedHtml) return <Skeleton className='w-full h-full'>{code}</Skeleton>;

  return (
    <div
      className={cn(
        "rounded-lg overflow-hidden border border-border bg-muted/50 cursor-default",
        className
      )}
      style={
        {
          "--editor-background": codeTheme.colors?.["editor.background"] || "inherit",
        } as CSSProperties
      }
      onClick={handleClick}
    >
      <div className='flex items-center justify-between px-2 pt-1 pr-1 bg-[var(--editor-background)]'>
        <div className='flex items-center gap-2'>
          <span className='text-xs font-base cursor-text font-sans text-muted-foreground'>
            {formatLanguage(language)}
          </span>
        </div>
        <div className='flex items-center gap-2'>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant='ghost'
                  size='icon'
                  onClick={handleDownload}
                  aria-label='Download code'
                  className='size-8 min-w-8 text-muted-foreground hover:text-foreground'
                >
                  <DownloadIcon size={14} />
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
                  size='icon'
                  onClick={handleCopy}
                  aria-label='Copy code'
                  className='size-8 min-w-8 text-muted-foreground hover:text-foreground'
                >
                  <CopyIcon size={14} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{copied ? "Copied!" : tooltipProps.content || "Copy code"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <ScrollArea className="max-h-[500px] bg-[var(--editor-background)]">
        <div
          className="text-xs cursor-text [&>pre]:p-2 [&>pre]:m-0"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
          dangerouslySetInnerHTML={{ __html: highlightedHtml }}
        />
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
