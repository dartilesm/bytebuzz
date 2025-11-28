import { $getRoot } from "lexical";
import { $isMediaNode, type MediaData } from "../plugins/media/media-node";

/**
 * Finds a media node that contains an item with the given ID
 * @param mediaId - The ID of the media item to find
 * @returns The found media node or null
 */
export function findMediaNodeById(mediaId: string) {
  const root = $getRoot();
  return (
    root.getChildren().find((child) => {
      if ($isMediaNode(child)) {
        const items = child.getItems();
        return items.some((item) => item.id === mediaId);
      }
      return false;
    }) || null
  );
}

/**
 * Removes a media item by its ID from the editor
 * If the node becomes empty after removal, the node itself is removed
 * @param mediaId - The ID of the media item to remove
 */
export function removeMediaNodeById(mediaId: string): void {
  const mediaNode = findMediaNodeById(mediaId);
  if ($isMediaNode(mediaNode)) {
    mediaNode.removeItem(mediaId);
    // If no items left, remove the node
    if (mediaNode.getItems().length === 0) {
      mediaNode.remove();
    }
  }
}

/**
 * Updates a media item's data by its ID
 * @param mediaId - The ID of the media item to update
 * @param updatedData - The new media data (can be partial)
 */
export function updateMediaNodeById(mediaId: string, updatedData: Partial<MediaData>): void {
  const mediaNode = findMediaNodeById(mediaId);
  if ($isMediaNode(mediaNode)) {
    const existingItem = mediaNode.getItemById(mediaId);
    if (existingItem) {
      mediaNode.updateItem(mediaId, updatedData);
    }
  }
}
