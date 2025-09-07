import type { Metadata } from "next";
import type { Tables } from "database.types";
import type { NestedPost } from "@/types/nested-posts";
import { extractPlainTextFromMarkdown } from "./markdown-text-extractor";

const metadataBase = process.env.VERCEL_URL
  ? new URL(`https://${process.env.VERCEL_URL}`)
  : new URL("http://localhost:3000");

/**
 * Generates metadata for user profile pages
 * @param userProfile - The user profile data from database
 * @returns Metadata object for Next.js
 */
export function generateUserProfileMetadata(userProfile: Tables<"users">): Metadata {
  const title = `${userProfile.display_name} (@${userProfile.username}) | ByteBuzz`;
  const description =
    userProfile.bio ||
    `Follow ${userProfile.display_name} on ByteBuzz to see their latest posts and code snippets.`;

  return {
    title,
    description,
    openGraph: {
      title: `${userProfile.display_name} (@${userProfile.username})`,
      description,
      type: "profile",
      siteName: "ByteBuzz",
    },
    twitter: {
      card: "summary_large_image",
      title: `${userProfile.display_name} (@${userProfile.username})`,
      description,
      creator: `@${userProfile.username}`,
    },
    alternates: {
      canonical: `/${userProfile.username}`,
    },
    metadataBase,
  };
}

/**
 * Generates metadata for post thread pages
 * @param post - The main post data from database
 * @returns Metadata object for Next.js
 */
export function generatePostThreadMetadata(post: NestedPost): Metadata {
  const author = post.user as Tables<"users">;
  const authorName = author?.display_name || author?.username || "Unknown User";
  const postContent =
    extractPlainTextFromMarkdown(post.content || "").substring(0, 160) ||
    "View this post on ByteBuzz";

  // Create a more engaging title that includes content preview
  const cleanContent = extractPlainTextFromMarkdown(post.content || "");
  const contentPreview = cleanContent.substring(0, 100);
  const title = contentPreview
    ? `${authorName} on ByteBuzz - ${contentPreview}${contentPreview.length >= 100 ? "..." : ""}`
    : `${authorName} on ByteBuzz`;

  const description = postContent.length > 160 ? `${postContent}...` : postContent;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      siteName: "ByteBuzz",
      publishedTime: post.created_at || undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      creator: author?.username ? `@${author.username}` : undefined,
    },
    alternates: {
      canonical: `/${author?.username}/thread/${post.id}`,
    },
    metadataBase,
  };
}

/**
 * Generates fallback metadata for error cases
 * @param type - The type of page (user, post, etc.)
 * @returns Default metadata object
 */
export function generateFallbackMetadata(type: "user" | "post" | "thread"): Metadata {
  const baseMetadata = {
    siteName: "ByteBuzz",
    openGraph: {
      siteName: "ByteBuzz",
    },
    twitter: {
      card: "summary" as const,
    },
    metadataBase,
  };

  if (type === "user") {
    return {
      title: "User Not Found | ByteBuzz",
      description: "The requested user profile could not be found.",
      ...baseMetadata,
    };
  }

  if (type === "post") {
    return {
      title: "Post Not Found | ByteBuzz",
      description: "The requested post could not be found.",
      ...baseMetadata,
    };
  }

  if (type === "thread") {
    return {
      title: "Thread Not Found | ByteBuzz",
      description: "The requested thread could not be found.",
      ...baseMetadata,
    };
  }

  return {
    title: "Page Not Found | ByteBuzz",
    description: "The requested page could not be found.",
    ...baseMetadata,
  };
}
