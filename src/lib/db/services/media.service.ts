import { createServerSupabaseClient } from "@/db/supabase";

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
async function createMediaRecords(records: MediaRecord[]) {
  const supabase = createServerSupabaseClient();
  return await supabase.from("post_media").insert(records).select();
}

/**
 * Move file in storage bucket
 * @param bucket - The storage bucket name
 * @param fromPath - Current path of the file
 * @param toPath - Destination path for the file
 */
async function moveFile(bucket: string, fromPath: string, toPath: string) {
  const supabase = createServerSupabaseClient();
  return await supabase.storage.from(bucket).move(fromPath, toPath);
}

/**
 * Get public URL for a file in storage
 * @param bucket - The storage bucket name
 * @param path - Path to the file
 * @returns Public URL string
 */
function getPublicUrl(bucket: string, path: string): string {
  const supabase = createServerSupabaseClient();
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
async function removeFiles(bucket: string, paths: string[]) {
  const supabase = createServerSupabaseClient();
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
  options?: {
    cacheControl?: string;
    contentType?: string;
    upsert?: boolean;
    duplex?: string;
  },
) {
  const supabase = createServerSupabaseClient();
  return await supabase.storage.from(bucket).upload(path, file, options);
}

/**
 * List files in storage bucket
 * @param bucket - The storage bucket name
 * @param path - Path to list files from
 * @param options - List options
 */
async function listFiles(
  bucket: string,
  path: string,
  options?: {
    limit?: number;
    offset?: number;
    sortBy?: { column: string; order: string };
    search?: string;
  },
) {
  const supabase = createServerSupabaseClient();
  return await supabase.storage.from(bucket).list(path, options);
}

/**
 * Download file from storage bucket
 * @param bucket - The storage bucket name
 * @param path - Path to the file
 */
async function downloadFile(bucket: string, path: string) {
  const supabase = createServerSupabaseClient();
  return await supabase.storage.from(bucket).download(path);
}

/**
 * Get media records for a post
 * @param postId - ID of the post
 */
async function getPostMedia(postId: string) {
  const supabase = createServerSupabaseClient();
  return await supabase.from("post_media").select("*").eq("post_id", postId);
}

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
  listFiles,
  downloadFile,
  getPostMedia,
};
