"use server";

import { postRepository } from "@/lib/db/repositories/post.repository";
import { mediaRepository } from "@/lib/db/repositories/media.repository";
import { log } from "@/lib/logger/logger";
import { currentUser } from "@clerk/nextjs/server";
import type { Tables } from "database.types";
import { revalidatePath } from "next/cache";

type PostExpectedFields = Pick<
  Partial<Tables<"posts">>,
  "content" | "parent_post_id" | "repost_post_id"
>;

interface MediaDataItem {
  path: string;
  url: string;
  type: "image" | "video";
}

interface CreatePost extends PostExpectedFields {
  mediaData?: MediaDataItem[];
}

/**
 * Server action to create a post with optional media attachments
 * Handles moving multiple media files from temporary to permanent storage location
 */
export async function createPostAction({
  content,
  mediaData,
  parent_post_id,
  repost_post_id,
}: CreatePost) {
  try {
    const user = await currentUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    // Create post using repository
    const { data: post, error: postError } = await postRepository.createPost({
      content: content ?? null,
      user_id: user.id,
      parent_post_id,
      repost_post_id,
    });

    if (postError || !post) {
      throw new Error(`Failed to create post: ${postError?.message}`);
    }

    if (mediaData && mediaData.length > 0) {
      const mediaPromises = mediaData.map(async (media) => {
        // Generate permanent path for the media
        const fileName = media.path.split("/").pop() || "";
        const permanentPath = `${user.id}/posts/${post.id}/${fileName}`;

        // Move file from temp to permanent location using repository
        const { error: moveError } = await mediaRepository.moveFile(
          "post-images",
          media.path,
          permanentPath
        );

        if (moveError) {
          throw new Error(`Failed to move media file: ${moveError.message}`);
        }

        // Generate the proxy URL for the permanent location using repository
        const publicUrl = mediaRepository.getPublicUrl(
          "post-images",
          permanentPath
        );

        return {
          post_id: post.id,
          file_url: publicUrl,
          file_path: permanentPath,
          media_type: media.type,
        };
      });

      try {
        const mediaRecords = await Promise.all(mediaPromises);

        // Create media records using repository
        const { error: mediaError } =
          await mediaRepository.createMediaRecords(mediaRecords);

        if (mediaError) {
          throw new Error(
            `Failed to create media records: ${mediaError.message}`
          );
        }
      } catch (error) {
        // If any media operation fails, clean up post and all moved files
        await postRepository.deletePost(post.id);
        const permanentPaths = mediaData.map((media) => {
          const fileName = media.path.split("/").pop() || "";
          return `${user.id}/posts/${post.id}/${fileName}`;
        });
        await mediaRepository.removeFiles("post-images", permanentPaths);
        throw error;
      }
    }

    // Revalidate the posts page to show the new post
    revalidatePath("/");
    return post;
  } catch (error) {
    log.error("Error creating post with media", { error });
    throw error;
  }
}
