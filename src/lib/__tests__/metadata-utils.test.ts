import { describe, it, expect } from "vitest";
import {
  generateUserProfileMetadata,
  generatePostThreadMetadata,
  generateFallbackMetadata,
} from "@/lib/metadata-utils";
import type { Tables } from "database.types";
import type { NestedPost } from "@/types/nested-posts";

describe("metadata-utils", () => {
  describe("generateUserProfileMetadata", () => {
    it("should generate correct metadata for user profile", () => {
      const userProfile: Tables<"users"> = {
        id: "user-123",
        username: "johndoe",
        display_name: "John Doe",
        bio: "Full-stack developer passionate about React and TypeScript",
        image_url: "https://example.com/avatar.jpg",
        cover_image_url: null,
        follower_count: 150,
        following_count: 75,
        github_url: "https://github.com/johndoe",
        linkedin_url: null,
        website: "https://johndoe.dev",
        location: "San Francisco, CA",
        top_technologies: ["react", "typescript", "node"],
        join_date: "2023-01-15T00:00:00Z",
      };

      const metadata = generateUserProfileMetadata(userProfile);

      expect(metadata.title).toBe("John Doe (@johndoe) | ByteBuzz");
      expect(metadata.description).toBe(
        "Full-stack developer passionate about React and TypeScript",
      );
      expect(metadata.openGraph?.title).toBe("John Doe (@johndoe)");
      expect(metadata.openGraph?.type).toBe("profile");
      expect(metadata.openGraph?.images?.[0]?.url).toBe("https://example.com/avatar.jpg");
      expect(metadata.twitter?.card).toBe("summary");
      expect(metadata.twitter?.creator).toBe("@johndoe");
    });

    it("should generate fallback description when bio is null", () => {
      const userProfile: Tables<"users"> = {
        id: "user-123",
        username: "johndoe",
        display_name: "John Doe",
        bio: null,
        image_url: null,
        cover_image_url: null,
        follower_count: 0,
        following_count: 0,
        github_url: null,
        linkedin_url: null,
        website: null,
        location: null,
        top_technologies: null,
        join_date: null,
      };

      const metadata = generateUserProfileMetadata(userProfile);

      expect(metadata.description).toBe(
        "Follow John Doe on ByteBuzz to see their latest posts and code snippets.",
      );
      expect(metadata.openGraph?.images).toBeUndefined();
    });
  });

  describe("generatePostThreadMetadata", () => {
    it("should generate correct metadata for post thread", () => {
      const post: NestedPost = {
        id: "post-123",
        content:
          "Just shipped a new feature! 🚀 Here's how I implemented it using React hooks and TypeScript. The key was to properly type the state and use useCallback for performance optimization.",
        created_at: "2024-01-15T10:30:00Z",
        user: {
          id: "user-123",
          username: "johndoe",
          display_name: "John Doe",
          image_url: "https://example.com/avatar.jpg",
        },
        star_count: 25,
        coffee_count: 5,
        approve_count: 10,
        cache_count: 2,
      };

      const metadata = generatePostThreadMetadata(post);

      expect(metadata.title).toBe(
        "John Doe on ByteBuzz - Just shipped a new feature! 🚀 Here's how I implemented it using React hooks and TypeScript. The key was to properly type the state and use useCallback for performance optimization.",
      );
      expect(metadata.description).toContain("Just shipped a new feature! 🚀");
      expect(metadata.openGraph?.type).toBe("article");
      expect(metadata.openGraph?.publishedTime).toBe("2024-01-15T10:30:00Z");
      expect(metadata.twitter?.creator).toBe("@johndoe");
    });

    it("should truncate long content in description", () => {
      const longContent = "A".repeat(200);
      const post: NestedPost = {
        id: "post-123",
        content: longContent,
        created_at: "2024-01-15T10:30:00Z",
        user: {
          id: "user-123",
          username: "johndoe",
          display_name: "John Doe",
        },
      };

      const metadata = generatePostThreadMetadata(post);

      expect(metadata.description).toHaveLength(163); // 160 + "..."
      expect(metadata.description).toEndWith("...");
    });

    it("should handle posts with no content", () => {
      const post: NestedPost = {
        id: "post-123",
        content: null,
        created_at: "2024-01-15T10:30:00Z",
        user: {
          id: "user-123",
          username: "johndoe",
          display_name: "John Doe",
        },
      };

      const metadata = generatePostThreadMetadata(post);

      expect(metadata.title).toBe("John Doe on ByteBuzz");
      expect(metadata.description).toBe("View this post on ByteBuzz");
    });

    it("should clean markdown syntax from titles", () => {
      const post: NestedPost = {
        id: "post-123",
        content:
          "## Check this out!\n\nHere's some **bold text** and `inline code`.\n\n```javascript\nconst hello = 'world';\n```\n\n![Image](https://example.com/image.jpg)\n\n[Link text](https://example.com)",
        created_at: "2024-01-15T10:30:00Z",
        user: {
          id: "user-123",
          username: "johndoe",
          display_name: "John Doe",
        },
      };

      const metadata = generatePostThreadMetadata(post);

      expect(metadata.title).toBe(
        "John Doe on ByteBuzz - Check this out! Here's some bold text and inline code. Link text",
      );
      expect(metadata.title).not.toContain("```");
      expect(metadata.title).not.toContain("**");
      expect(metadata.title).not.toContain("`");
      expect(metadata.title).not.toContain("![");
      expect(metadata.title).not.toContain("##");
    });
  });

  describe("generateFallbackMetadata", () => {
    it("should generate correct fallback metadata for user", () => {
      const metadata = generateFallbackMetadata("user");

      expect(metadata.title).toBe("User Not Found | ByteBuzz");
      expect(metadata.description).toBe("The requested user profile could not be found.");
    });

    it("should generate correct fallback metadata for post/thread", () => {
      const metadata = generateFallbackMetadata("thread");

      expect(metadata.title).toBe("Post Not Found | ByteBuzz");
      expect(metadata.description).toBe("The requested post could not be found.");
    });
  });
});
