BEGIN;

-- Plan the tests
SELECT
    plan(8);

-- Test foreign key constraints
SELECT
    col_is_fk(
        'public',
        'posts',
        'user_id',
        'Foreign key constraint on posts.user_id should exist'
    );

SELECT
    col_is_fk(
        'public',
        'posts',
        'parent_post_id',
        'Foreign key constraint on posts.parent_post_id should exist'
    );

SELECT
    col_is_fk(
        'public',
        'reactions',
        'user_id',
        'Foreign key constraint on reactions.user_id should exist'
    );

SELECT
    col_is_fk(
        'public',
        'reactions',
        'post_id',
        'Foreign key constraint on reactions.post_id should exist'
    );

SELECT
    col_is_fk(
        'public',
        'user_followers',
        'user_id',
        'Foreign key constraint on user_followers.user_id should exist'
    );

-- Test not null constraints
SELECT
    col_not_null(
        'public',
        'users',
        'username',
        'users.username should be NOT NULL'
    );

SELECT
    col_not_null(
        'public',
        'users',
        'id',
        'users.id should be NOT NULL'
    );

-- Test unique constraints
SELECT
    col_is_unique(
        'public',
        'users',
        'username',
        'users.username should be UNIQUE'
    );

SELECT
    *
FROM
    finish();

ROLLBACK;