BEGIN;

-- Plan the tests
SELECT
    plan(20);

-- Test table existence
SELECT
    has_table('public', 'users', 'Table users should exist');

SELECT
    has_table('public', 'posts', 'Table posts should exist');

SELECT
    has_table(
        'public',
        'reactions',
        'Table reactions should exist'
    );

SELECT
    has_table(
        'public',
        'user_followers',
        'Table user_followers should exist'
    );

-- Test users table columns
SELECT
    has_column('public', 'users', 'id', 'users.id should exist');

SELECT
    has_column(
        'public',
        'users',
        'username',
        'users.username should exist'
    );

SELECT
    has_column(
        'public',
        'users',
        'display_name',
        'users.display_name should exist'
    );

SELECT
    has_column(
        'public',
        'users',
        'bio',
        'users.bio should exist'
    );

SELECT
    has_column(
        'public',
        'users',
        'location',
        'users.location should exist'
    );

-- Test posts table columns
SELECT
    has_column('public', 'posts', 'id', 'posts.id should exist');

SELECT
    has_column(
        'public',
        'posts',
        'user_id',
        'posts.user_id should exist'
    );

SELECT
    has_column(
        'public',
        'posts',
        'content',
        'posts.content should exist'
    );

SELECT
    has_column(
        'public',
        'posts',
        'parent_post_id',
        'posts.parent_post_id should exist'
    );

SELECT
    has_column(
        'public',
        'posts',
        'repost_post_id',
        'posts.repost_post_id should exist'
    );

-- Test reactions table columns
SELECT
    has_column(
        'public',
        'reactions',
        'id',
        'reactions.id should exist'
    );

SELECT
    has_column(
        'public',
        'reactions',
        'user_id',
        'reactions.user_id should exist'
    );

SELECT
    has_column(
        'public',
        'reactions',
        'post_id',
        'reactions.post_id should exist'
    );

SELECT
    has_column(
        'public',
        'reactions',
        'reaction_type',
        'reactions.reaction_type should exist'
    );

-- Test user_followers table columns
SELECT
    has_column(
        'public',
        'user_followers',
        'user_id',
        'user_followers.user_id should exist'
    );

SELECT
    has_column(
        'public',
        'user_followers',
        'follower_id',
        'user_followers.follower_id should exist'
    );

SELECT
    *
FROM
    finish();

ROLLBACK;