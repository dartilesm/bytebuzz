"use server";

import { createServerSupabaseClient } from "@/db/supabase";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

interface CreatePostWithMediaData {
  content: string;
  mediaData?: {
    path: string;
    url: string;
    type: "image" | "video";
  };
}

/**
 * Server action to create a post with optional media attachment
 * Handles moving the media from temporary to permanent storage location
 */
export async function createPostWithMediaAction({ content, mediaData }: CreatePostWithMediaData) {
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
      })
      .select()
      .single();

    if (postError) {
      throw new Error(`Failed to create post: ${postError.message}`);
    }

    if (mediaData) {
      // Generate permanent path for the media
      const timestamp = Date.now();
      const extension = mediaData.path.split(".").pop() || "";
      const permanentPath = `${user.id}/posts/${post.id}/${timestamp}_${mediaData.type}.${extension}`;

      // Move file from temp to permanent location
      const { error: moveError } = await supabase.storage
        .from("post-images")
        .move(mediaData.path, permanentPath);

      if (moveError) {
        // If move fails, delete the post and throw error
        await supabase.from("posts").delete().eq("id", post.id);
        throw new Error(`Failed to move media file: ${moveError.message}`);
      }

      // Get the public URL for the permanent location
      const {
        data: { publicUrl },
      } = supabase.storage.from("post-images").getPublicUrl(permanentPath);

      // Create media record
      const { error: mediaError } = await supabase.from("post_media").insert({
        post_id: post.id,
        file_url: publicUrl,
        file_path: permanentPath,
        media_type: mediaData.type,
      });

      if (mediaError) {
        // If media record creation fails, clean up post and moved file
        await supabase.from("posts").delete().eq("id", post.id);
        await supabase.storage.from("post-images").remove([permanentPath]);
        throw new Error(`Failed to create media record: ${mediaError.message}`);
      }
    }

    // Revalidate the posts page to show the new post
    revalidatePath("/");
    return post;
  } catch (error) {
    console.error("Error creating post with media:", error);
    throw error;
  }
}
