"use client";

import type React from "react";
import type {
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
} from "lexical";
import { DecoratorNode } from "lexical";
import { EnhancedCodeBlockWrapper } from "./enhanced-code-block-wrapper";
import { log } from "@/lib/logger/logger";

export interface SerializedEnhancedCodeBlockNode extends SerializedLexicalNode {
  language: string;
  code: string;
  metadata?: string;
}

/**
 * Enhanced Code Block Node that renders the CodeBlockEditor component
 *
 * This provides a much richer code editing experience compared to basic code blocks:
 * - Monaco Editor integration
 * - Syntax highlighting with Prism
 * - Language selection dropdown
 * - Copy/download functionality
 * - Character limits and line counting
 * - Theme support
 */
export class EnhancedCodeBlockNode extends DecoratorNode<React.ReactElement> {
  __language: string;
  __code: string;
  __metadata: string;

  static getType(): string {
    return "enhanced-code-block";
  }

  static clone(node: EnhancedCodeBlockNode): EnhancedCodeBlockNode {
    return new EnhancedCodeBlockNode(node.__language, node.__code, node.__key, node.__metadata);
  }

  constructor(language: string, code = "", key?: NodeKey, metadata = "") {
    super(key);
    this.__language = language;
    this.__code = code;
    this.__metadata = metadata;
  }

  /**
   * Gets the programming language for this code block
   */
  getLanguage(): string {
    return this.__language;
  }

  /**
   * Sets the programming language for this code block
   */
  setLanguage(language: string): void {
    const writable = this.getWritable();
    writable.__language = language;
  }

  /**
   * Gets the code content
   */
  getCode(): string {
    return this.__code;
  }

  /**
   * Sets the code content
   */
  setCode(code: string): void {
    const writable = this.getWritable();
    writable.__code = code;
  }

  /**
   * Gets the metadata for this code block
   */
  getMetadata(): string {
    return this.__metadata;
  }

  /**
   * Sets the metadata for this code block
   */
  setMetadata(metadata: string): void {
    const writable = this.getWritable();
    writable.__metadata = metadata;
  }

  createDOM(): HTMLElement {
    const element = document.createElement("div");
    element.setAttribute("data-lexical-enhanced-code-block", "true");
    element.setAttribute("data-language", this.__language);
    if (this.__metadata) {
      element.setAttribute("data-metadata", this.__metadata);
    }
    return element;
  }

  updateDOM(): boolean {
    return false;
  }

  static importDOM(): DOMConversionMap | null {
    return {
      div: () => ({
        conversion: $convertEnhancedCodeBlockElement,
        priority: 1,
      }),
    };
  }

  static importJSON(serializedNode: SerializedEnhancedCodeBlockNode): EnhancedCodeBlockNode {
    const { language, code, metadata } = serializedNode;
    return $createEnhancedCodeBlockNode(language, code, metadata);
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement("div");
    element.setAttribute("data-lexical-enhanced-code-block", "true");
    element.setAttribute("data-language", this.__language);
    if (this.__metadata) {
      element.setAttribute("data-metadata", this.__metadata);
    }

    // Create a pre element with the code for export
    const pre = document.createElement("pre");
    const codeElement = document.createElement("code");
    codeElement.className = `language-${this.__language}`;
    codeElement.textContent = this.__code;
    pre.appendChild(codeElement);
    element.appendChild(pre);

    return { element };
  }

  exportJSON(): SerializedEnhancedCodeBlockNode {
    return {
      language: this.__language,
      code: this.__code,
      metadata: this.__metadata || undefined,
      type: "enhanced-code-block",
      version: 1,
    };
  }

  /**
   * Renders the CodeBlockEditor component
   */
  decorate(): React.ReactElement {
    log.info("Decorate code block", {
      code: this.__code,
      language: this.__language,
      metadata: this.__metadata,
    });
    return (
      <EnhancedCodeBlockWrapper
        node={this}
        code={this.__code}
        language={this.__language}
        metadata={this.__metadata}
      />
    );
  }

  isInline(): boolean {
    return false;
  }

  isKeyboardSelectable(): boolean {
    return true;
  }
}

/**
 * Creates a new EnhancedCodeBlockNode
 */
export function $createEnhancedCodeBlockNode(
  language: string,
  code = "",
  metadata = ""
): EnhancedCodeBlockNode {
  return new EnhancedCodeBlockNode(language, code, undefined, metadata);
}

/**
 * Checks if a node is an EnhancedCodeBlockNode
 */
export function $isEnhancedCodeBlockNode(
  node: LexicalNode | null | undefined
): node is EnhancedCodeBlockNode {
  return node instanceof EnhancedCodeBlockNode;
}

/**
 * Converts a DOM element to an EnhancedCodeBlockNode
 */
function $convertEnhancedCodeBlockElement(domNode: Node): DOMConversionOutput {
  const node = domNode as HTMLElement;

  if (node.getAttribute("data-lexical-enhanced-code-block") === "true") {
    const language = node.getAttribute("data-language") || "javascript";
    const metadata = node.getAttribute("data-metadata") || "";

    // Try to extract code from a pre/code element if it exists
    const codeElement = node.querySelector("code");
    const code = codeElement?.textContent || "";

    return {
      node: $createEnhancedCodeBlockNode(language, code, metadata),
    };
  }

  return { node: null };
}
