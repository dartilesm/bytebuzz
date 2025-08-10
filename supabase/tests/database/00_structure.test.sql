BEGIN;

-- Plan the tests
SELECT
    plan(52);

-- Test if the tables exist
SELECT
    has_table('public' :: name, 'users' :: name);

SELECT
    has_table('public' :: name, 'posts' :: name);

SELECT
    has_table('public' :: name, 'reactions' :: name);

SELECT
    has_table('public' :: name, 'user_followers' :: name);

SELECT
    has_table('public' :: name, 'post_media' :: name);

-- Test users table columns
SELECT
    has_column(
        'public' :: name,
        'users' :: name,
        'id' :: name,
        'id column exists'
    );

SELECT
    has_column(
        'public' :: name,
        'users' :: name,
        'username' :: name,
        'username column exists'
    );

SELECT
    has_column(
        'public' :: name,
        'users' :: name,
        'display_name' :: name,
        'display_name column exists'
    );

SELECT
    has_column(
        'public' :: name,
        'users' :: name,
        'bio' :: name,
        'bio column exists'
    );

SELECT
    has_column(
        'public' :: name,
        'users' :: name,
        'location' :: name,
        'location column exists'
    );

SELECT
    has_column(
        'public' :: name,
        'users' :: name,
        'image_url' :: name,
        'image_url column exists'
    );

SELECT
    has_column(
        'public' :: name,
        'users' :: name,
        'website' :: name,
        'website column exists'
    );

SELECT
    has_column(
        'public' :: name,
        'users' :: name,
        'join_date' :: name,
        'join_date column exists'
    );

SELECT
    has_column(
        'public' :: name,
        'users' :: name,
        'follower_count' :: name,
        'follower_count column exists'
    );

SELECT
    has_column(
        'public' :: name,
        'users' :: name,
        'following_count' :: name,
        'following_count column exists'
    );

-- Test posts table columns
SELECT
    has_column(
        'public' :: name,
        'posts' :: name,
        'id' :: name,
        'id column exists'
    );

SELECT
    has_column(
        'public' :: name,
        'posts' :: name,
        'user_id' :: name,
        'user_id column exists'
    );

SELECT
    has_column(
        'public' :: name,
        'posts' :: name,
        'content' :: name,
        'content column exists'
    );

SELECT
    has_column(
        'public' :: name,
        'posts' :: name,
        'parent_post_id' :: name,
        'parent_post_id column exists'
    );

SELECT
    has_column(
        'public' :: name,
        'posts' :: name,
        'repost_post_id' :: name,
        'repost_post_id column exists'
    );

SELECT
    has_column(
        'public' :: name,
        'posts' :: name,
        'reply_count' :: name,
        'reply_count column exists'
    );

SELECT
    has_column(
        'public' :: name,
        'posts' :: name,
        'repost_count' :: name,
        'repost_count column exists'
    );

SELECT
    has_column(
        'public' :: name,
        'posts' :: name,
        'star_count' :: name,
        'star_count column exists'
    );

SELECT
    has_column(
        'public' :: name,
        'posts' :: name,
        'coffee_count' :: name,
        'coffee_count column exists'
    );

SELECT
    has_column(
        'public' :: name,
        'posts' :: name,
        'approve_count' :: name,
        'approve_count column exists'
    );

SELECT
    has_column(
        'public' :: name,
        'posts' :: name,
        'cache_count' :: name,
        'cache_count column exists'
    );

SELECT
    has_column(
        'public' :: name,
        'posts' :: name,
        'created_at' :: name,
        'created_at column exists'
    );

-- Test reactions table columns
SELECT
    has_column(
        'public' :: name,
        'reactions' :: name,
        'id' :: name,
        'id column exists'
    );

SELECT
    has_column(
        'public' :: name,
        'reactions' :: name,
        'user_id' :: name,
        'user_id column exists'
    );

SELECT
    has_column(
        'public' :: name,
        'reactions' :: name,
        'post_id' :: name,
        'post_id column exists'
    );

SELECT
    has_column(
        'public' :: name,
        'reactions' :: name,
        'reaction_type' :: name,
        'reaction_type column exists'
    );

SELECT
    has_column(
        'public' :: name,
        'reactions' :: name,
        'created_at' :: name,
        'created_at column exists'
    );

-- Test user_followers table columns
SELECT
    has_column(
        'public' :: name,
        'user_followers' :: name,
        'user_id' :: name,
        'user_id column exists'
    );

SELECT
    has_column(
        'public' :: name,
        'user_followers' :: name,
        'follower_id' :: name,
        'follower_id column exists'
    );

SELECT
    has_column(
        'public' :: name,
        'user_followers' :: name,
        'created_at' :: name,
        'created_at column exists'
    );

-- Test post_media table columns
SELECT
    has_column(
        'public' :: name,
        'post_media' :: name,
        'id' :: name,
        'id column exists'
    );

SELECT
    has_column(
        'public' :: name,
        'post_media' :: name,
        'post_id' :: name,
        'post_id column exists'
    );

SELECT
    has_column(
        'public' :: name,
        'post_media' :: name,
        'media_type' :: name,
        'media_type column exists'
    );

SELECT
    has_column(
        'public' :: name,
        'post_media' :: name,
        'file_url' :: name,
        'file_url column exists'
    );

SELECT
    has_column(
        'public' :: name,
        'post_media' :: name,
        'file_path' :: name,
        'file_path column exists'
    );

SELECT
    has_column(
        'public' :: name,
        'post_media' :: name,
        'file_size' :: name,
        'file_size column exists'
    );

SELECT
    has_column(
        'public' :: name,
        'post_media' :: name,
        'mime_type' :: name,
        'mime_type column exists'
    );

SELECT
    has_column(
        'public' :: name,
        'post_media' :: name,
        'alt_text' :: name,
        'alt_text column exists'
    );

SELECT
    has_column(
        'public' :: name,
        'post_media' :: name,
        'display_order' :: name,
        'display_order column exists'
    );

SELECT
    has_column(
        'public' :: name,
        'post_media' :: name,
        'created_at' :: name,
        'created_at column exists'
    );

-- Test foreign key relationships
SELECT
    col_is_fk(
        'public' :: name,
        'posts' :: name,
        'user_id' :: name,
        'posts.user_id is a foreign key'
    );

SELECT
    col_is_fk(
        'public' :: name,
        'posts' :: name,
        'parent_post_id' :: name,
        'posts.parent_post_id is a foreign key'
    );

SELECT
    col_is_fk(
        'public' :: name,
        'posts' :: name,
        'repost_post_id' :: name,
        'posts.repost_post_id is a foreign key'
    );

SELECT
    col_is_fk(
        'public' :: name,
        'reactions' :: name,
        'user_id' :: name,
        'reactions.user_id is a foreign key'
    );

SELECT
    col_is_fk(
        'public' :: name,
        'reactions' :: name,
        'post_id' :: name,
        'reactions.post_id is a foreign key'
    );

SELECT
    col_is_fk(
        'public' :: name,
        'user_followers' :: name,
        'user_id' :: name,
        'user_followers.user_id is a foreign key'
    );

SELECT
    col_is_fk(
        'public' :: name,
        'post_media' :: name,
        'post_id' :: name,
        'post_media.post_id is a foreign key'
    );

SELECT
    *
FROM
    finish();

ROLLBACK;