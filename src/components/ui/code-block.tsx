"use client";

import { Button, Tooltip } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useTheme } from "next-themes";
import React, { useEffect } from "react";
import { type BundledTheme, type CodeOptionsSingleTheme, codeToHtml } from "shiki";

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
  const { theme } = useTheme();
  const [copied, setCopied] = React.useState(false);
  const [highlightedHtml, setHighlightedHtml] = React.useState<string>("");

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
   * Formats language display name for UI
   */
  function formatLanguage(lang: string): string {
    const languageMap: Record<string, string> = {
      js: "JavaScript",
      javascript: "JavaScript",
      ts: "TypeScript",
      typescript: "TypeScript",
      jsx: "JSX",
      tsx: "TSX",
      html: "HTML",
      css: "CSS",
      scss: "SCSS",
      py: "Python",
      python: "Python",
      rb: "Ruby",
      go: "Go",
      rust: "Rust",
      java: "Java",
      c: "C",
      cpp: "C++",
      cs: "C#",
      php: "PHP",
      swift: "Swift",
      kotlin: "Kotlin",
      shell: "Shell",
      bash: "Bash",
      json: "JSON",
      yaml: "YAML",
      md: "Markdown",
      sql: "SQL",
    };

    return languageMap[lang.toLowerCase()] || lang;
  }

  /**
   * Gets appropriate icon for the programming language
   */
  function getLanguageIcon(lang: string): string {
    const iconMap: Record<string, string> = {
      javascript: "logos:javascript",
      js: "logos:javascript",
      typescript: "logos:typescript-icon",
      ts: "logos:typescript-icon",
      jsx: "logos:react",
      tsx: "logos:react",
      html: "logos:html-5",
      css: "logos:css-3",
      scss: "logos:sass",
      python: "logos:python",
      py: "logos:python",
      ruby: "logos:ruby",
      rb: "logos:ruby",
      go: "logos:go",
      rust: "logos:rust",
      java: "logos:java",
      c: "logos:c",
      cpp: "logos:c-plusplus",
      cs: "logos:c-sharp",
      php: "logos:php",
      swift: "logos:swift",
      kotlin: "logos:kotlin",
      shell: "logos:terminal",
      bash: "logos:terminal",
      json: "logos:json",
      yaml: "logos:yaml",
      markdown: "logos:markdown",
      md: "logos:markdown",
      sql: "logos:mysql",
    };

    return iconMap[lang.toLowerCase()] || "lucide:code";
  }

  /**
   * Adds line numbers to highlighted HTML
   */
  function addLineNumbers(html: string): string {
    if (!showLineNumbers || hideSymbol) {
      return html;
    }

    // Extract the content between <pre> and </pre> tags
    const preMatch = html.match(/<pre[^>]*>([\s\S]*?)<\/pre>/);
    if (!preMatch) return html;

    const codeContent = preMatch[1];
    const lines = codeContent.split("\n");
    const paddingWidth = lines.length.toString().length;

    const linesWithNumbers = lines
      .map((line: string, index: number) => {
        const lineNumber = (index + 1).toString().padStart(paddingWidth, " ");
        return `<span class="code-line-number text-default-400" style="display: inline-block; min-width: ${paddingWidth + 3}ch; user-select: none;">${lineNumber} |</span> ${line}`;
      })
      .join("\n");

    return html.replace(preMatch[1], linesWithNumbers);
  }

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
      const codeTheme: CodeOptionsSingleTheme<BundledTheme>["theme"] =
        theme === "dark" ? "github-dark" : "github-light";

      try {
        const highlighted = await codeToHtml(code, {
          lang: language.toLowerCase(),
          theme: codeTheme,
        });

        const processedHtml = addLineNumbers(highlighted);
        setHighlightedHtml(processedHtml);
      } catch (error) {
        console.error("Error highlighting code:", error);
        // Fallback to plain text
        const plainHtml = `<pre class="shiki ${codeTheme}" style="background-color:#121212;color:#dbd7caee" tabindex="0"><code>${code}</code></pre>`;
        const processedHtml = addLineNumbers(plainHtml);
        setHighlightedHtml(processedHtml);
      }
    }

    highlightCode();
  }, [code, language, showLineNumbers, hideSymbol, theme]);

  return (
    <div
      className={`rounded-lg overflow-hidden border border-default-200 bg-content1 ${className}`}
    >
      <div className="flex items-center justify-between px-4 py-2 bg-content2 border-b border-default-200">
        <div className="flex items-center gap-2">
          <Icon icon={getLanguageIcon(language)} className="w-5 h-5" />
          <span className="text-sm font-medium">{formatLanguage(language)}</span>
        </div>
        <Tooltip
          content={copied ? "Copied!" : tooltipProps.content || "Copy code"}
          placement="left"
          color={tooltipProps.color || "default"}
        >
          <Button
            isIconOnly
            size="sm"
            variant="flat"
            color="default"
            onPress={handleCopy}
            aria-label="Copy code"
          >
            <Icon icon={copied ? "lucide:check" : "lucide:copy"} className="w-4 h-4" />
          </Button>
        </Tooltip>
      </div>
      <div
        className="overflow-auto max-h-[500px] [&>pre]:p-4 [&>pre]:m-0 [&>pre]:bg-transparent"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
        dangerouslySetInnerHTML={{ __html: highlightedHtml }}
      />
    </div>
  );
}
