import { $getRoot } from "lexical";
import { $isMediaNode, type MediaData } from "../plugins/media/media-node";

/**
 * Finds a media node by its ID in the editor
 * @param mediaId - The ID of the media node to find
 * @returns The found media node or null
 */
export function findMediaNodeById(mediaId: string) {
  const root = $getRoot();
  return (
    root.getChildren().find((child) => {
      if ($isMediaNode(child)) {
        const nodeData = child.getMediaData();
        return nodeData.id === mediaId;
      }
      return false;
    }) || null
  );
}

/**
 * Removes a media node by its ID from the editor
 * @param mediaId - The ID of the media node to remove
 */
export function removeMediaNodeById(mediaId: string): void {
  const mediaNode = findMediaNodeById(mediaId);
  if (mediaNode) {
    mediaNode.remove();
  }
}

/**
 * Updates a media node's data by its ID
 * @param mediaId - The ID of the media node to update
 * @param updatedData - The new media data
 */
export function updateMediaNodeById(mediaId: string, updatedData: MediaData): void {
  const mediaNode = findMediaNodeById(mediaId);
  if ($isMediaNode(mediaNode)) {
    mediaNode.setMediaData(updatedData);
  }
}
