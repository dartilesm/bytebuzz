import { describe, expect, it } from "vitest";
import {
  decodeMediaMetadata,
  encodeMediaMetadata,
  type MediaMetadata,
  mediaDataToMetadata,
  metadataToMediaData,
} from "@/components/lexical-editor/functions/media-metadata-utils";

describe("media-metadata-utils", () => {
  describe("encodeMediaMetadata", () => {
    const src = "https://example.com/media/image.png";

    it("should encode metadata into URL query parameters", () => {
      const metadata: MediaMetadata = {
        id: "123",
        type: "image",
        alt: "Test Image",
        title: "Image Title",
        width: 800,
        height: 600,
        postId: "post-123",
      };

      const result = encodeMediaMetadata(src, metadata);
      const url = new URL(result);

      expect(url.searchParams.get("id")).toBe("123");
      expect(url.searchParams.get("type")).toBe("image");
      expect(url.searchParams.get("alt")).toBe("Test Image");
      expect(url.searchParams.get("title")).toBe("Image Title");
      expect(url.searchParams.get("width")).toBe("800");
      expect(url.searchParams.get("height")).toBe("600");
      expect(url.searchParams.get("postId")).toBe("post-123");
    });

    it("should handle relative URLs", () => {
      const relativeSrc = "/media/image.png";
      const metadata: MediaMetadata = {
        id: "123",
        type: "image",
      };

      const result = encodeMediaMetadata(relativeSrc, metadata);

      // Verify it remains a relative URL but has query params
      expect(result.startsWith("/")).toBe(true);
      expect(result).toContain("id=123");
      expect(result).toContain("type=image");
    });

    it("should preserve existing query parameters", () => {
      const srcWithParams = "https://example.com/media/image.png?token=abc";
      const metadata: MediaMetadata = {
        id: "123",
        type: "image",
      };

      const result = encodeMediaMetadata(srcWithParams, metadata);
      const url = new URL(result);

      expect(url.searchParams.get("token")).toBe("abc");
      expect(url.searchParams.get("id")).toBe("123");
    });

    it("should overwrite existing metadata parameters", () => {
      const srcWithParams = "https://example.com/media/image.png?id=old";
      const metadata: MediaMetadata = {
        id: "new",
        type: "image",
      };

      const result = encodeMediaMetadata(srcWithParams, metadata);
      const url = new URL(result);

      expect(url.searchParams.get("id")).toBe("new");
    });
  });

  describe("decodeMediaMetadata", () => {
    it("should decode metadata from URL", () => {
      const url = "https://example.com/media/image.png?id=123&type=image&alt=Test&postId=post-123";
      const { metadata, src } = decodeMediaMetadata(url);

      expect(metadata).toEqual({
        id: "123",
        type: "image",
        alt: "Test",
        postId: "post-123",
      });
      // postId should be preserved in src
      expect(src).toContain("postId=post-123");
      expect(src).not.toContain("id=123");
      expect(src).not.toContain("type=image");
      expect(src).not.toContain("alt=Test");
    });

    it("should return null metadata if no metadata params found", () => {
      const url = "https://example.com/media/image.png?token=abc";
      const { metadata, src } = decodeMediaMetadata(url);

      expect(metadata).toBeNull();
      expect(src).toBe(url);
    });

    it("should handle invalid type values", () => {
      const url = "https://example.com/media/image.png?type=invalid";
      const { metadata } = decodeMediaMetadata(url);

      expect(metadata?.type).toBeUndefined();
    });

    it("should handle relative URLs", () => {
      const url = "/media/image.png?id=123&type=image";
      const { metadata, src } = decodeMediaMetadata(url);

      expect(metadata).toEqual({
        type: "image",
      });
      expect(src.startsWith("/")).toBe(true);
    });

    it("should preserve postId in src URL", () => {
      const url = "https://example.com/media/image.png?postId=post-123&id=123";
      const { metadata, src } = decodeMediaMetadata(url);

      expect(metadata?.postId).toBe("post-123");
      expect(src).toContain("postId=post-123");
      expect(src).not.toContain("id=123");
    });
  });

  describe("mediaDataToMetadata", () => {
    it("should convert MediaData to MediaMetadata", () => {
      const mediaData = {
        id: "123",
        type: "image" as const,
        src: "https://example.com/image.png",
        alt: "Test",
        title: "Title",
        width: 100,
        height: 100,
      };

      const result = mediaDataToMetadata(mediaData);

      expect(result).toEqual({
        id: "123",
        type: "image",
        alt: "Test",
        title: "Title",
        width: 100,
        height: 100,
        postId: undefined,
      });
    });

    it("should extract postId from src URL", () => {
      const mediaData = {
        id: "123",
        type: "image" as const,
        src: "https://example.com/image.png?postId=post-123",
      };

      const result = mediaDataToMetadata(mediaData);

      expect(result.postId).toBe("post-123");
    });
  });

  describe("metadataToMediaData", () => {
    it("should convert MediaMetadata to MediaData", () => {
      const src = "https://example.com/image.png";
      const metadata: Partial<MediaMetadata> = {
        id: "123",
        type: "image",
        alt: "Test",
        width: 100,
      };

      const result = metadataToMediaData(metadata, src);

      expect(result).toEqual({
        id: "123",
        type: "image",
        src,
        alt: "Test",
        title: undefined,
        width: 100,
        height: undefined,
      });
    });

    it("should infer type from file extension if missing", () => {
      const src = "https://example.com/video.mp4";
      const metadata: Partial<MediaMetadata> = {
        id: "123",
      };

      const result = metadataToMediaData(metadata, src);

      expect(result.type).toBe("video");
    });

    it("should generate default ID if missing", () => {
      const src = "https://example.com/image.png";
      const metadata: Partial<MediaMetadata> = {
        type: "image",
      };

      const result = metadataToMediaData(metadata, src);

      expect(result.id).toBe("image.png");
    });
  });
});
