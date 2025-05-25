"use client";

import { useState, useCallback, useRef } from "react";
import { Button } from "@heroui/button";
import { Select, SelectItem } from "@heroui/select";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { useTheme } from "next-themes";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus, vs } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Copy, Download, Edit3, Eye } from "lucide-react";
import { codeBlockEditorFunctions } from "./functions/code-block-editor-functions";

interface CodeBlockEditorProps {
  /** Initial code content */
  initialCode?: string;
  /** Initial programming language */
  initialLanguage?: string;
  /** Whether the editor is in read-only mode */
  readOnly?: boolean;
  /** Callback when code changes */
  onCodeChange?: (code: string) => void;
  /** Callback when language changes */
  onLanguageChange?: (language: string) => void;
  /** Custom height for the editor */
  height?: string;
  /** Whether to show line numbers */
  showLineNumbers?: boolean;
  /** Custom class name */
  className?: string;
}

/**
 * CodeBlock Editor Component with syntax highlighting, language selection, and editing capabilities
 */
export function CodeBlockEditor({
  initialCode = "",
  initialLanguage = "javascript",
  readOnly = false,
  onCodeChange,
  onLanguageChange,
  height = "400px",
  showLineNumbers = true,
  className = "",
}: CodeBlockEditorProps) {
  const { theme } = useTheme();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [code, setCode] = useState(initialCode);
  const [language, setLanguage] = useState(initialLanguage);
  const [isEditing, setIsEditing] = useState(!readOnly);
  const [copySuccess, setCopySuccess] = useState(false);

  /**
   * Handle code content changes
   */
  function handleCodeChange(newCode: string): void {
    setCode(newCode);
    onCodeChange?.(newCode);
  }

  /**
   * Handle language selection changes
   */
  function handleLanguageChange(newLanguage: string): void {
    setLanguage(newLanguage);
    onLanguageChange?.(newLanguage);
  }

  /**
   * Handle copy to clipboard functionality
   */
  const handleCopyToClipboard = useCallback(async (): Promise<void> => {
    try {
      await codeBlockEditorFunctions.copyToClipboard(code);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error("Failed to copy code:", error);
    }
  }, [code]);

  /**
   * Handle download functionality
   */
  const handleDownload = useCallback((): void => {
    codeBlockEditorFunctions.downloadCode(code, language);
  }, [code, language]);

  /**
   * Toggle between edit and preview mode
   */
  function handleToggleEdit(): void {
    if (!readOnly) {
      setIsEditing(!isEditing);
    }
  }

  /**
   * Handle textarea input changes
   */
  function handleTextareaChange(event: React.ChangeEvent<HTMLTextAreaElement>): void {
    handleCodeChange(event.target.value);
  }

  /**
   * Handle textarea key down events for better editing experience
   */
  function handleTextareaKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>): void {
    if (event.key === "Tab") {
      event.preventDefault();
      const textarea = event.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue = `${code.substring(0, start)}  ${code.substring(end)}`;
      handleCodeChange(newValue);

      // Set cursor position after the inserted spaces
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    }
  }

  const syntaxHighlighterStyle = theme === "dark" ? vscDarkPlus : vs;
  const supportedLanguages = codeBlockEditorFunctions.getSupportedLanguages();

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
        <div className="flex items-center gap-2">
          <Select
            size="sm"
            selectedKeys={[language]}
            onSelectionChange={(keys) => {
              const selectedLanguage = Array.from(keys)[0] as string;
              handleLanguageChange(selectedLanguage);
            }}
            className="min-w-32"
            aria-label="Select programming language"
          >
            {supportedLanguages.map((lang: { value: string; label: string }) => (
              <SelectItem key={lang.value}>{lang.label}</SelectItem>
            ))}
          </Select>

          <Chip size="sm" variant="flat" color="primary">
            {codeBlockEditorFunctions.getLineCount(code)} lines
          </Chip>
        </div>

        <div className="flex items-center gap-2">
          {!readOnly && (
            <Button
              size="sm"
              variant="flat"
              startContent={isEditing ? <Eye size={16} /> : <Edit3 size={16} />}
              onPress={handleToggleEdit}
              aria-label={isEditing ? "Switch to preview mode" : "Switch to edit mode"}
            >
              {isEditing ? "Preview" : "Edit"}
            </Button>
          )}

          <Button
            size="sm"
            variant="flat"
            startContent={<Copy size={16} />}
            onPress={handleCopyToClipboard}
            color={copySuccess ? "success" : "default"}
            aria-label="Copy code to clipboard"
          >
            {copySuccess ? "Copied!" : "Copy"}
          </Button>

          <Button
            size="sm"
            variant="flat"
            startContent={<Download size={16} />}
            onPress={handleDownload}
            aria-label="Download code as file"
          >
            Download
          </Button>
        </div>
      </CardHeader>

      <CardBody className="p-0">
        <div className="relative" style={{ height }}>
          {isEditing ? (
            <textarea
              ref={textareaRef}
              value={code}
              onChange={handleTextareaChange}
              onKeyDown={handleTextareaKeyDown}
              className="absolute inset-0 w-full h-full p-4 font-mono text-sm bg-transparent border-none outline-none resize-none z-10 text-transparent caret-current"
              style={{
                fontFamily:
                  'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
                lineHeight: "1.5",
                tabSize: 2,
              }}
              spellCheck={false}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              aria-label="Code editor"
            />
          ) : null}

          <div className="absolute inset-0 overflow-auto">
            <SyntaxHighlighter
              language={language}
              style={syntaxHighlighterStyle}
              showLineNumbers={showLineNumbers}
              customStyle={{
                margin: 0,
                padding: "1rem",
                background: "transparent",
                fontSize: "0.875rem",
                lineHeight: "1.5",
                fontFamily:
                  'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
              }}
              lineNumberStyle={{
                minWidth: "3em",
                paddingRight: "1em",
                textAlign: "right",
                userSelect: "none",
              }}
            >
              {code || "// Start typing your code here..."}
            </SyntaxHighlighter>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
