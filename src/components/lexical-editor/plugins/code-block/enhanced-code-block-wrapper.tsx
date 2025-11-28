"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { CodeBlockEditor } from "@/components/ui/code-block-editor";
import type { EnhancedCodeBlockNode } from "./enhanced-code-block-node";
import { useRef, useEffect, type KeyboardEvent } from "react";
import { $createParagraphNode } from "lexical";

interface EnhancedCodeBlockWrapperProps {
  node: EnhancedCodeBlockNode;
  language: string;
  code: string;
  metadata: string;
}

/**
 * Wrapper component that properly integrates CodeBlockEditor with Lexical
 */
export function EnhancedCodeBlockWrapper({
  node,
  language,
  code,
  metadata,
}: EnhancedCodeBlockWrapperProps) {
  const [editor] = useLexicalComposerContext();
  const enterPressCount = useRef(0);
  const enterPressTimer = useRef<NodeJS.Timeout | null>(null);

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
   * Handle metadata changes and update the node
   */
  function handleMetadataChange(newMetadata: string): void {
    editor.update(() => {
      const writableNode = node.getWritable();
      writableNode.setMetadata(newMetadata);
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

  /**
   * Handle exit from code block when pressing Enter multiple times
   */
  function handleExitCodeBlock(): void {
    // First, blur any active Monaco editor to remove focus from the code block
    const activeElement = document.activeElement as HTMLElement;
    activeElement?.blur?.();

    editor.update(() => {
      // Create a new paragraph node after the code block
      const newParagraph = $createParagraphNode();

      // Insert the paragraph after the code block
      node.insertAfter(newParagraph);

      // Select the beginning of the new paragraph
      newParagraph.selectStart();
    });

    // Focus the editor and ensure the cursor is in the new paragraph
    setTimeout(() => {
      editor.focus();

      // Additional focus to ensure the main editor content editable gets the cursor
      const editorElement = editor.getRootElement();
      if (editorElement) {
        editorElement.focus();
      }
    }, 10);
  }

  /**
   * Handle key events for exit detection
   */
  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>): void {
    if (event.key === "Enter" && !event.shiftKey) {
      enterPressCount.current += 1;

      // Clear any existing timer
      if (enterPressTimer.current) {
        clearTimeout(enterPressTimer.current);
      }

      // If we've pressed Enter 3 times in quick succession, exit the code block
      if (enterPressCount.current >= 3) {
        event.preventDefault();
        handleExitCodeBlock();
        enterPressCount.current = 0;
        return;
      }

      // Reset counter after 1 second
      enterPressTimer.current = setTimeout(() => {
        enterPressCount.current = 0;
      }, 1000);
    } else if (event.key !== "Enter") {
      // Reset counter on any other key
      enterPressCount.current = 0;
      if (enterPressTimer.current) {
        clearTimeout(enterPressTimer.current);
      }
    }
  }

  useEffect(() => {
    return () => {
      if (enterPressTimer.current) {
        clearTimeout(enterPressTimer.current);
      }
    };
  }, []);

  return (
    <div onKeyDown={handleKeyDown} tabIndex={-1}>
      <CodeBlockEditor
        initialCode={code}
        initialLanguage={language}
        initialMetadata={metadata}
        onCodeChange={handleCodeChange}
        onLanguageChange={handleLanguageChange}
        onMetadataChange={handleMetadataChange}
        onRemoveCodeBlock={handleRemoveCodeBlock}
        showLineNumbers
      />
    </div>
  );
}
