BEGIN;

-- Plan the tests
SELECT
    plan(15);

-- Clean up existing data
TRUNCATE users,
posts,
reactions,
user_followers,
post_media CASCADE;

-- Test unique constraints
SELECT
    col_is_unique(
        'public',
        'users',
        'username',
        'users.username should be unique'
    );

-- Test foreign key constraints
SELECT
    col_is_fk(
        'public',
        'posts',
        'user_id',
        'posts.user_id should be a foreign key'
    );

SELECT
    col_is_fk(
        'public',
        'posts',
        'parent_post_id',
        'posts.parent_post_id should be a foreign key'
    );

SELECT
    col_is_fk(
        'public',
        'posts',
        'repost_post_id',
        'posts.repost_post_id should be a foreign key'
    );

SELECT
    col_is_fk(
        'public',
        'reactions',
        'user_id',
        'reactions.user_id should be a foreign key'
    );

SELECT
    col_is_fk(
        'public',
        'reactions',
        'post_id',
        'reactions.post_id should be a foreign key'
    );

SELECT
    col_is_fk(
        'public',
        'user_followers',
        'user_id',
        'user_followers.user_id should be a foreign key'
    );

SELECT
    col_is_fk(
        'public',
        'post_media',
        'post_id',
        'post_media.post_id should be a foreign key'
    );

-- Test default values
SELECT
    col_default_is(
        'public',
        'users',
        'follower_count',
        '0',
        'users.follower_count should default to 0'
    );

SELECT
    col_default_is(
        'public',
        'users',
        'following_count',
        '0',
        'users.following_count should default to 0'
    );

SELECT
    col_default_is(
        'public',
        'posts',
        'reply_count',
        '0',
        'posts.reply_count should default to 0'
    );

SELECT
    col_default_is(
        'public',
        'posts',
        'repost_count',
        '0',
        'posts.repost_count should default to 0'
    );

SELECT
    col_default_is(
        'public',
        'posts',
        'star_count',
        '0',
        'posts.star_count should default to 0'
    );

SELECT
    col_default_is(
        'public',
        'posts',
        'coffee_count',
        '0',
        'posts.coffee_count should default to 0'
    );

SELECT
    col_default_is(
        'public',
        'posts',
        'approve_count',
        '0',
        'posts.approve_count should default to 0'
    );

SELECT
    *
FROM
    finish();

ROLLBACK;