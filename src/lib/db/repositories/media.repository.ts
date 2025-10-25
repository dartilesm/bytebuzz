import { PostgrestResponse, PostgrestSingleResponse } from "@supabase/supabase-js";
import { BaseRepository, type StorageResult } from "./base.repository";
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
 * Repository for media and storage-related database operations
 */
class MediaRepository extends BaseRepository {
  /**
   * Create media records for a post
   * @param records - Array of media records to insert
   */
  async createMediaRecords(
    records: MediaRecord[]
  ): Promise<PostgrestResponse<Tables<"post_media">[]>> {
    return await this.supabase.from("post_media").insert(records).select();
  }

  /**
   * Move file in storage bucket
   * @param bucket - The storage bucket name
   * @param fromPath - Current path of the file
   * @param toPath - Destination path for the file
   */
  async moveFile(
    bucket: string,
    fromPath: string,
    toPath: string
  ): Promise<StorageResult> {
    return await this.supabase.storage.from(bucket).move(fromPath, toPath);
  }

  /**
   * Get public URL for a file in storage
   * @param bucket - The storage bucket name
   * @param path - Path to the file
   * @returns Public URL string
   */
  getPublicUrl(bucket: string, path: string): string {
    const {
      data: { publicUrl },
    } = this.supabase.storage.from(bucket).getPublicUrl(path);
    return publicUrl;
  }

  /**
   * Remove files from storage bucket
   * @param bucket - The storage bucket name
   * @param paths - Array of file paths to remove
   */
  async removeFiles(bucket: string, paths: string[]): Promise<StorageResult> {
    return await this.supabase.storage.from(bucket).remove(paths);
  }

  /**
   * Upload file to storage bucket
   * @param bucket - The storage bucket name
   * @param path - Destination path for the file
   * @param file - File data to upload
   * @param options - Upload options
   */
  async uploadFile(
    bucket: string,
    path: string,
    file: File | Blob,
    options?: { contentType?: string; upsert?: boolean }
  ) {
    return await this.supabase.storage.from(bucket).upload(path, file, options);
  }

  /**
   * Get media records for a post with automatic caching
   * @param postId - ID of the post
   */
  getPostMedia = this.cached(
    async (postId: string): Promise<PostgrestSingleResponse<Tables<"post_media">[]>> => {
      return await this.supabase
        .from("post_media")
        .select("*")
        .eq("post_id", postId);
    }
  );
}

/**
 * Singleton instance of MediaRepository
 * Import this to access all media and storage operations
 * 
 * @example
 * ```typescript
 * import { mediaRepository } from "@/lib/db/repositories";
 * 
 * const publicUrl = mediaRepository.getPublicUrl("post-images", path);
 * ```
 */
export const mediaRepository = new MediaRepository();
