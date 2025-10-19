"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect, useState, useCallback } from "react";
import { $getSelection, $isRangeSelection } from "lexical";
import { mergeRegister } from "@lexical/utils";
import type { TextNode } from "lexical";
import { $createMentionNode, type User } from "./mention-node";
import { MentionSuggestions } from "@/components/lexical-editor/plugins/mentions/mention-suggestions";
import { log } from "@/lib/logger/logger";

interface MentionPluginProps {
  /**
   * Character that triggers the mention dropdown
   */
  trigger?: string;
  /**
   * Maximum number of suggestions to show
   */
  maxSuggestions?: number;
  /**
   * Function to search for users
   */
  onSearch?: (query: string) => Promise<User[]> | User[];
}

interface MentionState {
  isOpen: boolean;
  query: string;
  position: { top: number; left: number } | null;
  suggestions: User[];
  selectedIndex: number;
}

/**
 * Mock user search function - replace with actual user search
 */
async function mockUserSearch(query: string): Promise<User[]> {
  const mockUsers: User[] = [
    { id: "1", username: "john_doe", displayName: "John Doe", avatarUrl: "/avatars/john.jpg" },
    { id: "2", username: "jane_smith", displayName: "Jane Smith", avatarUrl: "/avatars/jane.jpg" },
    { id: "3", username: "bob_wilson", displayName: "Bob Wilson", avatarUrl: "/avatars/bob.jpg" },
    {
      id: "4",
      username: "alice_brown",
      displayName: "Alice Brown",
      avatarUrl: "/avatars/alice.jpg",
    },
  ];

  if (!query) return mockUsers;

  return mockUsers.filter(
    (user) =>
      user.username.toLowerCase().includes(query.toLowerCase()) ||
      user.displayName.toLowerCase().includes(query.toLowerCase())
  );
}

/**
 * Plugin that handles mention functionality in Lexical editor
 *
 * Features:
 * - Detects when user types trigger character (default: "@")
 * - Shows suggestion dropdown with user search
 * - Handles keyboard navigation and selection
 * - Converts selected mention to MentionNode
 */
export function MentionPlugin({
  trigger = "@",
  maxSuggestions = 5,
  onSearch = mockUserSearch,
}: MentionPluginProps = {}) {
  const [editor] = useLexicalComposerContext();
  const [mentionState, setMentionState] = useState<MentionState>({
    isOpen: false,
    query: "",
    position: null,
    suggestions: [],
    selectedIndex: 0,
  });

  /**
   * Searches for users based on query
   */
  const searchUsers = useCallback(
    async (query: string) => {
      try {
        const results = await onSearch(query);
        return results.slice(0, maxSuggestions);
      } catch (error) {
        log.error("Error searching users", { error });
        return [];
      }
    },
    [onSearch, maxSuggestions]
  );

  /**
   * Closes the mention dropdown
   */
  const closeMentions = useCallback(() => {
    setMentionState((prev) => ({
      ...prev,
      isOpen: false,
      query: "",
      position: null,
      suggestions: [],
      selectedIndex: 0,
    }));
  }, []);

  /**
   * Handles selection of a user mention
   */
  const selectMention = useCallback(
    (user: User) => {
      editor.update(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) return;

        const anchor = selection.anchor;
        const node = anchor.getNode();

        if (node && "getTextContent" in node && "select" in node) {
          const textNode = node as TextNode;
          const currentText = textNode.getTextContent();
          const currentOffset = anchor.offset;

          // Find the mention trigger position
          const beforeCursor = currentText.slice(0, currentOffset);
          const mentionMatch = beforeCursor.match(new RegExp(`${trigger}([^\\s]*)$`));

          if (mentionMatch) {
            const matchStart = beforeCursor.length - mentionMatch[0].length;

            // Select the mention text (trigger + query)
            textNode.select(matchStart, currentOffset);

            // Insert the mention node
            const mentionNode = $createMentionNode(user);
            selection.insertNodes([mentionNode]);

            // Add a space after the mention
            selection.insertText(" ");
          }
        }
      });

      closeMentions();
    },
    [editor, trigger, closeMentions]
  );

  /**
   * Gets the caret position for positioning the dropdown
   */
  function getCaretPosition(): { top: number; left: number } | null {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return null;

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    // Get the editor's root element to calculate relative position
    const editorElement = editor.getRootElement();
    const editorRect = editorElement?.getBoundingClientRect();

    if (!editorRect) return null;

    // Position relative to the editor container
    return {
      top: rect.bottom - editorRect.top + 4, // Relative to editor container
      left: rect.left - editorRect.left, // Relative to editor container
    };
  }

  /**
   * Detects mention triggers in text content
   */
  const detectMention = useCallback(() => {
    editor.getEditorState().read(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;

      const anchor = selection.anchor;
      const node = anchor.getNode();

      if (node && "getTextContent" in node) {
        const textNode = node as TextNode;
        const text = textNode.getTextContent();
        const offset = anchor.offset;

        // Find mention trigger in current text
        const beforeCursor = text.slice(0, offset);
        const mentionMatch = beforeCursor.match(new RegExp(`${trigger}([^\\s]*)$`));

        if (mentionMatch) {
          const query = mentionMatch[1];
          const position = getCaretPosition();

          if (position) {
            setMentionState((prev) => ({
              ...prev,
              isOpen: true,
              query,
              position,
              selectedIndex: 0,
            }));

            // Search for users
            searchUsers(query).then((suggestions) => {
              setMentionState((prev) => ({
                ...prev,
                suggestions,
              }));
            });
          }
        } else if (mentionState.isOpen) {
          closeMentions();
        }
      }
    });
  }, [editor, trigger, mentionState.isOpen, searchUsers, closeMentions]);

  useEffect(() => {
    // Selective keystroke prevention: Only block keys that would interfere with mention selection
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!mentionState.isOpen) return;

      // Handle specific mention navigation keys
      switch (event.key) {
        case "ArrowUp":
          event.preventDefault();
          event.stopPropagation();
          setMentionState((prev) => ({
            ...prev,
            selectedIndex:
              prev.selectedIndex > 0 ? prev.selectedIndex - 1 : prev.suggestions.length - 1,
          }));
          break;

        case "ArrowDown":
          event.preventDefault();
          event.stopPropagation();
          setMentionState((prev) => ({
            ...prev,
            selectedIndex:
              prev.selectedIndex < prev.suggestions.length - 1 ? prev.selectedIndex + 1 : 0,
          }));
          break;

        case "Enter":
          // Only block Enter to prevent new lines when selecting mentions
          event.preventDefault();
          event.stopPropagation();
          if (mentionState.suggestions[mentionState.selectedIndex]) {
            selectMention(mentionState.suggestions[mentionState.selectedIndex]);
          }
          break;

        case "Escape":
        case "Tab":
          event.preventDefault();
          event.stopPropagation();
          closeMentions();
          break;

        // Allow all other keys (backspace, delete, typing, etc.) to work normally
        default:
          // Don't prevent other keys - let normal editing continue
          break;
      }
    };

    if (mentionState.isOpen) {
      // Capture keyboard events before they reach the editor
      document.addEventListener("keydown", handleKeyDown, true);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [mentionState, selectMention, closeMentions]);

  useEffect(() => {
    return mergeRegister(
      // Handle text content changes for mention detection
      editor.registerTextContentListener(detectMention)
    );
  }, [editor, detectMention]);

  return (
    <>
      {mentionState.isOpen && mentionState.position && (
        <MentionSuggestions
          suggestions={mentionState.suggestions}
          selectedIndex={mentionState.selectedIndex}
          position={mentionState.position}
          onSelect={selectMention}
          onClose={closeMentions}
        />
      )}
    </>
  );
}
