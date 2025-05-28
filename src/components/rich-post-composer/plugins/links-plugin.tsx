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
  $isTextNode,
  COMMAND_PRIORITY_LOW,
  KEY_DOWN_COMMAND,
  type TextNode,
  type LexicalNode,
  type LexicalEditor,
} from "lexical";
import { MdastLinkVisitor } from "./mdast-link-visitor";
import { $createLinkNode, LinkNode } from "./link-node";
import { LinkVisitor } from "./link-visitor";

// More permissive URL regex that captures potential URLs for validation
const URL_REGEX = /https?:\/\/\S+/gi;

// Types
interface LinksPluginParams {
  /**
   * Whether to automatically detect and convert URLs to links (default: true)
   */
  autoLink?: boolean;
  /**
   * Custom URL validation function
   */
  urlValidator?: (url: string) => boolean;
}

// Cells and Signals for state management
export const autoLink$ = Cell<boolean>(true);
export const urlValidator$ = Cell<((url: string) => boolean) | undefined>(undefined);
export const insertLink$ = Signal<{ url: string; text?: string }>();

/**
 * Default URL validator using the URL constructor for accurate validation
 */
function defaultUrlValidator(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === "http:" || urlObj.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Function to detect and convert URLs in text to link nodes
 */
// biome-ignore lint/suspicious/noExplicitAny: MDXEditor realm API parameter
function detectAndConvertUrls(textNode: TextNode, editor: LexicalEditor, realm: any): void {
  const text = textNode.getTextContent();
  const matches = Array.from(text.matchAll(URL_REGEX));

  if (matches.length === 0) return;

  editor.update(() => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) return;

    // Store original cursor position
    const originalOffset = selection.anchor.offset;
    const validator = realm.getValue(urlValidator$) || defaultUrlValidator;

    let offset = 0;
    const newNodes: LexicalNode[] = [];

    // Process each URL match
    for (const match of matches) {
      const rawUrl = match[0];
      const startIndex = match.index ?? 0;

      // Clean up trailing punctuation (. , ! ? ; :) that might be sentence endings
      const cleanedUrl = rawUrl.replace(/[.,!?;:]+$/, "");

      // Add text before URL (if any)
      if (startIndex > offset) {
        newNodes.push($createTextNode(text.slice(offset, startIndex)));
      }

      // Validate the cleaned URL and add as link or text
      if (validator(cleanedUrl)) {
        newNodes.push($createLinkNode({ url: cleanedUrl, text: cleanedUrl }));
      } else {
        newNodes.push($createTextNode(cleanedUrl));
      }

      // Add any trailing punctuation that was cleaned
      const trailingPunctuation = rawUrl.slice(cleanedUrl.length);
      if (trailingPunctuation) {
        newNodes.push($createTextNode(trailingPunctuation));
      }

      offset = startIndex + rawUrl.length;
    }

    // Add remaining text after last URL (if any)
    if (offset < text.length) {
      newNodes.push($createTextNode(text.slice(offset)));
    }

    // Replace original text node with new nodes
    if (newNodes.length > 0) {
      let insertAfterNode: LexicalNode = textNode;

      for (const node of newNodes) {
        insertAfterNode.insertAfter(node);
        insertAfterNode = node;
      }

      textNode.remove();

      // Restore cursor position: find the appropriate node and offset
      let accumulatedLength = 0;
      let targetNode: LexicalNode | null = null;
      let targetOffset = 0;

      for (const node of newNodes) {
        const nodeLength = node.getTextContent().length;

        if (originalOffset <= accumulatedLength + nodeLength) {
          targetNode = node;
          targetOffset = originalOffset - accumulatedLength;
          break;
        }

        accumulatedLength += nodeLength;
      }

      // Set cursor position
      if (targetNode) {
        if ($isTextNode(targetNode)) {
          targetNode.select(targetOffset, targetOffset);
        } else {
          // For link nodes, position cursor after the link
          targetNode.selectNext();
        }
      } else {
        // Fallback: position at the end
        const lastNode = newNodes[newNodes.length - 1];
        if ($isTextNode(lastNode)) {
          const textLength = lastNode.getTextContent().length;
          lastNode.select(textLength, textLength);
        } else {
          lastNode.selectNext();
        }
      }
    }
  });
}

// Plugin definition
export const linksPlugin = realmPlugin<LinksPluginParams>({
  init(realm) {
    // Register the link node
    realm.pubIn({
      [addLexicalNode$]: LinkNode,
      [addImportVisitor$]: MdastLinkVisitor,
      [addExportVisitor$]: LinkVisitor,
    });

    // Handle manual link insertion
    realm.sub(insertLink$, (linkData) => {
      const editor = realm.getValue(activeEditor$);
      if (!editor) return;

      editor.update(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) return;

        // Create and insert link node
        const linkNode = $createLinkNode(linkData);
        selection.insertNodes([linkNode]);

        // Add a space after the link
        const spaceNode = $createTextNode(" ");
        selection.insertNodes([spaceNode]);
      });
    });

    // Handle automatic URL detection
    realm.pub(createRootEditorSubscription$, (editor) => {
      return editor.registerCommand(
        KEY_DOWN_COMMAND,
        (event: KeyboardEvent) => {
          if (!realm.getValue(autoLink$)) return false;

          // Check for space or enter key to trigger URL detection
          if (event.key === " " || event.key === "Enter") {
            editor.update(() => {
              const selection = $getSelection();
              if (!$isRangeSelection(selection)) return;

              const anchorNode = selection.anchor.getNode();

              // Check if we're in a text node
              if ($isTextNode(anchorNode)) {
                detectAndConvertUrls(anchorNode, editor, realm);
              }
            });
          }

          return false;
        },
        COMMAND_PRIORITY_LOW,
      );
    });

    // Handle paste events for URL detection
    realm.pub(createRootEditorSubscription$, (editor) => {
      return editor.registerCommand(
        "PASTE_COMMAND" as never,
        (event: ClipboardEvent) => {
          if (!realm.getValue(autoLink$)) return false;

          const clipboardData = event.clipboardData?.getData("text/plain");
          if (clipboardData && URL_REGEX.test(clipboardData)) {
            event.preventDefault();

            editor.update(() => {
              const selection = $getSelection();
              if (!$isRangeSelection(selection)) return;

              // Check if the pasted content is just a URL
              const trimmedData = clipboardData.trim();
              const urlMatches = trimmedData.match(URL_REGEX);

              if (urlMatches && urlMatches[0] === trimmedData) {
                // Pasted content is a single URL, create a link node
                const validator = realm.getValue(urlValidator$) || defaultUrlValidator;
                if (validator(trimmedData)) {
                  const linkNode = $createLinkNode({ url: trimmedData, text: trimmedData });
                  selection.insertNodes([linkNode]);
                  return;
                }
              }

              // Otherwise, insert as text and let the typing handler detect URLs
              const textNode = $createTextNode(clipboardData);
              selection.insertNodes([textNode]);

              // Trigger URL detection on the newly inserted text
              setTimeout(() => {
                editor.update(() => {
                  const newSelection = $getSelection();
                  if (!$isRangeSelection(newSelection)) return;

                  const newAnchorNode = newSelection.anchor.getNode();
                  if ($isTextNode(newAnchorNode)) {
                    detectAndConvertUrls(newAnchorNode, editor, realm);
                  }
                });
              }, 0);
            });

            return true;
          }

          return false;
        },
        COMMAND_PRIORITY_LOW,
      );
    });
  },

  update(realm, params) {
    if (params?.autoLink !== undefined) {
      realm.pub(autoLink$, params.autoLink);
    }
    if (params?.urlValidator) {
      realm.pub(urlValidator$, params.urlValidator);
    }
  },
});
