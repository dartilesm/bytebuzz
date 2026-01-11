import type { RangeSelection } from "lexical";
import { EMOJI_ENDPOINT, EMOJI_PREFIX } from "@/components/lexical-editor/consts/emoji";
import { $createInlineImageNode } from "@/components/lexical-editor/plugins/inline-image/inline-image-node";
import type { EmojiData } from "@/components/ui/emoji-picker/types";

export function getCustomEmojiId(creator: string | undefined, id: string): string {
  return creator ? `${creator}:${id}` : id;
}

export function getCustomEmojiUrl(fullId: string): string {
  return `${EMOJI_ENDPOINT}/${fullId}`;
}

/**
 * Inserts an emoji (native text or custom image node) into the editor selection.
 * @param selection The current Lexical RangeSelection
 * @param emoji The emoji data to insert
 */
export function insertEmoji(selection: RangeSelection, emoji: EmojiData) {
  if (emoji.src) {
    // Insert custom emoji as InlineImageNode
    const fullId = getCustomEmojiId(emoji.creator, emoji.id);
    const src = getCustomEmojiUrl(fullId);

    const node = $createInlineImageNode({
      src,
      alt: `${EMOJI_PREFIX}${emoji.name}`,
      id: fullId,
    });
    selection.insertNodes([node]);
  } else {
    selection.insertText(emoji.native || "");
  }
}
