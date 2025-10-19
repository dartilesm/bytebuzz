"use client";

import { Button, ScrollShadow, Skeleton, Tooltip, cn } from "@heroui/react";
import { useTheme } from "next-themes";
import React, { type CSSProperties, useEffect } from "react";
import { type ThemeRegistration, codeToHtml } from "shiki";

import oneDarkProTheme from "@shikijs/themes/github-dark";
import oneLightTheme from "@shikijs/themes/one-light";
import { CopyIcon, DownloadIcon } from "lucide-react";
import { addLineNumbers, formatLanguage, getFileExtension } from "./functions/code-block-functions";
import { logger } from "@/lib/logger";

const log = logger.child({ module: "code-block" });

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
        log.error({ error }, "Error highlighting code:");
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
        "rounded-lg overflow-hidden border border-default-200 bg-content1 cursor-default",
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
          <span className='text-xs font-base cursor-text font-sans text-default-500'>
            {formatLanguage(language)}
          </span>
        </div>
        <div className='flex items-center gap-2'>
          <Tooltip content='Download code' color='default'>
            <Button
              isIconOnly
              variant='light'
              color='default'
              onPress={handleDownload}
              aria-label='Download code'
              className='size-8 min-w-8 text-default-400 hover:text-default-500'
            >
              <DownloadIcon size={14} />
            </Button>
          </Tooltip>
          <Tooltip
            content={copied ? "Copied!" : tooltipProps.content || "Copy code"}
            color={tooltipProps.color || "default"}
          >
            <Button
              isIconOnly
              variant='light'
              color='default'
              onPress={handleCopy}
              aria-label='Copy code'
              className='size-8 min-w-8 text-default-400 hover:text-default-500'
            >
              <CopyIcon size={14} />
            </Button>
          </Tooltip>
        </div>
      </div>

      <ScrollShadow
        className={cn(
          "max-h-[500px] overflow-auto [&>pre]:m-0 bg-[var(--editor-background)] text-xs cursor-text [&>pre]:p-2",
          "data-[left-scroll=true]:[mask-image:linear-gradient(270deg,var(--editor-background)_calc(100%_-_var(--scroll-shadow-size)),transparent)] data-[right-scroll=true]:[mask-image:linear-gradient(90deg,var(--editor-background)_calc(100%_-_var(--scroll-shadow-size)),transparent)] data-[left-right-scroll=true]:[mask-image:linear-gradient(to_right,var(--editor-background),var(--editor-background),transparent_0,var(--editor-background)_var(--scroll-shadow-size),var(--editor-background)_calc(100%_-_var(--scroll-shadow-size)),transparent)]"
        )}
        orientation='horizontal'
        // biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
        dangerouslySetInnerHTML={{ __html: highlightedHtml }}
      />
    </div>
  );
}
