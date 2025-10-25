import { PostgrestResponse, PostgrestSingleResponse } from "@supabase/supabase-js";
import { getSupabaseClient, cached, type StorageResult } from "./base.service";
import type { Tables } from "database.types";

/**
 * Media record structure for creating post media
 */
export interface MediaRecord {
  post_id: string;
  file_url: string;
  file_path: string;
  media_type: "image" | "video";
}

/**
 * Create media records for a post
 * @param records - Array of media records to insert
 */
async function createMediaRecords(
  records: MediaRecord[]
): Promise<PostgrestResponse<Tables<"post_media">[]>> {
  const supabase = getSupabaseClient();
  return await supabase.from("post_media").insert(records).select();
}

/**
 * Move file in storage bucket
 * @param bucket - The storage bucket name
 * @param fromPath - Current path of the file
 * @param toPath - Destination path for the file
 */
async function moveFile(
  bucket: string,
  fromPath: string,
  toPath: string
): Promise<StorageResult> {
  const supabase = getSupabaseClient();
  return await supabase.storage.from(bucket).move(fromPath, toPath);
}

/**
 * Get public URL for a file in storage
 * @param bucket - The storage bucket name
 * @param path - Path to the file
 * @returns Public URL string
 */
function getPublicUrl(bucket: string, path: string): string {
  const supabase = getSupabaseClient();
  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(path);
  return publicUrl;
}

/**
 * Remove files from storage bucket
 * @param bucket - The storage bucket name
 * @param paths - Array of file paths to remove
 */
async function removeFiles(bucket: string, paths: string[]): Promise<StorageResult> {
  const supabase = getSupabaseClient();
  return await supabase.storage.from(bucket).remove(paths);
}

/**
 * Upload file to storage bucket
 * @param bucket - The storage bucket name
 * @param path - Destination path for the file
 * @param file - File data to upload
 * @param options - Upload options
 */
async function uploadFile(
  bucket: string,
  path: string,
  file: File | Blob,
  options?: { contentType?: string; upsert?: boolean }
) {
  const supabase = getSupabaseClient();
  return await supabase.storage.from(bucket).upload(path, file, options);
}

/**
 * Get media records for a post with automatic caching
 * @param postId - ID of the post
 */
const getPostMedia = cached(
  async (postId: string): Promise<PostgrestSingleResponse<Tables<"post_media">[]>> => {
    const supabase = getSupabaseClient();
    return await supabase
      .from("post_media")
      .select("*")
      .eq("post_id", postId);
  }
);

/**
 * Media service for all media and storage operations
 * 
 * @example
 * ```typescript
 * import { mediaService } from "@/lib/db/services/media.service";
 * 
 * const publicUrl = mediaService.getPublicUrl("post-images", path);
 * await mediaService.uploadFile("post-images", path, file);
 * ```
 */
export const mediaService = {
  createMediaRecords,
  moveFile,
  getPublicUrl,
  removeFiles,
  uploadFile,
  getPostMedia,
};
