"use client";

import { parseCodeBlockMetadata } from "@/components/markdown-viewer/functions/parse-code-block-metadata";
import { serializeCodeBlockMetadata } from "@/components/markdown-viewer/functions/serialize-code-block-metadata";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { log } from "@/lib/logger/logger";
import { cn } from "@/lib/utils";
import { Editor } from "@monaco-editor/react";
import { Copy, Download, MoreVertical, Trash } from "lucide-react";
import type { editor } from "monaco-editor";
import { useTheme } from "next-themes";
import { useCallback, useRef, useState } from "react";
import { codeBlockEditorFunctions } from "./functions/code-block-editor-functions";

// Character limit constant
const CHARACTER_LIMIT = 10_000;

export interface CodeBlockEditorValue {
  code: string;
  language: string;
  metadata: string;
}

interface CodeBlockEditorProps {
  /** Initial code content */
  initialCode?: string;
  /** Initial programming language */
  initialLanguage?: string;
  /** Callback when value changes */
  onChange?: (value: CodeBlockEditorValue) => void;
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
  onChange,
  onRemoveCodeBlock,
  height = "400px",
  showLineNumbers = true,
  className = "",
}: CodeBlockEditorProps) {
  const { theme } = useTheme();
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  const [code, setCode] = useState(initialCode);
  const [language, setLanguage] = useState(initialLanguage);
  const [metadata, setMetadata] = useState(
    serializeCodeBlockMetadata({
      fileName: `code.${codeBlockEditorFunctions.getLanguageExtension(language)}`,
    }),
  );

  function handleOnChange(updates: Partial<CodeBlockEditorValue>) {
    const newCode = updates.code ?? code;
    const newLanguage = updates.language ?? language;
    const newMetadata = updates.metadata ?? metadata;

    if (updates.code !== undefined) setCode(newCode);
    if (updates.language !== undefined) setLanguage(newLanguage);
    if (updates.metadata !== undefined) setMetadata(newMetadata);

    onChange?.({
      code: newCode,
      language: newLanguage,
      metadata: newMetadata,
    });
  }

  function handleCodeChange(newCode: string): void {
    // Enforce character limit using utility function
    const limitedCode = codeBlockEditorFunctions.enforceCharacterLimit(newCode, CHARACTER_LIMIT);
    handleOnChange({ code: limitedCode });
  }

  function handleLanguageChange(newLanguage: string): void {
    handleOnChange({ language: newLanguage });
  }

  function handleMetadataChange(metadataName: string, metadataValue: string): void {
    const parsedMetadata = parseCodeBlockMetadata(metadata);
    const serializedMetadata = serializeCodeBlockMetadata({
      ...parsedMetadata,
      [metadataName]: metadataValue,
    });
    handleOnChange({ metadata: serializedMetadata });
  }

  const handleCopyToClipboard = useCallback(async (): Promise<void> => {
    try {
      await codeBlockEditorFunctions.copyToClipboard(code);
    } catch (error) {
      log.error("Failed to copy code", { error });
    }
  }, [code]);

  const handleDownload = useCallback((): void => {
    codeBlockEditorFunctions.downloadCode(code, language);
  }, [code, language]);

  function handleRemoveCodeBlock(): void {
    onRemoveCodeBlock?.();
  }

  function handleEditorDidMount(editor: editor.IStandaloneCodeEditor): void {
    editorRef.current = editor;
  }

  function handleEditorChange(value: string | undefined): void {
    const newValue = value || "";
    handleCodeChange(newValue);
  }

  const supportedLanguages = codeBlockEditorFunctions.getSupportedLanguages();
  const monacoLanguage = codeBlockEditorFunctions.getMonacoLanguage(language);

  const dynamicHeight = codeBlockEditorFunctions.calculateDynamicHeight(code, height);

  const languageExtension = codeBlockEditorFunctions.getLanguageExtension(language);

  /* const limitStatus = codeBlockEditorFunctions.getCharacterLimitStatus(code, CHARACTER_LIMIT); */

  return (
    <Card className={cn("w-full border-border border p-0 gap-0 overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 p-2 h-10 bg-accent/30">
        <div>
          <Select
            value={language}
            onValueChange={(value) => handleLanguageChange(value)}
            variant="flat"
            size="sm"
          >
            <SelectTrigger>
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              {supportedLanguages.map((lang: { value: string; label: string }) => (
                <SelectItem key={lang.value} value={lang.value}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Input
            placeholder="Filename (optional)"
            defaultValue={`code.${languageExtension}`}
            variant="flat"
            size="sm"
            onChange={(e) => handleMetadataChange("fileName", e.target.value)}
          />
        </div>

        <div className="flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                <MoreVertical size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleCopyToClipboard} className="cursor-pointer">
                <Copy className="mr-2 h-4 w-4" />
                <span>Copy code</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDownload} className="cursor-pointer">
                <Download className="mr-2 h-4 w-4" />
                <span>Download</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleRemoveCodeBlock}
                className="text-destructive focus:text-destructive data-highlighted:bg-destructive/20 cursor-pointer"
              >
                <Trash className="mr-2 h-4 w-4 text-inherit" />
                <span>Delete block</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {/* Character limit warning */}
        {/* {limitStatus.isApproachingLimit && (
          <div className='px-4 py-2 bg-warning-50 border-b border-warning-200'>
            <p className='text-sm text-warning-700'>
              {limitStatus.isAtLimit
                ? `Character limit reached (${CHARACTER_LIMIT} characters)`
                : `Approaching character limit: ${code.length}/${CHARACTER_LIMIT} characters (${limitStatus.percentage}%)`}
            </p>
          </div>
        )} */}
      </CardHeader>

      <CardContent className="p-0">
        <div className="relative" style={{ height: dynamicHeight }}>
          <div className="absolute inset-0">
            <Editor
              height="100%"
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
                <div className="flex items-center justify-center h-full">
                  <div className="text-default-500">Loading editor...</div>
                </div>
              }
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between gap-2 p-2">
        <Badge variant="secondary">{codeBlockEditorFunctions.getLineCount(code)} lines</Badge>

        <Badge
          variant={
            codeBlockEditorFunctions.getCharacterLimitStatus(code, CHARACTER_LIMIT)
              .isApproachingLimit
              ? "destructive"
              : "secondary"
          }
        >
          {code.length}/{CHARACTER_LIMIT} chars
        </Badge>
      </CardFooter>
    </Card>
  );
}
