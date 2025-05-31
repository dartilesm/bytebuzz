"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect, useState, useCallback } from "react";
import { $getSelection, $isRangeSelection } from "lexical";
import { mergeRegister } from "@lexical/utils";
import type { TextNode } from "lexical";
import { $createMentionNode, type User } from "./mention-node";
import { MentionSuggestions } from "./mention-suggestions";

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
      user.displayName.toLowerCase().includes(query.toLowerCase()),
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
        console.error("Error searching users:", error);
        return [];
      }
    },
    [onSearch, maxSuggestions],
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

        // Remove the trigger character and query text
        const queryLength = mentionState.query.length + trigger.length;
        for (let i = 0; i < queryLength; i++) {
          selection.deletePreviousChar();
        }

        // Insert the mention node
        const mentionNode = $createMentionNode(user);
        selection.insertNodes([mentionNode]);

        // Add a space after the mention
        selection.insertText(" ");
      });

      closeMentions();
    },
    [editor, mentionState.query, trigger, closeMentions],
  );

  /**
   * Handles keyboard navigation in mention dropdown
   */
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!mentionState.isOpen) return false;

      switch (event.key) {
        case "ArrowUp":
          event.preventDefault();
          setMentionState((prev) => ({
            ...prev,
            selectedIndex:
              prev.selectedIndex > 0 ? prev.selectedIndex - 1 : prev.suggestions.length - 1,
          }));
          return true;

        case "ArrowDown":
          event.preventDefault();
          setMentionState((prev) => ({
            ...prev,
            selectedIndex:
              prev.selectedIndex < prev.suggestions.length - 1 ? prev.selectedIndex + 1 : 0,
          }));
          return true;

        case "Enter":
          event.preventDefault();
          if (mentionState.suggestions[mentionState.selectedIndex]) {
            selectMention(mentionState.suggestions[mentionState.selectedIndex]);
          }
          return true;

        case "Escape":
          event.preventDefault();
          closeMentions();
          return true;

        default:
          return false;
      }
    },
    [mentionState, selectMention, closeMentions],
  );

  /**
   * Gets the caret position for positioning the dropdown
   */
  function getCaretPosition(): { top: number; left: number } | null {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return null;

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    return {
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX,
    };
  }

  useEffect(() => {
    return mergeRegister(
      // Handle text input for mention detection
      editor.registerTextContentListener(() => {
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
      }),

      // Handle keyboard events
      // biome-ignore lint/suspicious/noExplicitAny: Lexical command API requires any type
      editor.registerCommand<KeyboardEvent>(
        "keydown" as any,
        handleKeyDown,
        1, // High priority to capture before other handlers
      ),
    );
  }, [editor, trigger, mentionState.isOpen, searchUsers, handleKeyDown, closeMentions]);

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
