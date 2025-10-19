"use client";

import { useState, useCallback, useRef } from "react";
import { Button } from "@heroui/button";
import { Select, SelectItem } from "@heroui/select";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { useTheme } from "next-themes";
import { Editor } from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus, vs } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Copy, Download, Trash } from "lucide-react";
import { codeBlockEditorFunctions } from "./functions/code-block-editor-functions";
import { cn } from "@/lib/utils";
import { getLogger } from "@/lib/logger";

const log = getLogger(__filename);
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
  /** Callback when code block is removed */
  onRemoveCodeBlock?: () => void;
  /** Custom height for the editor */
  height?: string;
  /** Whether to show line numbers */
  showLineNumbers?: boolean;
  /** Custom class name */
  className?: string;
}

/**
 * CodeBlock Editor Component with Monaco Editor, syntax highlighting, language selection, and editing capabilities
 */
export function CodeBlockEditor({
  initialCode = "",
  initialLanguage = "javascript",
  readOnly = false,
  onCodeChange,
  onLanguageChange,
  onRemoveCodeBlock,
  height = "400px",
  showLineNumbers = true,
  className = "",
}: CodeBlockEditorProps) {
  const { theme } = useTheme();
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  const [code, setCode] = useState(initialCode);
  const [language, setLanguage] = useState(initialLanguage);
  const [isEditing, setIsEditing] = useState(!readOnly);
  const [copySuccess, setCopySuccess] = useState(false);

  // Character limit constant
  const CHARACTER_LIMIT = 1000;

  /**
   * Handle code content changes
   */
  function handleCodeChange(newCode: string): void {
    // Enforce character limit using utility function
    const limitedCode = codeBlockEditorFunctions.enforceCharacterLimit(newCode, CHARACTER_LIMIT);

    setCode(limitedCode);
    onCodeChange?.(limitedCode);
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
      log.error({ error }, "Failed to copy code:");
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
   * Handle removing the code block from the editor
   */
  function handleRemoveCodeBlock(): void {
    onRemoveCodeBlock?.();
  }

  /**
   * Handle Monaco Editor mount
   */
  function handleEditorDidMount(editor: editor.IStandaloneCodeEditor): void {
    editorRef.current = editor;
  }

  /**
   * Handle Monaco Editor value changes
   */
  function handleEditorChange(value: string | undefined): void {
    const newValue = value || "";
    handleCodeChange(newValue);
  }

  const syntaxHighlighterStyle = theme === "dark" ? vscDarkPlus : vs;
  const supportedLanguages = codeBlockEditorFunctions.getSupportedLanguages();
  const monacoLanguage = codeBlockEditorFunctions.getMonacoLanguage(language);

  const dynamicHeight = codeBlockEditorFunctions.calculateDynamicHeight(code, height);

  return (
    <Card
      className={cn("w-full [box-shadow:none] border-default-300 border dark:border-0", className)}
    >
      <CardHeader className='flex flex-row items-center justify-between gap-4 pb-2'>
        <div className='flex items-center gap-2'>
          <Select
            size='sm'
            selectedKeys={[language]}
            onSelectionChange={(keys) => {
              const selectedLanguage = Array.from(keys)[0] as string;
              handleLanguageChange(selectedLanguage);
            }}
            className='min-w-32'
            aria-label='Select programming language'
          >
            {supportedLanguages.map((lang: { value: string; label: string }) => (
              <SelectItem key={lang.value}>{lang.label}</SelectItem>
            ))}
          </Select>

          <Chip size='sm' variant='flat' color='primary'>
            {codeBlockEditorFunctions.getLineCount(code)} lines
          </Chip>

          <Chip
            size='sm'
            variant='flat'
            color={
              codeBlockEditorFunctions.getCharacterLimitStatus(code, CHARACTER_LIMIT)
                .isApproachingLimit
                ? "warning"
                : "default"
            }
          >
            {code.length}/{CHARACTER_LIMIT} chars
          </Chip>
        </div>

        <div className='flex items-center gap-2'>
          {/* {!readOnly && (
            <Button
              size="sm"
              variant="flat"
              startContent={isEditing ? <Eye size={16} /> : <Edit3 size={16} />}
              onPress={handleToggleEdit}
              aria-label={isEditing ? "Switch to preview mode" : "Switch to edit mode"}
              className="cursor-pointer"
            >
              {isEditing ? "Preview" : "Edit"}
            </Button>
          )} */}

          <Button
            size='sm'
            variant='flat'
            startContent={<Copy size={16} />}
            onPress={handleCopyToClipboard}
            color={copySuccess ? "success" : "default"}
            aria-label='Copy code to clipboard'
            className='cursor-pointer'
            isIconOnly
          />

          <Button
            size='sm'
            variant='flat'
            startContent={<Download size={16} />}
            onPress={handleDownload}
            aria-label='Download code as file'
            className='cursor-pointer'
            isIconOnly
          />

          {!readOnly && (
            // Delete button
            <Button
              size='sm'
              variant='flat'
              startContent={<Trash size={16} />}
              onPress={handleRemoveCodeBlock}
              aria-label='Delete block code'
              color='danger'
              className='cursor-pointer'
              isIconOnly
            />
          )}
        </div>
      </CardHeader>

      {/* Character limit warning */}
      {(() => {
        const limitStatus = codeBlockEditorFunctions.getCharacterLimitStatus(code, CHARACTER_LIMIT);
        return (
          limitStatus.isApproachingLimit && (
            <div className='px-4 py-2 bg-warning-50 border-b border-warning-200'>
              <p className='text-sm text-warning-700'>
                {limitStatus.isAtLimit
                  ? `Character limit reached (${CHARACTER_LIMIT} characters)`
                  : `Approaching character limit: ${code.length}/${CHARACTER_LIMIT} characters (${limitStatus.percentage}%)`}
              </p>
            </div>
          )
        );
      })()}

      <CardBody className='p-0'>
        <div className='relative' style={{ height: dynamicHeight }}>
          {isEditing ? (
            <div className='absolute inset-0'>
              <Editor
                height='100%'
                language={monacoLanguage}
                value={code}
                onChange={handleEditorChange}
                onMount={handleEditorDidMount}
                theme={theme === "dark" ? "vs-dark" : "light"}
                options={{
                  minimap: { enabled: false },
                  lineNumbers: showLineNumbers ? "on" : "off",
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 2,
                  insertSpaces: true,
                  wordWrap: "on",
                  fontSize: 14,
                  fontFamily:
                    'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
                  readOnly: false,
                  contextmenu: true,
                  selectOnLineNumbers: true,
                  roundedSelection: false,
                  cursorStyle: "line",
                  cursorBlinking: "blink",
                  folding: true,
                  foldingHighlight: true,
                  showFoldingControls: "always",
                  matchBrackets: "always",
                  autoIndent: "full",
                  formatOnPaste: true,
                  formatOnType: true,
                  suggestOnTriggerCharacters: true,
                  acceptSuggestionOnEnter: "on",
                  quickSuggestions: true,
                  parameterHints: { enabled: true },
                  hover: { enabled: true },
                  links: true,
                  colorDecorators: true,
                  bracketPairColorization: { enabled: true },
                  // Show ruler at 90% of character limit
                  rulers: [Math.floor(CHARACTER_LIMIT * 0.9)],
                }}
                loading={
                  <div className='flex items-center justify-center h-full'>
                    <div className='text-default-500'>Loading editor...</div>
                  </div>
                }
              />
            </div>
          ) : (
            <div className='absolute inset-0 overflow-auto'>
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
          )}
        </div>
      </CardBody>
    </Card>
  );
}
