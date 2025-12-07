import { createSerializer, parseAsString } from "nuqs/server";

/**
 * Parser for postId query parameter
 * Used to ensure postId is properly set in image URLs
 */
const postIdParser = {
  postId: parseAsString,
};

/**
 * Serializer for image URLs query parameters
 * Merges postId with existing URL query parameters
 */
export const serializeImageUrl = createSerializer(postIdParser);

