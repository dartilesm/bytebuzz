"use client";

import { Link } from "@heroui/react";
import {
  DecoratorNode,
  type EditorConfig,
  type LexicalEditor,
  type LexicalNode,
  type NodeKey,
  type SerializedLexicalNode,
  type Spread,
} from "lexical";
import type { JSX } from "react";

export interface LinkData {
  url: string;
  text?: string;
}

export interface SerializedLinkNode
  extends Spread<
    {
      linkData: LinkData;
    },
    SerializedLexicalNode
  > {}

export class LinkNode extends DecoratorNode<JSX.Element> {
  __linkData: LinkData;

  static getType(): string {
    return "link";
  }

  static clone(node: LinkNode): LinkNode {
    return new LinkNode(node.__linkData, node.__key);
  }

  constructor(linkData: LinkData, key?: NodeKey) {
    super(key);
    this.__linkData = linkData;
  }

  createDOM(_config: EditorConfig): HTMLElement {
    const span = document.createElement("span");
    span.className = "link-node";
    return span;
  }

  updateDOM(): false {
    return false;
  }

  static importJSON(serializedNode: SerializedLinkNode): LinkNode {
    const { linkData } = serializedNode;
    return $createLinkNode(linkData);
  }

  exportJSON(): SerializedLinkNode {
    return {
      linkData: this.__linkData,
      type: "link",
      version: 1,
    };
  }

  getTextContent(): string {
    return this.__linkData.text || this.__linkData.url;
  }

  decorate(_editor: LexicalEditor, _config: EditorConfig): JSX.Element {
    return (
      <Link
        href={this.__linkData.url}
        isExternal
        showAnchorIcon
        contentEditable={false}
        title={this.__linkData.url}
      >
        {this.__linkData.text || this.__linkData.url}
      </Link>
    );
  }

  isInline(): boolean {
    return true;
  }

  isKeyboardSelectable(): boolean {
    return false;
  }

  getLinkData(): LinkData {
    return this.__linkData;
  }
}

export function $createLinkNode(linkData: LinkData): LinkNode {
  return new LinkNode(linkData);
}

export function $isLinkNode(node: LexicalNode | null | undefined): node is LinkNode {
  return node instanceof LinkNode;
}
