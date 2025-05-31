"use client";

import type {
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  EditorConfig,
  LexicalNode,
  NodeKey,
  SerializedTextNode,
  Spread,
} from "lexical";
import { TextNode } from "lexical";

export interface User {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
}

export type SerializedMentionNode = Spread<
  {
    user: User;
  },
  SerializedTextNode
>;

/**
 * Checks if a given node is a MentionNode
 */
export function $isMentionNode(node: LexicalNode | null | undefined): node is MentionNode {
  return node instanceof MentionNode;
}

/**
 * Creates a new MentionNode with the given user data
 */
export function $createMentionNode(user: User): MentionNode {
  const mentionNode = new MentionNode(user);
  mentionNode.setMode("token").toggleDirectionless();
  return mentionNode;
}

/**
 * MentionNode represents a user mention in the editor
 *
 * This node extends TextNode to display mentions as interactive elements
 * that can be clicked, styled, and exported to different formats.
 */
export class MentionNode extends TextNode {
  __user: User;

  static getType(): string {
    return "mention";
  }

  static clone(node: MentionNode): MentionNode {
    return new MentionNode(node.__user, node.__text, node.__key);
  }

  constructor(user: User, text?: string, key?: NodeKey) {
    super(text ?? `@${user.username}`, key);
    this.__user = user;
  }

  /**
   * Gets the user data associated with this mention
   */
  getUser(): User {
    return this.__user;
  }

  /**
   * Sets the user data for this mention
   */
  setUser(user: User): void {
    // biome-ignore lint/suspicious/noExplicitAny: Lexical API requires any type for getWritable
    const writable = this.getWritable() as any;
    writable.__user = user;
    writable.__text = `@${user.username}`;
  }

  createDOM(config: EditorConfig): HTMLElement {
    const element = super.createDOM(config);
    element.className = "mention";
    element.setAttribute("data-mention-id", this.__user.id);
    element.setAttribute("data-mention-username", this.__user.username);
    element.setAttribute("role", "button");
    element.setAttribute("tabindex", "0");
    element.setAttribute("aria-label", `Mention ${this.__user.displayName}`);
    return element;
  }

  updateDOM(prevNode: MentionNode, anchor: HTMLElement, config: EditorConfig): boolean {
    const updated = super.updateDOM(prevNode, anchor, config);
    if (this.__user !== prevNode.__user) {
      anchor.setAttribute("data-mention-id", this.__user.id);
      anchor.setAttribute("data-mention-username", this.__user.username);
      anchor.setAttribute("aria-label", `Mention ${this.__user.displayName}`);
    }
    return updated;
  }

  static importDOM(): DOMConversionMap | null {
    return {
      span: () => ({
        conversion: $convertMentionElement,
        priority: 1,
      }),
    };
  }

  static importJSON(serializedNode: SerializedMentionNode): MentionNode {
    const { user, text, format, detail, mode, style } = serializedNode;
    const node = $createMentionNode(user);
    node.setTextContent(text);
    node.setFormat(format);
    node.setDetail(detail);
    node.setMode(mode);
    node.setStyle(style);
    return node;
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement("span");
    element.setAttribute("data-mention-id", this.__user.id);
    element.setAttribute("data-mention-username", this.__user.username);
    element.className = "mention";
    element.textContent = this.__text;
    return { element };
  }

  exportJSON(): SerializedMentionNode {
    return {
      ...super.exportJSON(),
      user: this.__user,
      type: "mention",
      version: 1,
    };
  }

  canInsertTextBefore(): boolean {
    return false;
  }

  canInsertTextAfter(): boolean {
    return false;
  }

  isTextEntity(): boolean {
    return true;
  }
}

/**
 * Converts a DOM element to a MentionNode
 */
function $convertMentionElement(domNode: Node): DOMConversionOutput {
  const node = domNode as HTMLElement;
  const mentionId = node.getAttribute("data-mention-id");
  const mentionUsername = node.getAttribute("data-mention-username");

  if (mentionId && mentionUsername) {
    const user: User = {
      id: mentionId,
      username: mentionUsername,
      displayName: mentionUsername, // Fallback to username
    };

    return {
      node: $createMentionNode(user),
    };
  }

  return { node: null };
}
