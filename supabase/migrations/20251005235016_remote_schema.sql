drop function if exists "public"."get_trending_users"(limit_count integer, offset_count integer);

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_trending_users(limit_count integer DEFAULT 20, offset_count integer DEFAULT 0, only_following boolean DEFAULT false)
 RETURNS TABLE(id text, username text, display_name text, bio text, location text, image_url text, website text, github_url text, linkedin_url text, cover_image_url text, top_technologies text[], join_date timestamp with time zone, follower_count integer, following_count integer, recent_posts_count integer, recent_engagement_score integer, last_post_date timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  trending_count INTEGER;
  current_user_id TEXT := auth.jwt() ->> 'sub';
BEGIN
  IF limit_count IS NULL OR limit_count <= 0 THEN
    limit_count := 20;
  END IF;

  IF offset_count IS NULL OR offset_count < 0 THEN
    offset_count := 0;
  END IF;

  -- Trending users based on posts in last 7 days
  RETURN QUERY
  WITH recent_posts AS (
    SELECT p.*, 
      (COALESCE(p.star_count,0)*3 +
       COALESCE(p.coffee_count,0)*2 +
       COALESCE(p.approve_count,0)*2 +
       COALESCE(p.cache_count,0)*1 +
       COALESCE(p.reply_count,0)*2 +
       COALESCE(p.repost_count,0)*4) AS engagement_score
    FROM posts p
    WHERE p.parent_post_id IS NULL
      AND p.created_at >= NOW() - INTERVAL '7 days'
  )
  SELECT
    u.id::text,
    u.username,
    u.display_name,
    u.bio,
    u.location,
    u.image_url,
    u.website,
    u.github_url,
    u.linkedin_url,
    u.cover_image_url,
    u.top_technologies,
    u.join_date,
    u.follower_count,
    u.following_count,
    COUNT(rp.id)::INTEGER AS recent_posts_count,
    COALESCE(SUM(rp.engagement_score),0)::INTEGER AS recent_engagement_score,
    MAX(rp.created_at) AS last_post_date
  FROM users u
  JOIN recent_posts rp ON rp.user_id = u.id
  LEFT JOIN user_followers uf ON u.id = uf.user_id AND uf.follower_id = current_user_id
  WHERE u.id IS NOT NULL
    AND (current_user_id IS NULL OR u.id != current_user_id)  -- exclude auth user if present
    AND (
      (only_following AND uf.user_id IS NOT NULL)
      OR
      (NOT only_following AND uf.user_id IS NULL)
    )
  GROUP BY
    u.id, u.username, u.display_name, u.bio, u.location, u.image_url,
    u.website, u.github_url, u.linkedin_url, u.cover_image_url,
    u.top_technologies, u.join_date, u.follower_count, u.following_count
  HAVING COALESCE(SUM(rp.engagement_score),0) >= 10
  ORDER BY COALESCE(SUM(rp.engagement_score),0) DESC,
           u.follower_count DESC NULLS LAST,
           MAX(rp.created_at) DESC
  LIMIT limit_count
  OFFSET offset_count;

  GET DIAGNOSTICS trending_count = ROW_COUNT;

  IF trending_count = 0 THEN
    -- Fallback: top users by follower_count (exclude current user and optionally exclude people you follow)
    RETURN QUERY
    SELECT
      u.id::text,
      u.username,
      u.display_name,
      u.bio,
      u.location,
      u.image_url,
      u.website,
      u.github_url,
      u.linkedin_url,
      u.cover_image_url,
      u.top_technologies,
      u.join_date,
      u.follower_count,
      u.following_count,
      COALESCE(p_counts.post_count,0)::INTEGER AS recent_posts_count,
      COALESCE(p_counts.total_engagement,0)::INTEGER AS recent_engagement_score,
      p_counts.last_post_date
    FROM users u
    LEFT JOIN LATERAL (
      SELECT COUNT(*) AS post_count,
             COALESCE(SUM(
               COALESCE(p.star_count,0)*3 +
               COALESCE(p.coffee_count,0)*2 +
               COALESCE(p.approve_count,0)*2 +
               COALESCE(p.cache_count,0)*1 +
               COALESCE(p.reply_count,0)*2 +
               COALESCE(p.repost_count,0)*4
             ),0) AS total_engagement,
             MAX(p.created_at) AS last_post_date
      FROM posts p
      WHERE p.user_id = u.id
        AND p.parent_post_id IS NULL
    ) p_counts ON true
    LEFT JOIN user_followers uf ON u.id = uf.user_id AND uf.follower_id = current_user_id
    WHERE (current_user_id IS NULL OR u.id != current_user_id)
      AND (
        (only_following AND uf.user_id IS NOT NULL)
        OR
        (NOT only_following AND uf.user_id IS NULL)
      )
    ORDER BY u.follower_count DESC NULLS LAST, p_counts.total_engagement DESC
    LIMIT limit_count
    OFFSET offset_count;
  END IF;

  RETURN;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.cleanup_orphaned_images()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'storage'
AS $function$
DECLARE
    orphaned_record RECORD;
BEGIN
    -- Log start of cleanup
    RAISE NOTICE 'Starting cleanup of temporary and orphaned files';

    -- First, clean up temp files older than 24 hours
    DELETE FROM storage.objects 
    WHERE bucket_id = 'post-images'
    AND name LIKE '%/temp/%'
    AND created_at < NOW() - INTERVAL '24 hours';

    -- Then find and clean up orphaned media records
    FOR orphaned_record IN
        SELECT pm.file_path
        FROM post_media pm
        LEFT JOIN posts p ON pm.post_id = p.id
        WHERE p.id IS NULL 
        AND pm.created_at < NOW() - INTERVAL '24 hours'
    LOOP
        -- Log the file being processed
        RAISE NOTICE 'Processing orphaned file: %', orphaned_record.file_path;

        -- Delete from storage
        DELETE FROM storage.objects 
        WHERE bucket_id = 'post-images' 
        AND name = orphaned_record.file_path;
        
        -- Delete from post_media
        DELETE FROM post_media 
        WHERE file_path = orphaned_record.file_path;
    END LOOP;

    -- Log completion
    RAISE NOTICE 'Cleanup completed';
END;
$function$
;

CREATE OR REPLACE FUNCTION public.decrement_reply_count()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF OLD.parent_post_id IS NOT NULL THEN
    UPDATE posts
    SET reply_count = reply_count - 1
    WHERE id = OLD.parent_post_id;
  END IF;
  RETURN OLD;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.decrement_repost_count()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF OLD.repost_post_id IS NOT NULL THEN
    UPDATE posts
    SET repost_count = repost_count - 1
    WHERE id = OLD.repost_post_id;
  END IF;
  RETURN OLD;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.delete_storage_object(file_path text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
begin
  -- Log the deletion attempt
  raise notice 'Attempting to delete file: %', file_path;

  -- Delete the object from storage
  delete from storage.objects
  where bucket_id = 'post-images'
  and name = file_path;

  -- Log successful deletion
  raise notice 'Successfully deleted file from bucket: %', file_path;
exception
  when others then
    -- Log any errors
    raise notice 'Error deleting file %: %', file_path, sqlerrm;
    raise;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.get_post_ancestry(start_id uuid)
 RETURNS TABLE(id uuid, content text, created_at timestamp with time zone, parent_post_id uuid, repost_post_id uuid, star_count integer, coffee_count integer, approve_count integer, cache_count integer, "user" json, reaction json, repost json)
 LANGUAGE sql
 STABLE
AS $function$
  WITH RECURSIVE thread AS (
    SELECT
      p.id,
      p.content,
      p.created_at,
      p.parent_post_id,
      p.repost_post_id,
      p.star_count,
      p.coffee_count,
      p.approve_count,
      p.cache_count,
      json_build_object(
        'id', u.id,
        'username', u.username,
        'display_name', u.display_name,
        'image_url', u.image_url,
        'bio', u.bio,
        'location', u.location,
        'website', u.website
      ) AS "user",
      COALESCE(
        jsonb_build_object(
          'id', r.id,
          'reaction_type', r.reaction_type,
          'created_at', r.created_at
        ),
        NULL
      ) AS reaction,
      CASE 
        WHEN p.repost_post_id IS NOT NULL THEN
          json_build_object(
            'id', rp.id,
            'content', rp.content,
            'created_at', rp.created_at,
            'user', json_build_object(
              'id', ru.id,
              'username', ru.username,
              'display_name', ru.display_name,
              'image_url', ru.image_url
            )
          )
        ELSE NULL
      END AS repost
    FROM posts p
    JOIN users u ON p.user_id = u.id
    LEFT JOIN LATERAL (
      SELECT *
      FROM reactions
      WHERE reactions.post_id = p.id
        AND reactions.user_id = auth.jwt() ->> 'sub'
      LIMIT 1
    ) r ON true
    LEFT JOIN posts rp ON p.repost_post_id = rp.id
    LEFT JOIN users ru ON rp.user_id = ru.id
    WHERE p.id = start_id

    UNION ALL

    SELECT
      parent.id,
      parent.content,
      parent.created_at,
      parent.parent_post_id,
      parent.repost_post_id,
      parent.star_count,
      parent.coffee_count,
      parent.approve_count,
      parent.cache_count,
      json_build_object(
        'id', u.id,
        'username', u.username,
        'display_name', u.display_name,
        'image_url', u.image_url,
        'bio', u.bio,
        'location', u.location,
        'website', u.website
      ) AS "user",
      COALESCE(
        jsonb_build_object(
          'id', r.id,
          'reaction_type', r.reaction_type,
          'created_at', r.created_at
        ),
        NULL
      ) AS reaction,
      CASE 
        WHEN parent.repost_post_id IS NOT NULL THEN
          json_build_object(
            'id', rp.id,
            'content', rp.content,
            'created_at', rp.created_at,
            'user', json_build_object(
              'id', ru.id,
              'username', ru.username,
              'display_name', ru.display_name,
              'image_url', ru.image_url
            )
          )
        ELSE NULL
      END AS repost
    FROM posts parent
    JOIN users u ON parent.user_id = u.id
    LEFT JOIN LATERAL (
      SELECT *
      FROM reactions
      WHERE reactions.post_id = parent.id
        AND reactions.user_id = auth.jwt() ->> 'sub'
      LIMIT 1
    ) r ON true
    LEFT JOIN posts rp ON parent.repost_post_id = rp.id
    LEFT JOIN users ru ON rp.user_id = ru.id
    JOIN thread child ON parent.id = child.parent_post_id
  )
  SELECT * FROM thread ORDER BY created_at ASC;
$function$
;

CREATE OR REPLACE FUNCTION public.get_random_unfollowed_users(count integer)
 RETURNS SETOF users
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  authenticated_user TEXT := auth.jwt() ->> 'sub';
BEGIN
  IF authenticated_user IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  RETURN QUERY
  SELECT *
  FROM users u
  WHERE u.id != authenticated_user
    AND u.id NOT IN (
      SELECT user_id FROM user_followers
      WHERE follower_id = authenticated_user
    )
  ORDER BY random()
  LIMIT count;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_replies_to_depth(target_id uuid, max_depth integer)
 RETURNS TABLE(id uuid, content text, created_at timestamp with time zone, parent_post_id uuid, repost_post_id uuid, star_count integer, coffee_count integer, approve_count integer, cache_count integer, level integer, "user" json, reaction json)
 LANGUAGE sql
 STABLE
AS $function$
  WITH RECURSIVE reply_tree AS (
    SELECT
      p.id,
      p.content,
      p.created_at,
      p.parent_post_id,
      p.repost_post_id,
      p.star_count,
      p.coffee_count,
      p.approve_count,
      p.cache_count,
      1 AS level,
      json_build_object(
        'id', u.id,
        'username', u.username,
        'display_name', u.display_name,
        'image_url', u.image_url,
        'bio', u.bio,
        'location', u.location,
        'website', u.website
      ) AS "user",
      jsonb_build_object(
        'id', r.id,
        'reaction_type', r.reaction_type,
        'created_at', r.created_at
      ) AS reaction
    FROM posts p
    JOIN users u ON p.user_id = u.id
    LEFT JOIN LATERAL (
      SELECT *
      FROM reactions
      WHERE reactions.post_id = p.id
        AND reactions.user_id = auth.jwt() ->> 'sub'
      LIMIT 1
    ) r ON true
    WHERE p.parent_post_id = target_id

    UNION ALL

    SELECT
      p.id,
      p.content,
      p.created_at,
      p.parent_post_id,
      p.repost_post_id,
      p.star_count,
      p.coffee_count,
      p.approve_count,
      p.cache_count,
      rt.level + 1,
      json_build_object(
        'id', u.id,
        'username', u.username,
        'display_name', u.display_name,
        'image_url', u.image_url,
        'bio', u.bio,
        'location', u.location,
        'website', u.website
      ) AS "user",
      jsonb_build_object(
        'id', r.id,
        'reaction_type', r.reaction_type,
        'created_at', r.created_at
      ) AS reaction
    FROM posts p
    JOIN users u ON p.user_id = u.id
    LEFT JOIN LATERAL (
      SELECT *
      FROM reactions
      WHERE reactions.post_id = p.id
        AND reactions.user_id = auth.jwt() ->> 'sub'
      LIMIT 1
    ) r ON true
    JOIN reply_tree rt ON p.parent_post_id = rt.id
    WHERE rt.level < max_depth
  )
  SELECT * FROM reply_tree
  ORDER BY level, created_at;
$function$
;

CREATE OR REPLACE FUNCTION public.get_trending_posts(limit_count integer DEFAULT 20, offset_count integer DEFAULT 0)
 RETURNS TABLE(id uuid, content text, created_at timestamp with time zone, parent_post_id uuid, repost_post_id uuid, reply_count integer, repost_count integer, star_count integer, coffee_count integer, approve_count integer, cache_count integer, engagement_score integer, "user" json, reaction json, repost json)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  current_user_id TEXT := auth.jwt() ->> 'sub';
  trending_count INTEGER;
BEGIN
  -- Validate pagination parameters
  IF limit_count <= 0 THEN
    limit_count := 20; -- Default to 20 if invalid
  END IF;
  
  IF offset_count < 0 THEN
    offset_count := 0; -- Default to 0 if negative
  END IF;

  -- First, try to get trending posts (last 7 days with high engagement)
  RETURN QUERY
  SELECT 
    p.id,
    p.content,
    p.created_at,
    p.parent_post_id,
    p.repost_post_id,
    p.reply_count,
    p.repost_count,
    p.star_count,
    p.coffee_count,
    p.approve_count,
    p.cache_count,
    -- Calculate engagement score (weighted)
    (COALESCE(p.star_count, 0) * 3 + 
     COALESCE(p.coffee_count, 0) * 2 + 
     COALESCE(p.approve_count, 0) * 2 + 
     COALESCE(p.cache_count, 0) * 1 + 
     COALESCE(p.reply_count, 0) * 2 + 
     COALESCE(p.repost_count, 0) * 4) as engagement_score,
    -- User information as nested JSON object
    json_build_object(
      'id', u.id,
      'username', u.username,
      'display_name', u.display_name,
      'image_url', u.image_url,
      'bio', u.bio,
      'location', u.location,
      'website', u.website,
      'github_url', u.github_url,
      'linkedin_url', u.linkedin_url,
      'cover_image_url', u.cover_image_url,
      'top_technologies', u.top_technologies,
      'join_date', u.join_date,
      'follower_count', u.follower_count,
      'following_count', u.following_count
    ) AS "user",
    -- Current user's reaction (if any)
    COALESCE(
      json_build_object(
        'id', r.id,
        'reaction_type', r.reaction_type,
        'created_at', r.created_at
      ),
      NULL
    ) AS reaction,
    -- Repost information (if this is a repost)
    CASE 
      WHEN p.repost_post_id IS NOT NULL THEN
        json_build_object(
          'id', rp.id,
          'content', rp.content,
          'created_at', rp.created_at,
          'user', json_build_object(
            'id', ru.id,
            'username', ru.username,
            'display_name', ru.display_name,
            'image_url', ru.image_url
          )
        )
      ELSE NULL
    END AS repost
  FROM posts p
  INNER JOIN users u ON p.user_id = u.id
  LEFT JOIN reactions r ON r.post_id = p.id AND r.user_id = current_user_id
  LEFT JOIN posts rp ON p.repost_post_id = rp.id
  LEFT JOIN users ru ON rp.user_id = ru.id
  WHERE 
    -- Only return top-level posts (not replies)
    p.parent_post_id IS NULL
    AND
    -- Posts from the last 7 days
    p.created_at >= NOW() - INTERVAL '7 days'
    AND
    -- Minimum engagement threshold (5 points)
    (COALESCE(p.star_count, 0) * 3 + 
     COALESCE(p.coffee_count, 0) * 2 + 
     COALESCE(p.approve_count, 0) * 2 + 
     COALESCE(p.cache_count, 0) * 1 + 
     COALESCE(p.reply_count, 0) * 2 + 
     COALESCE(p.repost_count, 0) * 4) >= 5
  ORDER BY 
    -- First by engagement score (highest first)
    (COALESCE(p.star_count, 0) * 3 + 
     COALESCE(p.coffee_count, 0) * 2 + 
     COALESCE(p.approve_count, 0) * 2 + 
     COALESCE(p.cache_count, 0) * 1 + 
     COALESCE(p.reply_count, 0) * 2 + 
     COALESCE(p.repost_count, 0) * 4) DESC,
    -- Then by recency (newest first)
    p.created_at DESC
  LIMIT limit_count
  OFFSET offset_count;

  -- Check if we got any trending posts
  GET DIAGNOSTICS trending_count = ROW_COUNT;
  
  -- If no trending posts found, return fallback: most popular posts
  IF trending_count = 0 THEN
    RETURN QUERY
    SELECT 
      p.id,
      p.content,
      p.created_at,
      p.parent_post_id,
      p.repost_post_id,
      p.reply_count,
      p.repost_count,
      p.star_count,
      p.coffee_count,
      p.approve_count,
      p.cache_count,
      -- Calculate engagement score (weighted)
      (COALESCE(p.star_count, 0) * 3 + 
       COALESCE(p.coffee_count, 0) * 2 + 
       COALESCE(p.approve_count, 0) * 2 + 
       COALESCE(p.cache_count, 0) * 1 + 
       COALESCE(p.reply_count, 0) * 2 + 
       COALESCE(p.repost_count, 0) * 4) as engagement_score,
      -- User information as nested JSON object
      json_build_object(
        'id', u.id,
        'username', u.username,
        'display_name', u.display_name,
        'image_url', u.image_url,
        'bio', u.bio,
        'location', u.location,
        'website', u.website,
        'github_url', u.github_url,
        'linkedin_url', u.linkedin_url,
        'cover_image_url', u.cover_image_url,
        'top_technologies', u.top_technologies,
        'join_date', u.join_date,
        'follower_count', u.follower_count,
        'following_count', u.following_count
      ) AS "user",
      -- Current user's reaction (if any)
      COALESCE(
        json_build_object(
          'id', r.id,
          'reaction_type', r.reaction_type,
          'created_at', r.created_at
        ),
        NULL
      ) AS reaction,
      -- Repost information (if this is a repost)
      CASE 
        WHEN p.repost_post_id IS NOT NULL THEN
          json_build_object(
            'id', rp.id,
            'content', rp.content,
            'created_at', rp.created_at,
            'user', json_build_object(
              'id', ru.id,
              'username', ru.username,
              'display_name', ru.display_name,
              'image_url', ru.image_url
            )
          )
        ELSE NULL
      END AS repost
    FROM posts p
    INNER JOIN users u ON p.user_id = u.id
    LEFT JOIN reactions r ON r.post_id = p.id AND r.user_id = current_user_id
    LEFT JOIN posts rp ON p.repost_post_id = rp.id
    LEFT JOIN users ru ON rp.user_id = ru.id
    WHERE 
      -- Only return top-level posts (not replies)
      p.parent_post_id IS NULL
    ORDER BY 
      -- Order by total engagement (reactions + replies + reposts)
      (COALESCE(p.star_count, 0) + COALESCE(p.coffee_count, 0) + 
       COALESCE(p.approve_count, 0) + COALESCE(p.cache_count, 0) + 
       COALESCE(p.reply_count, 0) + COALESCE(p.repost_count, 0)) DESC,
      -- Then by creation date (newest first)
      p.created_at DESC
    LIMIT GREATEST(limit_count, 10) -- Ensure at least 10 results for fallback
    OFFSET offset_count;
  END IF;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_user_feed()
 RETURNS TABLE(id uuid, content text, created_at timestamp with time zone, parent_post_id uuid, repost_post_id uuid, reply_count integer, repost_count integer, star_count integer, coffee_count integer, approve_count integer, cache_count integer, "user" json, reaction json, repost json)
 LANGUAGE plpgsql
 STABLE
AS $function$
DECLARE
  current_user_id TEXT := auth.jwt() ->> 'sub';
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.content,
    p.created_at,
    p.parent_post_id,
    p.repost_post_id,
    p.reply_count,
    p.repost_count,
    p.star_count,
    p.coffee_count,
    p.approve_count,
    p.cache_count,
    json_build_object(
      'id', u.id,
      'username', u.username,
      'display_name', u.display_name,
      'image_url', u.image_url,
      'bio', u.bio,
      'location', u.location,
      'website', u.website
    ) AS "user",
    COALESCE(
      json_build_object(
        'id', r.id,
        'reaction_type', r.reaction_type,
        'created_at', r.created_at
      ),
      NULL
    ) AS reaction,
    CASE 
      WHEN p.repost_post_id IS NOT NULL THEN
        json_build_object(
          'id', rp.id,
          'content', rp.content,
          'created_at', rp.created_at,
          'user', json_build_object(
            'id', ru.id,
            'username', ru.username,
            'display_name', ru.display_name,
            'image_url', ru.image_url
          )
        )
      ELSE NULL
    END AS repost
  FROM posts p
  JOIN users u ON p.user_id = u.id
  LEFT JOIN reactions r ON r.post_id = p.id AND r.user_id = current_user_id
  LEFT JOIN posts rp ON p.repost_post_id = rp.id
  LEFT JOIN users ru ON rp.user_id = ru.id
  ORDER BY p.created_at DESC;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_user_posts_by_username(input_username text)
 RETURNS TABLE(id uuid, content text, created_at timestamp with time zone, parent_post_id uuid, repost_post_id uuid, reply_count integer, repost_count integer, star_count integer, coffee_count integer, approve_count integer, cache_count integer, "user" json, reaction json, repost json)
 LANGUAGE plpgsql
 STABLE
AS $function$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.content,
    p.created_at,
    p.parent_post_id,
    p.repost_post_id,
    p.reply_count,
    p.repost_count,
    p.star_count,
    p.coffee_count,
    p.approve_count,
    p.cache_count,
    json_build_object(
      'id', u.id,
      'username', u.username,
      'display_name', u.display_name,
      'image_url', u.image_url,
      'bio', u.bio,
      'location', u.location,
      'website', u.website
    ) AS "user",
    COALESCE(
      (
        SELECT json_build_object(
          'id', r.id,
          'reaction_type', r.reaction_type,
          'created_at', r.created_at
        )
        FROM reactions r
        WHERE r.post_id = p.id
          AND r.user_id = auth.jwt() ->> 'sub'
        LIMIT 1
      ),
      NULL
    ) AS reaction,
    CASE 
      WHEN p.repost_post_id IS NOT NULL THEN
        json_build_object(
          'id', rp.id,
          'content', rp.content,
          'created_at', rp.created_at,
          'user', json_build_object(
            'id', ru.id,
            'username', ru.username,
            'display_name', ru.display_name,
            'image_url', ru.image_url
          )
        )
      ELSE NULL
    END AS repost
  FROM posts p
  JOIN users u ON p.user_id = u.id
  LEFT JOIN posts rp ON p.repost_post_id = rp.id
  LEFT JOIN users ru ON rp.user_id = ru.id
  WHERE u.username = input_username
  ORDER BY p.created_at DESC;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_deleted_media()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
begin
  -- Log the trigger execution
  raise notice 'Post media deleted - File path: %', old.file_path;
  
  -- Call the function to delete the file using the file_path
  perform delete_storage_object(old.file_path);
  return old;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.increment_reply_count()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF NEW.parent_post_id IS NOT NULL THEN
    UPDATE posts
    SET reply_count = reply_count + 1
    WHERE id = NEW.parent_post_id;
  END IF;
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.increment_repost_count()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF NEW.repost_post_id IS NOT NULL THEN
    UPDATE posts
    SET repost_count = repost_count + 1
    WHERE id = NEW.repost_post_id;
  END IF;
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.search_posts(search_term text, limit_count integer DEFAULT 20, offset_count integer DEFAULT 0)
 RETURNS TABLE(id uuid, content text, created_at timestamp with time zone, parent_post_id uuid, repost_post_id uuid, reply_count integer, repost_count integer, star_count integer, coffee_count integer, approve_count integer, cache_count integer, rank real, "user" json, reaction json, repost json)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  current_user_id TEXT := auth.jwt() ->> 'sub';
BEGIN
  -- Return early if search term is empty or null (returns empty result set)
  IF search_term IS NULL OR TRIM(search_term) = '' THEN
    RETURN;
  END IF;

  -- Clean and prepare search term
  search_term := TRIM(search_term);

  -- Validate pagination parameters
  IF limit_count <= 0 THEN
    limit_count := 20; -- Default to 20 if invalid
  END IF;
  
  IF offset_count < 0 THEN
    offset_count := 0; -- Default to 0 if negative
  END IF;

  RETURN QUERY
  SELECT 
    p.id,
    p.content,
    p.created_at,
    p.parent_post_id,
    p.repost_post_id,
    p.reply_count,
    p.repost_count,
    p.star_count,
    p.coffee_count,
    p.approve_count,
    p.cache_count,
    ts_rank(
      to_tsvector('english', 
        COALESCE(p.content, '') || ' ' || 
        COALESCE(u.username, '') || ' ' || 
        COALESCE(u.display_name, '')
      ), 
      plainto_tsquery('english', search_term)
    ) as rank,
    -- User information as nested JSON object
    json_build_object(
      'id', u.id,
      'username', u.username,
      'display_name', u.display_name,
      'image_url', u.image_url,
      'bio', u.bio,
      'location', u.location,
      'website', u.website,
      'github_url', u.github_url,
      'linkedin_url', u.linkedin_url,
      'cover_image_url', u.cover_image_url,
      'top_technologies', u.top_technologies,
      'join_date', u.join_date,
      'follower_count', u.follower_count,
      'following_count', u.following_count
    ) AS "user",
    -- Current user's reaction (if any)
    COALESCE(
      json_build_object(
        'id', r.id,
        'reaction_type', r.reaction_type,
        'created_at', r.created_at
      ),
      NULL
    ) AS reaction,
    -- Repost information (if this is a repost)
    CASE 
      WHEN p.repost_post_id IS NOT NULL THEN
        json_build_object(
          'id', rp.id,
          'content', rp.content,
          'created_at', rp.created_at,
          'user', json_build_object(
            'id', ru.id,
            'username', ru.username,
            'display_name', ru.display_name,
            'image_url', ru.image_url
          )
        )
      ELSE NULL
    END AS repost
  FROM posts p
  INNER JOIN users u ON p.user_id = u.id
  LEFT JOIN reactions r ON r.post_id = p.id AND r.user_id = current_user_id
  LEFT JOIN posts rp ON p.repost_post_id = rp.id
  LEFT JOIN users ru ON rp.user_id = ru.id
  WHERE 
    (
      -- Primary: Use full-text search across content, username, and display_name
      to_tsvector('english', 
        COALESCE(p.content, '') || ' ' || 
        COALESCE(u.username, '') || ' ' || 
        COALESCE(u.display_name, '')
      ) @@ plainto_tsquery('english', search_term)
      OR
      -- Fallback: Partial search in post content
      (p.content IS NOT NULL AND LOWER(p.content) LIKE '%' || LOWER(search_term) || '%')
      OR
      -- Fallback: Partial search in username
      LOWER(u.username) LIKE '%' || LOWER(search_term) || '%'
      OR
      -- Fallback: Partial search in display_name
      (u.display_name IS NOT NULL AND LOWER(u.display_name) LIKE '%' || LOWER(search_term) || '%')
      OR
      -- Fallback: Partial search in github_url
      (u.github_url IS NOT NULL AND LOWER(u.github_url) LIKE '%' || LOWER(search_term) || '%')
    )
    AND
    -- Only return top-level posts (not replies) for cleaner search results
    p.parent_post_id IS NULL
  ORDER BY 
    -- First by full-text search rank (relevance) - higher rank for full-text matches
    CASE 
      WHEN to_tsvector('english', 
        COALESCE(p.content, '') || ' ' || 
        COALESCE(u.username, '') || ' ' || 
        COALESCE(u.display_name, '')
      ) @@ plainto_tsquery('english', search_term) 
      THEN ts_rank(
        to_tsvector('english', 
          COALESCE(p.content, '') || ' ' || 
          COALESCE(u.username, '') || ' ' || 
          COALESCE(u.display_name, '')
        ), 
        plainto_tsquery('english', search_term)
      )
      ELSE 0.1 -- Lower rank for partial matches
    END DESC,
    -- Then by total engagement (sum of all reaction counts)
    (COALESCE(p.star_count, 0) + COALESCE(p.coffee_count, 0) + 
     COALESCE(p.approve_count, 0) + COALESCE(p.cache_count, 0) + 
     COALESCE(p.reply_count, 0) + COALESCE(p.repost_count, 0)) DESC,
    -- Finally by creation date (newest first)
    p.created_at DESC
  LIMIT limit_count
  OFFSET offset_count;
  
  -- PostgreSQL automatically returns an empty result set when no rows match the WHERE clause
  -- This means the function will return an empty array when no search results are found
END;
$function$
;

CREATE OR REPLACE FUNCTION public.search_users(search_term text, limit_count integer DEFAULT 20, offset_count integer DEFAULT 0)
 RETURNS TABLE(id text, username text, display_name text, bio text, location text, image_url text, website text, github_url text, linkedin_url text, cover_image_url text, top_technologies text[], join_date timestamp with time zone, follower_count integer, following_count integer, rank real)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- Return early if search term is empty or null
  IF search_term IS NULL OR TRIM(search_term) = '' THEN
    RETURN;
  END IF;

  -- Clean and prepare search term
  search_term := TRIM(search_term);

  -- Validate pagination parameters
  IF limit_count <= 0 THEN
    limit_count := 20; -- Default to 20 if invalid
  END IF;
  
  IF offset_count < 0 THEN
    offset_count := 0; -- Default to 0 if negative
  END IF;

  RETURN QUERY
  SELECT 
    u.id,
    u.username,
    u.display_name,
    u.bio,
    u.location,
    u.image_url,
    u.website,
    u.github_url,
    u.linkedin_url,
    u.cover_image_url,
    u.top_technologies,
    u.join_date,
    u.follower_count,
    u.following_count,
    ts_rank(u.fts, plainto_tsquery('english', search_term)) as rank
  FROM users u
  WHERE 
    -- Use full-text search with the fts column
    u.fts @@ plainto_tsquery('english', search_term)
    OR
    -- Fallback: exact username match for precise searches
    LOWER(u.username) = LOWER(search_term)
    OR
    -- Fallback: partial username match
    LOWER(u.username) LIKE '%' || LOWER(search_term) || '%'
  ORDER BY 
    -- Prioritize exact username matches first
    CASE WHEN LOWER(u.username) = LOWER(search_term) THEN 1 ELSE 2 END,
    -- Then by full-text search rank (relevance)
    ts_rank(u.fts, plainto_tsquery('english', search_term)) DESC,
    -- Then by follower count (popularity)
    u.follower_count DESC NULLS LAST,
    -- Finally by join date (newest first)
    u.join_date DESC NULLS LAST
  LIMIT limit_count
  OFFSET offset_count;
  
  -- If no rows were returned, the function will naturally return an empty result set
  -- PostgreSQL functions that return TABLE automatically return empty arrays when no matches
END;
$function$
;

CREATE OR REPLACE FUNCTION public.toggle_follow(target_user_id text)
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$
DECLARE
  authenticated_user TEXT;
  is_following BOOLEAN;
BEGIN
  authenticated_user := (auth.jwt() ->> 'sub'); -- Get user ID from JWT

  RAISE NOTICE 'Authenticated User: %, Target User: %', authenticated_user, target_user_id;

  IF authenticated_user IS NULL THEN
    RAISE EXCEPTION 'Current user is not authenticated';
  END IF;

  IF authenticated_user = target_user_id THEN
    RAISE EXCEPTION 'You cannot follow yourself';
  END IF;

  -- Check if the authenticated user is already following the target user
  SELECT EXISTS (
    SELECT 1 FROM user_followers
    WHERE user_id = target_user_id AND follower_id = authenticated_user
  ) INTO is_following;

  RAISE NOTICE 'Is Following: %, Authenticated User: %', is_following, authenticated_user;

  IF is_following THEN
    DELETE FROM user_followers
    WHERE user_id = target_user_id AND follower_id = authenticated_user;

    RETURN FALSE; -- Unfollowed
  ELSE
    INSERT INTO user_followers(user_id, follower_id)
    VALUES (target_user_id, authenticated_user);

    RETURN TRUE; -- Followed
  END IF;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.toggle_reaction(input_post_id uuid, input_reaction_type text)
 RETURNS reactions
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  current_user_id TEXT := auth.jwt() ->> 'sub';
  existing_id UUID;
  existing_type TEXT;
  reaction_row reactions;
BEGIN
  -- Check if any reaction exists for that user + post
  SELECT id, reaction_type INTO existing_id, existing_type
  FROM reactions
  WHERE post_id = input_post_id
    AND user_id = current_user_id;

  IF existing_id IS NOT NULL THEN
    IF existing_type = input_reaction_type THEN
      -- Same reaction: delete it (toggle off)
      DELETE FROM reactions
      WHERE id = existing_id
      RETURNING * INTO reaction_row;
      RETURN reaction_row;
    ELSE
      -- Different reaction: update to the new type
      UPDATE reactions
      SET reaction_type = input_reaction_type,
          created_at = now()
      WHERE id = existing_id
      RETURNING * INTO reaction_row;
      RETURN reaction_row;
    END IF;
  ELSE
    -- No reaction yet: insert new
    INSERT INTO reactions (post_id, reaction_type)
    VALUES (input_post_id, input_reaction_type)
    RETURNING * INTO reaction_row;
    RETURN reaction_row;
  END IF;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_follow_counts()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- When a new follow is added
  IF TG_OP = 'INSERT' THEN
    -- Increase follower count of the followed user
    UPDATE users
    SET follower_count = COALESCE(follower_count, 0) + 1
    WHERE id = NEW.user_id;

    -- Increase following count of the follower
    UPDATE users
    SET following_count = COALESCE(following_count, 0) + 1
    WHERE id = NEW.follower_id;
    
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrease follower count of the unfollowed user
    UPDATE users
    SET follower_count = GREATEST(COALESCE(follower_count, 1) - 1, 0)
    WHERE id = OLD.user_id;

    -- Decrease following count of the unfollowing user
    UPDATE users
    SET following_count = GREATEST(COALESCE(following_count, 1) - 1, 0)
    WHERE id = OLD.follower_id;
  END IF;

  RETURN NULL;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_post_reaction_counts()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  RAISE NOTICE 'Trigger fired for operation: %, post_id: %, reaction_type: %', TG_OP, NEW.post_id, NEW.reaction_type;
  
  IF TG_OP = 'INSERT' THEN
    -- Increment the appropriate counter
    UPDATE posts 
    SET 
      star_count = star_count + (CASE WHEN NEW.reaction_type = 'star' THEN 1 ELSE 0 END),
      coffee_count = coffee_count + (CASE WHEN NEW.reaction_type = 'coffee' THEN 1 ELSE 0 END),
      approve_count = approve_count + (CASE WHEN NEW.reaction_type = 'approve' THEN 1 ELSE 0 END),
      cache_count = cache_count + (CASE WHEN NEW.reaction_type = 'cache' THEN 1 ELSE 0 END)
    WHERE id = NEW.post_id;

  ELSIF TG_OP = 'DELETE' THEN
    -- Decrement the appropriate counter
    UPDATE posts 
    SET 
      star_count = GREATEST(star_count - (CASE WHEN OLD.reaction_type = 'star' THEN 1 ELSE 0 END), 0),
      coffee_count = GREATEST(coffee_count - (CASE WHEN OLD.reaction_type = 'coffee' THEN 1 ELSE 0 END), 0),
      approve_count = GREATEST(approve_count - (CASE WHEN OLD.reaction_type = 'approve' THEN 1 ELSE 0 END), 0),
      cache_count = GREATEST(cache_count - (CASE WHEN OLD.reaction_type = 'cache' THEN 1 ELSE 0 END), 0)
    WHERE id = OLD.post_id;

  ELSIF TG_OP = 'UPDATE' THEN
    -- Handle the case where the reaction type is updated
    IF NEW.reaction_type IS DISTINCT FROM OLD.reaction_type THEN
      -- Decrement the count for the old reaction type
      UPDATE posts 
      SET 
        star_count = GREATEST(star_count - (CASE WHEN OLD.reaction_type = 'star' THEN 1 ELSE 0 END), 0),
        coffee_count = GREATEST(coffee_count - (CASE WHEN OLD.reaction_type = 'coffee' THEN 1 ELSE 0 END), 0),
        approve_count = GREATEST(approve_count - (CASE WHEN OLD.reaction_type = 'approve' THEN 1 ELSE 0 END), 0),
        cache_count = GREATEST(cache_count - (CASE WHEN OLD.reaction_type = 'cache' THEN 1 ELSE 0 END), 0)
      WHERE id = OLD.post_id;

      -- Increment the count for the new reaction type
      UPDATE posts 
      SET 
        star_count = star_count + (CASE WHEN NEW.reaction_type = 'star' THEN 1 ELSE 0 END),
        coffee_count = coffee_count + (CASE WHEN NEW.reaction_type = 'coffee' THEN 1 ELSE 0 END),
        approve_count = approve_count + (CASE WHEN NEW.reaction_type = 'approve' THEN 1 ELSE 0 END),
        cache_count = cache_count + (CASE WHEN NEW.reaction_type = 'cache' THEN 1 ELSE 0 END)
      WHERE id = NEW.post_id;
    END IF;
  END IF;

  RETURN NULL; -- This is correct for a trigger that does not modify the row
END;
$function$
;