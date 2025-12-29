import type { EditorConfig, LexicalNode, NodeKey, SerializedLexicalNode, Spread } from "lexical";
import { DecoratorNode } from "lexical";
import type React from "react";
import { EMOJI_PREFIX } from "@/components/lexical-editor/consts/emoji";
import { getCustomEmojiUrl } from "@/components/lexical-editor/functions/insert-emoji";

export interface InlineMediaType {
  src: string;
  alt: string;
  id?: string;
  width?: number;
  height?: number;
}

export type SerializedInlineImageNode = Spread<
  {
    src: string;
    alt: string;
    id?: string;
    width?: number;
    height?: number;
    type: "inline-image";
    version: 1;
  },
  SerializedLexicalNode
>;

export class InlineImageNode extends DecoratorNode<React.ReactNode> {
  __src: string;
  __alt: string;
  __id?: string;
  __width: number | "inherit";
  __height: number | "inherit";

  static getType(): string {
    return "inline-image";
  }

  static clone(node: InlineImageNode): InlineImageNode {
    return new InlineImageNode(
      node.__src,
      node.__alt,
      node.__id,
      node.__width,
      node.__height,
      node.__key,
    );
  }

  static importJSON(serializedNode: SerializedInlineImageNode): InlineImageNode {
    const { width, height, src, alt, id } = serializedNode;
    return $createInlineImageNode({
      src,
      alt,
      id,
      width,
      height,
    });
  }

  exportJSON(): SerializedInlineImageNode {
    return {
      alt: this.__alt,
      height: this.__height === "inherit" ? 0 : this.__height,
      id: this.__id,
      src: this.__src,
      type: "inline-image",
      version: 1,
      width: this.__width === "inherit" ? 0 : this.__width,
    };
  }

  constructor(
    src: string,
    alt: string,
    id?: string,
    width?: number | "inherit",
    height?: number | "inherit",
    key?: NodeKey,
  ) {
    super(key);
    this.__src = src;
    this.__alt = alt;
    this.__id = id;
    this.__width = width || "inherit";
    this.__height = height || "inherit";
  }

  createDOM(config: EditorConfig): HTMLElement {
    const span = document.createElement("span");
    const theme = config.theme;
    const className = theme.image;
    if (className !== undefined) {
      span.className = className;
    }
    return span;
  }

  updateDOM(): boolean {
    return false;
  }

  decorate(): React.ReactNode {
    return (
      <img
        src={this.__src}
        alt={this.__alt}
        className="inline-block size-5 align-text-bottom object-contain mx-0.5"
      />
    );
  }

  getTextContent(): string {
    const isEmoji = this.__alt.includes(EMOJI_PREFIX);

    if (isEmoji) {
      const emojiId = this.__id || this.__src;
      const emojiUrl = getCustomEmojiUrl(emojiId);

      return `![${this.__alt}](${emojiUrl})`;
    }

    return `![${this.__alt}](${this.__id || this.__src})`;
  }

  // Allow this node to be inline
  isInline(): boolean {
    return true;
  }
}

export function $createInlineImageNode({
  src,
  alt,
  id,
  width,
  height,
}: InlineMediaType): InlineImageNode {
  return new InlineImageNode(src, alt, id, width, height);
}

export function $isInlineImageNode(node: LexicalNode | null | undefined): node is InlineImageNode {
  return node instanceof InlineImageNode;
}
