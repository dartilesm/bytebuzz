

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."decrement_reply_count"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  IF OLD.parent_post_id IS NOT NULL THEN
    UPDATE posts
    SET reply_count = reply_count - 1
    WHERE id = OLD.parent_post_id;
  END IF;
  RETURN OLD;
END;
$$;


ALTER FUNCTION "public"."decrement_reply_count"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."decrement_repost_count"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  IF OLD.repost_post_id IS NOT NULL THEN
    UPDATE posts
    SET repost_count = repost_count - 1
    WHERE id = OLD.repost_post_id;
  END IF;
  RETURN OLD;
END;
$$;


ALTER FUNCTION "public"."decrement_repost_count"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_post_ancestry"("start_id" "uuid") RETURNS TABLE("id" "uuid", "content" "text", "created_at" timestamp with time zone, "parent_post_id" "uuid", "repost_post_id" "uuid", "star_count" integer, "coffee_count" integer, "approve_count" integer, "cache_count" integer, "user" "json", "reaction" "json")
    LANGUAGE "sql" STABLE
    AS $$
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
      jsonb_build_object(
        'id', r.id,
        'reaction_type', r.reaction_type,
        'created_at', r.created_at
      ) AS reaction
    FROM posts parent
    JOIN users u ON parent.user_id = u.id
    LEFT JOIN LATERAL (
      SELECT *
      FROM reactions
      WHERE reactions.post_id = parent.id
        AND reactions.user_id = auth.jwt() ->> 'sub'
      LIMIT 1
    ) r ON true
    JOIN thread child ON parent.id = child.parent_post_id
  )
  SELECT * FROM thread ORDER BY created_at ASC;
$$;


ALTER FUNCTION "public"."get_post_ancestry"("start_id" "uuid") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "text" DEFAULT ("auth"."jwt"() ->> 'sub'::"text") NOT NULL,
    "username" "text" NOT NULL,
    "display_name" "text" NOT NULL,
    "bio" "text",
    "location" "text",
    "image_url" "text",
    "website" "text",
    "join_date" timestamp with time zone DEFAULT "now"(),
    "follower_count" integer DEFAULT 0,
    "following_count" integer DEFAULT 0
);


ALTER TABLE "public"."users" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_random_unfollowed_users"("count" integer) RETURNS SETOF "public"."users"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
$$;


ALTER FUNCTION "public"."get_random_unfollowed_users"("count" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_replies_to_depth"("target_id" "uuid", "max_depth" integer) RETURNS TABLE("id" "uuid", "content" "text", "created_at" timestamp with time zone, "parent_post_id" "uuid", "repost_post_id" "uuid", "star_count" integer, "coffee_count" integer, "approve_count" integer, "cache_count" integer, "level" integer, "user" "json", "reaction" "json")
    LANGUAGE "sql" STABLE
    AS $$
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
$$;


ALTER FUNCTION "public"."get_replies_to_depth"("target_id" "uuid", "max_depth" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_feed"() RETURNS TABLE("id" "uuid", "content" "text", "created_at" timestamp with time zone, "parent_post_id" "uuid", "repost_post_id" "uuid", "reply_count" integer, "repost_count" integer, "star_count" integer, "coffee_count" integer, "approve_count" integer, "cache_count" integer, "user" "json", "reaction" "json")
    LANGUAGE "plpgsql" STABLE
    AS $$
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
    json_build_object(
      'id', r.id,
      'reaction_type', r.reaction_type,
      'created_at', r.created_at
    ) AS reaction
  FROM posts p
  JOIN users u ON p.user_id = u.id
  LEFT JOIN reactions r
    ON r.post_id = p.id AND r.user_id = current_user_id
  ORDER BY p.created_at DESC;
END;
$$;


ALTER FUNCTION "public"."get_user_feed"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_posts_by_username"("input_username" "text") RETURNS TABLE("id" "uuid", "content" "text", "created_at" timestamp with time zone, "parent_post_id" "uuid", "repost_post_id" "uuid", "reply_count" integer, "repost_count" integer, "star_count" integer, "coffee_count" integer, "approve_count" integer, "cache_count" integer, "user" "json", "reaction" "json")
    LANGUAGE "plpgsql" STABLE
    AS $$
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
    ) AS reaction
  FROM posts p
  JOIN users u ON p.user_id = u.id
  WHERE u.username = input_username
  ORDER BY p.created_at DESC;
END;
$$;


ALTER FUNCTION "public"."get_user_posts_by_username"("input_username" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."increment_reply_count"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  IF NEW.parent_post_id IS NOT NULL THEN
    UPDATE posts
    SET reply_count = reply_count + 1
    WHERE id = NEW.parent_post_id;
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."increment_reply_count"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."increment_repost_count"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  IF NEW.repost_post_id IS NOT NULL THEN
    UPDATE posts
    SET repost_count = repost_count + 1
    WHERE id = NEW.repost_post_id;
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."increment_repost_count"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."toggle_follow"("target_user_id" "text") RETURNS boolean
    LANGUAGE "plpgsql"
    AS $$
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
$$;


ALTER FUNCTION "public"."toggle_follow"("target_user_id" "text") OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."reactions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "text" DEFAULT ("auth"."jwt"() ->> 'sub'::"text") NOT NULL,
    "post_id" "uuid",
    "reaction_type" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "reactions_reaction_type_check" CHECK (("reaction_type" = ANY (ARRAY['star'::"text", 'coffee'::"text", 'approve'::"text", 'cache'::"text"])))
);


ALTER TABLE "public"."reactions" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."toggle_reaction"("input_post_id" "uuid", "input_reaction_type" "text") RETURNS "public"."reactions"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
$$;


ALTER FUNCTION "public"."toggle_reaction"("input_post_id" "uuid", "input_reaction_type" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_follow_counts"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
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
$$;


ALTER FUNCTION "public"."update_follow_counts"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_post_reaction_counts"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
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
$$;


ALTER FUNCTION "public"."update_post_reaction_counts"() OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."posts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "text" DEFAULT ("auth"."jwt"() ->> 'sub'::"text") NOT NULL,
    "content" "text",
    "parent_post_id" "uuid",
    "repost_post_id" "uuid",
    "reply_count" integer DEFAULT 0,
    "repost_count" integer DEFAULT 0,
    "star_count" integer DEFAULT 0,
    "coffee_count" integer DEFAULT 0,
    "approve_count" integer DEFAULT 0,
    "cache_count" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."posts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_followers" (
    "user_id" "text" NOT NULL,
    "follower_id" "text" DEFAULT ("auth"."jwt"() ->> 'sub'::"text") NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."user_followers" OWNER TO "postgres";


ALTER TABLE ONLY "public"."posts"
    ADD CONSTRAINT "posts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."reactions"
    ADD CONSTRAINT "reactions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."reactions"
    ADD CONSTRAINT "reactions_user_id_post_id_reaction_type_key" UNIQUE ("user_id", "post_id", "reaction_type");



ALTER TABLE ONLY "public"."user_followers"
    ADD CONSTRAINT "user_followers_pkey" PRIMARY KEY ("user_id", "follower_id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_username_key" UNIQUE ("username");



CREATE OR REPLACE TRIGGER "trigger_decrement_reply_count" AFTER DELETE ON "public"."posts" FOR EACH ROW WHEN (("old"."parent_post_id" IS NOT NULL)) EXECUTE FUNCTION "public"."decrement_reply_count"();



CREATE OR REPLACE TRIGGER "trigger_decrement_repost_count" AFTER DELETE ON "public"."posts" FOR EACH ROW WHEN (("old"."repost_post_id" IS NOT NULL)) EXECUTE FUNCTION "public"."decrement_repost_count"();



CREATE OR REPLACE TRIGGER "trigger_increment_reply_count" AFTER INSERT ON "public"."posts" FOR EACH ROW WHEN (("new"."parent_post_id" IS NOT NULL)) EXECUTE FUNCTION "public"."increment_reply_count"();



CREATE OR REPLACE TRIGGER "trigger_increment_repost_count" AFTER INSERT ON "public"."posts" FOR EACH ROW WHEN (("new"."repost_post_id" IS NOT NULL)) EXECUTE FUNCTION "public"."increment_repost_count"();



CREATE OR REPLACE TRIGGER "update_post_reaction_counts_trigger" AFTER INSERT OR DELETE OR UPDATE ON "public"."reactions" FOR EACH ROW EXECUTE FUNCTION "public"."update_post_reaction_counts"();



CREATE OR REPLACE TRIGGER "user_followers_delete" AFTER DELETE ON "public"."user_followers" FOR EACH ROW EXECUTE FUNCTION "public"."update_follow_counts"();



CREATE OR REPLACE TRIGGER "user_followers_insert" AFTER INSERT ON "public"."user_followers" FOR EACH ROW EXECUTE FUNCTION "public"."update_follow_counts"();



ALTER TABLE ONLY "public"."posts"
    ADD CONSTRAINT "posts_parent_post_id_fkey" FOREIGN KEY ("parent_post_id") REFERENCES "public"."posts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."posts"
    ADD CONSTRAINT "posts_repost_post_id_fkey" FOREIGN KEY ("repost_post_id") REFERENCES "public"."posts"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."posts"
    ADD CONSTRAINT "posts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reactions"
    ADD CONSTRAINT "reactions_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reactions"
    ADD CONSTRAINT "reactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_followers"
    ADD CONSTRAINT "user_followers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Any user can see posts" ON "public"."posts" FOR SELECT USING (true);



CREATE POLICY "Any user can see reactions" ON "public"."reactions" FOR SELECT USING (true);



CREATE POLICY "Any user can see user_followers" ON "public"."user_followers" FOR SELECT USING (true);



CREATE POLICY "Users can follow others" ON "public"."user_followers" FOR INSERT TO "authenticated" WITH CHECK (("follower_id" = ("auth"."jwt"() ->> 'sub'::"text")));



CREATE POLICY "Users can unfollow" ON "public"."user_followers" FOR DELETE TO "authenticated" USING (("follower_id" = ("auth"."jwt"() ->> 'sub'::"text")));



CREATE POLICY "Users must delete their own posts" ON "public"."posts" FOR DELETE TO "authenticated" USING ((( SELECT ("auth"."jwt"() ->> 'sub'::"text")) = "user_id"));



CREATE POLICY "Users must delete their own reactions" ON "public"."reactions" FOR DELETE TO "authenticated" USING ((( SELECT ("auth"."jwt"() ->> 'sub'::"text")) = "user_id"));



CREATE POLICY "Users must insert their own posts" ON "public"."posts" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT ("auth"."jwt"() ->> 'sub'::"text")) = "user_id"));



CREATE POLICY "Users must insert their own reactions" ON "public"."reactions" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT ("auth"."jwt"() ->> 'sub'::"text")) = "user_id"));



CREATE POLICY "Users must update their own posts" ON "public"."posts" FOR UPDATE TO "authenticated" WITH CHECK ((( SELECT ("auth"."jwt"() ->> 'sub'::"text")) = "user_id"));



CREATE POLICY "Users must update their own reactions" ON "public"."reactions" FOR UPDATE TO "authenticated" WITH CHECK ((( SELECT ("auth"."jwt"() ->> 'sub'::"text")) = "user_id"));



ALTER TABLE "public"."posts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."reactions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_followers" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";











































































































































































GRANT ALL ON FUNCTION "public"."decrement_reply_count"() TO "anon";
GRANT ALL ON FUNCTION "public"."decrement_reply_count"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."decrement_reply_count"() TO "service_role";



GRANT ALL ON FUNCTION "public"."decrement_repost_count"() TO "anon";
GRANT ALL ON FUNCTION "public"."decrement_repost_count"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."decrement_repost_count"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_post_ancestry"("start_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_post_ancestry"("start_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_post_ancestry"("start_id" "uuid") TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";



GRANT ALL ON FUNCTION "public"."get_random_unfollowed_users"("count" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_random_unfollowed_users"("count" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_random_unfollowed_users"("count" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_replies_to_depth"("target_id" "uuid", "max_depth" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_replies_to_depth"("target_id" "uuid", "max_depth" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_replies_to_depth"("target_id" "uuid", "max_depth" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_feed"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_feed"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_feed"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_posts_by_username"("input_username" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_posts_by_username"("input_username" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_posts_by_username"("input_username" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."increment_reply_count"() TO "anon";
GRANT ALL ON FUNCTION "public"."increment_reply_count"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."increment_reply_count"() TO "service_role";



GRANT ALL ON FUNCTION "public"."increment_repost_count"() TO "anon";
GRANT ALL ON FUNCTION "public"."increment_repost_count"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."increment_repost_count"() TO "service_role";



GRANT ALL ON FUNCTION "public"."toggle_follow"("target_user_id" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."toggle_follow"("target_user_id" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."toggle_follow"("target_user_id" "text") TO "service_role";



GRANT ALL ON TABLE "public"."reactions" TO "anon";
GRANT ALL ON TABLE "public"."reactions" TO "authenticated";
GRANT ALL ON TABLE "public"."reactions" TO "service_role";



GRANT ALL ON FUNCTION "public"."toggle_reaction"("input_post_id" "uuid", "input_reaction_type" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."toggle_reaction"("input_post_id" "uuid", "input_reaction_type" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."toggle_reaction"("input_post_id" "uuid", "input_reaction_type" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_follow_counts"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_follow_counts"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_follow_counts"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_post_reaction_counts"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_post_reaction_counts"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_post_reaction_counts"() TO "service_role";


















GRANT ALL ON TABLE "public"."posts" TO "anon";
GRANT ALL ON TABLE "public"."posts" TO "authenticated";
GRANT ALL ON TABLE "public"."posts" TO "service_role";



GRANT ALL ON TABLE "public"."user_followers" TO "anon";
GRANT ALL ON TABLE "public"."user_followers" TO "authenticated";
GRANT ALL ON TABLE "public"."user_followers" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
