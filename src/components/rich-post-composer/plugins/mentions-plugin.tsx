"use client";

import {
  realmPlugin,
  Cell,
  Signal,
  addImportVisitor$,
  addExportVisitor$,
  addLexicalNode$,
  createRootEditorSubscription$,
  activeEditor$,
  useCellValue,
  usePublisher,
} from "@mdxeditor/editor";
import {
  $createTextNode,
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_LOW,
  KEY_DOWN_COMMAND,
} from "lexical";
import { $createMentionNode, MentionNode } from "./mention-node";
import { MentionVisitor } from "./mention-visitor";
import { MdastMentionVisitor } from "./mdast-mention-visitor";
import { MentionPicker } from "./mention-picker";

// Types
export interface User {
  id: string;
  displayName: string;
  username?: string;
  avatar?: string;
}

export interface MentionsPluginParams {
  /**
   * List of users that can be mentioned
   */
  users?: User[];
  /**
   * Function to fetch users dynamically (optional)
   */
  fetchUsers?: (query: string) => Promise<User[]> | User[];
  /**
   * Custom trigger character (default: "@")
   */
  trigger?: string;
  /**
   * Maximum number of suggestions to show
   */
  maxSuggestions?: number;
}

// Cells and Signals for state management
export const mentionUsers$ = Cell<User[]>([]);
export const mentionTrigger$ = Cell<string>("@");
export const mentionMaxSuggestions$ = Cell<number>(10);
export const showMentionPicker$ = Cell<boolean>(false);
export const mentionQuery$ = Cell<string>("");
export const mentionPickerPosition$ = Cell<{ x: number; y: number } | null>(null);
export const insertMention$ = Signal<User>();

// Plugin definition
export const mentionsPlugin = realmPlugin<MentionsPluginParams>({
  init(realm) {
    // Register the mention node
    realm.pubIn({
      [addLexicalNode$]: MentionNode,
      [addImportVisitor$]: MdastMentionVisitor,
      [addExportVisitor$]: MentionVisitor,
    });

    // Handle mention insertion
    realm.sub(insertMention$, (user) => {
      const editor = realm.getValue(activeEditor$);
      if (!editor) return;

      editor.update(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) return;

        // Remove the trigger and query text
        const query = realm.getValue(mentionQuery$);
        const trigger = realm.getValue(mentionTrigger$);
        const textToRemove = trigger + query;

        // Move selection back to remove the trigger and query
        selection.anchor.offset -= textToRemove.length;
        selection.focus.offset = selection.anchor.offset + textToRemove.length;

        // Create and insert mention node
        const mentionNode = $createMentionNode(user);
        selection.insertNodes([mentionNode]);

        // Add a space after the mention
        const spaceNode = $createTextNode(" ");
        selection.insertNodes([spaceNode]);
      });

      // Hide picker
      realm.pub(showMentionPicker$, false);
      realm.pub(mentionQuery$, "");
      realm.pub(mentionPickerPosition$, null);
    });

    // Handle keyboard events for mention trigger
    realm.pub(createRootEditorSubscription$, (editor) => {
      return editor.registerCommand(
        KEY_DOWN_COMMAND,
        (event: KeyboardEvent) => {
          const trigger = realm.getValue(mentionTrigger$);

          if (event.key === trigger) {
            // Get current selection and position
            const selection = $getSelection();
            if (!$isRangeSelection(selection)) return false;

            // Get cursor position for picker placement
            const domSelection = window.getSelection();
            if (domSelection && domSelection.rangeCount > 0) {
              const range = domSelection.getRangeAt(0);
              const rect = range.getBoundingClientRect();

              realm.pub(mentionPickerPosition$, {
                x: rect.left,
                y: rect.bottom + window.scrollY,
              });
            }

            // Start mention mode
            realm.pub(showMentionPicker$, true);
            realm.pub(mentionQuery$, "");

            return false; // Let the character be typed
          }

          // Handle typing while mention picker is open
          if (realm.getValue(showMentionPicker$)) {
            if (event.key === "Escape") {
              realm.pub(showMentionPicker$, false);
              realm.pub(mentionQuery$, "");
              realm.pub(mentionPickerPosition$, null);
              return true;
            }

            if (event.key === "Backspace") {
              const currentQuery = realm.getValue(mentionQuery$);
              if (currentQuery.length === 0) {
                // If we backspace with empty query, close picker
                realm.pub(showMentionPicker$, false);
                realm.pub(mentionPickerPosition$, null);
                return false;
              }
              // Update query
              realm.pub(mentionQuery$, currentQuery.slice(0, -1));
              return false;
            }

            if (event.key.length === 1 && !event.ctrlKey && !event.metaKey) {
              // Add character to query
              const currentQuery = realm.getValue(mentionQuery$);
              realm.pub(mentionQuery$, currentQuery + event.key);
              return false;
            }
          }

          return false;
        },
        COMMAND_PRIORITY_LOW,
      );
    });
  },

  update(realm, params) {
    // Update plugin parameters
    if (params?.users) {
      realm.pub(mentionUsers$, params.users);
    }
    if (params?.trigger) {
      realm.pub(mentionTrigger$, params.trigger);
    }
    if (params?.maxSuggestions) {
      realm.pub(mentionMaxSuggestions$, params.maxSuggestions);
    }
  },
});

// React component for mention picker
export function MentionPickerWrapper() {
  const showPicker = useCellValue(showMentionPicker$);
  const position = useCellValue(mentionPickerPosition$);
  const query = useCellValue(mentionQuery$);
  const users = useCellValue(mentionUsers$);
  const maxSuggestions = useCellValue(mentionMaxSuggestions$);
  const insertMention = usePublisher(insertMention$);

  if (!showPicker || !position) {
    return null;
  }

  // Filter users based on query
  const filteredUsers = users
    .filter(
      (user) =>
        user.displayName.toLowerCase().includes(query.toLowerCase()) ||
        user.username?.toLowerCase().includes(query.toLowerCase()),
    )
    .slice(0, maxSuggestions);

  return (
    <MentionPicker
      users={filteredUsers}
      position={position}
      onSelect={insertMention}
      query={query}
    />
  );
}
