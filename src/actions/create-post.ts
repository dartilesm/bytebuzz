"use server";

import { createServerSupabaseClient } from "@/db/supabase";
import { log } from "@/lib/logger";
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
    const supabase = createServerSupabaseClient();
    const user = await currentUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    // Start transaction
    const { data: post, error: postError } = await supabase
      .from("posts")
      .insert({
        content,
        user_id: user.id,
        parent_post_id,
        repost_post_id,
      })
      .select()
      .single();

    if (postError) {
      throw new Error(`Failed to create post: ${postError.message}`);
    }

    if (mediaData && mediaData.length > 0) {
      const mediaPromises = mediaData.map(async (media) => {
        // Generate permanent path for the media
        const fileName = media.path.split("/").pop() || "";
        const permanentPath = `${user.id}/posts/${post.id}/${fileName}`;

        // Move file from temp to permanent location
        const { error: moveError } = await supabase.storage
          .from("post-images")
          .move(media.path, permanentPath);

        if (moveError) {
          throw new Error(`Failed to move media file: ${moveError.message}`);
        }

        // Generate the proxy URL for the permanent location
        const {
          data: { publicUrl },
        } = supabase.storage.from("post-images").getPublicUrl(permanentPath);

        return {
          post_id: post.id,
          file_url: publicUrl,
          file_path: permanentPath,
          media_type: media.type,
        };
      });

      try {
        const mediaRecords = await Promise.all(mediaPromises);

        // Create media records
        const { error: mediaError } = await supabase.from("post_media").insert(mediaRecords);

        if (mediaError) {
          throw new Error(`Failed to create media records: ${mediaError.message}`);
        }
      } catch (error) {
        // If any media operation fails, clean up post and all moved files
        await supabase.from("posts").delete().eq("id", post.id);
        const permanentPaths = mediaData.map((media) => {
          const fileName = media.path.split("/").pop() || "";
          return `${user.id}/posts/${post.id}/${fileName}`;
        });
        await supabase.storage.from("post-images").remove(permanentPaths);
        throw error;
      }
    }

    // Revalidate the posts page to show the new post
    revalidatePath("/");
    return post;
  } catch (error) {
    log.error({ error }, "Error creating post with media:");
    throw error;
  }
}
