drop function if exists "public"."get_post_ancestry"(start_id uuid);

drop function if exists "public"."get_user_feed"();

drop function if exists "public"."get_user_posts_by_username"(input_username text);

create table "public"."post_media" (
    "id" uuid not null default gen_random_uuid(),
    "post_id" uuid,
    "media_type" text not null default 'image'::text,
    "file_url" text not null,
    "file_path" text not null,
    "file_size" integer,
    "mime_type" text,
    "alt_text" text,
    "display_order" integer default 0,
    "created_at" timestamp with time zone default now()
);


alter table "public"."post_media" enable row level security;

CREATE INDEX idx_post_media_created_at ON public.post_media USING btree (created_at);

CREATE INDEX idx_post_media_post_id ON public.post_media USING btree (post_id);

CREATE UNIQUE INDEX post_media_pkey ON public.post_media USING btree (id);

alter table "public"."post_media" add constraint "post_media_pkey" PRIMARY KEY using index "post_media_pkey";

alter table "public"."post_media" add constraint "post_media_post_id_fkey" FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE not valid;

alter table "public"."post_media" validate constraint "post_media_post_id_fkey";

set check_function_bodies = off;

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

grant delete on table "public"."post_media" to "anon";

grant insert on table "public"."post_media" to "anon";

grant references on table "public"."post_media" to "anon";

grant select on table "public"."post_media" to "anon";

grant trigger on table "public"."post_media" to "anon";

grant truncate on table "public"."post_media" to "anon";

grant update on table "public"."post_media" to "anon";

grant delete on table "public"."post_media" to "authenticated";

grant insert on table "public"."post_media" to "authenticated";

grant references on table "public"."post_media" to "authenticated";

grant select on table "public"."post_media" to "authenticated";

grant trigger on table "public"."post_media" to "authenticated";

grant truncate on table "public"."post_media" to "authenticated";

grant update on table "public"."post_media" to "authenticated";

grant delete on table "public"."post_media" to "service_role";

grant insert on table "public"."post_media" to "service_role";

grant references on table "public"."post_media" to "service_role";

grant select on table "public"."post_media" to "service_role";

grant trigger on table "public"."post_media" to "service_role";

grant truncate on table "public"."post_media" to "service_role";

grant update on table "public"."post_media" to "service_role";

create policy "Users can delete their post media"
on "public"."post_media"
as permissive
for delete
to public
using ((EXISTS ( SELECT 1
   FROM posts
  WHERE ((posts.id = post_media.post_id) AND (posts.user_id = (auth.jwt() ->> 'sub'::text))))));


create policy "Users can insert media for their posts"
on "public"."post_media"
as permissive
for insert
to public
with check ((EXISTS ( SELECT 1
   FROM posts
  WHERE ((posts.id = post_media.post_id) AND (posts.user_id = (auth.jwt() ->> 'sub'::text))))));


create policy "Users can view all post media"
on "public"."post_media"
as permissive
for select
to public
using (true);


CREATE TRIGGER on_post_media_deleted AFTER DELETE ON public.post_media FOR EACH ROW EXECUTE FUNCTION handle_deleted_media();


