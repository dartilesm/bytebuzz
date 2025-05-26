"use client";

import {
  DecoratorNode,
  type NodeKey,
  type LexicalNode,
  type SerializedLexicalNode,
  type Spread,
  type EditorConfig,
  type LexicalEditor,
} from "lexical";
import type { JSX } from "react";
import type { User } from "./mentions-plugin";
import { Link } from "@heroui/react";

export interface SerializedMentionNode
  extends Spread<
    {
      user: User;
    },
    SerializedLexicalNode
  > {}

export class MentionNode extends DecoratorNode<JSX.Element> {
  __user: User;

  static getType(): string {
    return "mention";
  }

  static clone(node: MentionNode): MentionNode {
    return new MentionNode(node.__user, node.__key);
  }

  constructor(user: User, key?: NodeKey) {
    super(key);
    this.__user = user;
  }

  createDOM(_config: EditorConfig): HTMLElement {
    const span = document.createElement("span");
    return span;
  }

  updateDOM(): false {
    return false;
  }

  static importJSON(serializedNode: SerializedMentionNode): MentionNode {
    const { user } = serializedNode;
    return $createMentionNode(user);
  }

  exportJSON(): SerializedMentionNode {
    return {
      user: this.__user,
      type: "mention",
      version: 1,
    };
  }

  getTextContent(): string {
    return `@${this.__user.displayName}`;
  }

  decorate(_editor: LexicalEditor, _config: EditorConfig): JSX.Element {
    return (
      <Link contentEditable={false} title={this.__user.displayName}>
        {this.__user.displayName}
      </Link>
    );
  }

  isInline(): boolean {
    return true;
  }

  isKeyboardSelectable(): boolean {
    return false;
  }

  getUser(): User {
    return this.__user;
  }
}

export function $createMentionNode(user: User): MentionNode {
  return new MentionNode(user);
}

export function $isMentionNode(node: LexicalNode | null | undefined): node is MentionNode {
  return node instanceof MentionNode;
}
