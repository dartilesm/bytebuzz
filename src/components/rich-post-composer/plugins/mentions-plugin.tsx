import {
  Cell,
  Signal,
  activeEditor$,
  addExportVisitor$,
  addImportVisitor$,
  addLexicalNode$,
  createRootEditorSubscription$,
  realmPlugin,
} from "@mdxeditor/editor";
import {
  $createTextNode,
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_LOW,
  KEY_DOWN_COMMAND,
} from "lexical";
import { MdastMentionVisitor } from "./mdast-mention-visitor";
import { $createMentionNode, MentionNode } from "./mention-node";
import { MentionVisitor } from "./mention-visitor";

// Types
export interface User {
  id: string;
  displayName: string;
  username?: string;
  avatar?: string;
}

interface MentionsPluginParams {
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
export const mentionTrigger$ = Cell<string>("@");
export const mentionMaxSuggestions$ = Cell<number>(10);
export const showMentionPicker$ = Cell<boolean>(false);
export const mentionQuery$ = Cell<string>("");
export const mentionPickerPosition$ = Cell<{ x: number; y: number } | null>(null);
export const mentionElement$ = Cell<HTMLElement | null>(null);
export const insertMention$ = Signal<User>();

/**
 * Mock function to simulate fetching users based on query
 * Used when no users are provided to the plugin
 */
export function getDefaultUsers(query: string): User[] {
  // Mock users data
  const allUsers: User[] = [
    {
      id: "1",
      displayName: "John Doe",
      username: "johndoe",
      avatar: "https://i.pravatar.cc/150?u=1",
    },
    {
      id: "2",
      displayName: "Jane Smith",
      username: "janesmith",
      avatar: "https://i.pravatar.cc/150?u=2",
    },
    {
      id: "3",
      displayName: "Mike Johnson",
      username: "mikejohnson",
      avatar: "https://i.pravatar.cc/150?u=3",
    },
    {
      id: "4",
      displayName: "Sarah Wilson",
      username: "sarahwilson",
      avatar: "https://i.pravatar.cc/150?u=4",
    },
    {
      id: "5",
      displayName: "David Brown",
      username: "davidbrown",
      avatar: "https://i.pravatar.cc/150?u=5",
    },
    {
      id: "6",
      displayName: "Emily Davis",
      username: "emilydavis",
      avatar: "https://i.pravatar.cc/150?u=6",
    },
    {
      id: "7",
      displayName: "Alex Miller",
      username: "alexmiller",
      avatar: "https://i.pravatar.cc/150?u=7",
    },
    {
      id: "8",
      displayName: "Lisa Garcia",
      username: "lisagarcia",
      avatar: "https://i.pravatar.cc/150?u=8",
    },
  ];

  // Filter users based on query
  if (!query.trim()) {
    return allUsers;
  }

  return allUsers.filter(
    (user) =>
      user.displayName.toLowerCase().includes(query.toLowerCase()) ||
      user.username?.toLowerCase().includes(query.toLowerCase()),
  );
}

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
      realm.pub(mentionElement$, null);
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
            realm.pub(
              mentionElement$,
              domSelection?.getRangeAt(0).commonAncestorContainer as HTMLElement,
            );
            return false; // Let the character be typed
          }

          // Handle typing while mention picker is open
          if (realm.getValue(showMentionPicker$)) {
            if (event.key === "Escape") {
              realm.pub(showMentionPicker$, false);
              realm.pub(mentionQuery$, "");
              realm.pub(mentionPickerPosition$, null);
              realm.pub(mentionElement$, null);
              return true;
            }

            if (event.key === "Backspace") {
              const currentQuery = realm.getValue(mentionQuery$);
              if (currentQuery.length === 0) {
                // If we backspace with empty query, close picker
                realm.pub(showMentionPicker$, false);
                realm.pub(mentionPickerPosition$, null);
                realm.pub(mentionElement$, null);
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
    if (params?.trigger) {
      realm.pub(mentionTrigger$, params.trigger);
    }
    if (params?.maxSuggestions) {
      realm.pub(mentionMaxSuggestions$, params.maxSuggestions);
    }
  },
});
