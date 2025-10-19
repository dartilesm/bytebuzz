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
import { logger } from "@/lib/logger";

const log = logger.child({ module: "enhanced-code-block-node" });

export interface SerializedEnhancedCodeBlockNode extends SerializedLexicalNode {
  language: string;
  code: string;
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

  static getType(): string {
    return "enhanced-code-block";
  }

  static clone(node: EnhancedCodeBlockNode): EnhancedCodeBlockNode {
    return new EnhancedCodeBlockNode(node.__language, node.__code, node.__key);
  }

  constructor(language: string, code = "", key?: NodeKey) {
    super(key);
    this.__language = language;
    this.__code = code;
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

  createDOM(): HTMLElement {
    const element = document.createElement("div");
    element.setAttribute("data-lexical-enhanced-code-block", "true");
    element.setAttribute("data-language", this.__language);
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
    const { language, code } = serializedNode;
    return $createEnhancedCodeBlockNode(language, code);
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement("div");
    element.setAttribute("data-lexical-enhanced-code-block", "true");
    element.setAttribute("data-language", this.__language);

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
      type: "enhanced-code-block",
      version: 1,
    };
  }

  /**
   * Renders the CodeBlockEditor component
   */
  decorate(): React.ReactElement {
    log.info({ code: this.__code, language: this.__language }, "decorate");
    return <EnhancedCodeBlockWrapper node={this} code={this.__code} language={this.__language} />;
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
export function $createEnhancedCodeBlockNode(language: string, code = ""): EnhancedCodeBlockNode {
  return new EnhancedCodeBlockNode(language, code);
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

    // Try to extract code from a pre/code element if it exists
    const codeElement = node.querySelector("code");
    const code = codeElement?.textContent || "";

    return {
      node: $createEnhancedCodeBlockNode(language, code),
    };
  }

  return { node: null };
}
