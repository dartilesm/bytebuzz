BEGIN;

-- Plan the tests
SELECT
    plan(4);

-- Test 1: posts table exists
SELECT
    has_table(
        'public',
        'posts',
        'posts table should exist'
    );

-- Test 2: reactions table exists
SELECT
    has_table(
        'public',
        'reactions',
        'reactions table should exist'
    );

-- Test 3: user_followers table exists
SELECT
    has_table(
        'public',
        'user_followers',
        'user_followers table should exist'
    );

-- Test 4: post_media table exists
SELECT
    has_table(
        'public',
        'post_media',
        'post_media table should exist'
    );

SELECT
    *
FROM
    finish();

ROLLBACK;