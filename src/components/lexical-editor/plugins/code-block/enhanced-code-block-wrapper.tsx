"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { CodeBlockEditor } from "@/components/ui/code-block-editor";
import type { EnhancedCodeBlockNode } from "./enhanced-code-block-node";

interface EnhancedCodeBlockWrapperProps {
  node: EnhancedCodeBlockNode;
  language: string;
  code: string;
}

/**
 * Wrapper component that properly integrates CodeBlockEditor with Lexical
 */
export function EnhancedCodeBlockWrapper({ node, language, code }: EnhancedCodeBlockWrapperProps) {
  const [editor] = useLexicalComposerContext();

  /**
   * Handle code changes and update the node
   */
  function handleCodeChange(newCode: string): void {
    editor.update(() => {
      const writableNode = node.getWritable();
      writableNode.setCode(newCode);
    });
  }

  /**
   * Handle language changes and update the node
   */
  function handleLanguageChange(newLanguage: string): void {
    editor.update(() => {
      const writableNode = node.getWritable();
      writableNode.setLanguage(newLanguage);
    });
  }

  /**
   * Handle code block removal
   */
  function handleRemoveCodeBlock(): void {
    editor.update(() => {
      node.remove();
    });
  }

  return (
    <CodeBlockEditor
      initialCode={code}
      initialLanguage={language}
      onCodeChange={handleCodeChange}
      onLanguageChange={handleLanguageChange}
      onRemoveCodeBlock={handleRemoveCodeBlock}
      height="300px"
      showLineNumbers={true}
      className="my-4"
    />
  );
}
