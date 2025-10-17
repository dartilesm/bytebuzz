BEGIN;

-- Plan the tests
SELECT
    plan(7);

-- Test 1: users table has fts column
SELECT
    has_column(
        'public',
        'users',
        'fts',
        'users table should have fts column for full-text search'
    );

-- Test 2: posts table has fts column
SELECT
    has_column(
        'public',
        'posts',
        'fts',
        'posts table should have fts column for full-text search'
    );

-- Test 3: users fts column is of type tsvector
SELECT
    col_type_is(
        'public',
        'users',
        'fts',
        'tsvector',
        'users fts column should be of type tsvector'
    );

-- Test 4: posts fts column is of type tsvector
SELECT
    col_type_is(
        'public',
        'posts',
        'fts',
        'tsvector',
        'posts fts column should be of type tsvector'
    );

-- Test 5: users_fts_idx index exists
SELECT
    has_index(
        'public',
        'users',
        'users_fts_idx',
        'users table should have users_fts_idx index'
    );

-- Test 6: posts_fts_idx index exists
SELECT
    has_index(
        'public',
        'posts',
        'posts_fts_idx',
        'posts table should have posts_fts_idx index'
    );

-- Test 7: users fts column exists and is of correct type
SELECT
    col_type_is(
        'public',
        'users',
        'fts',
        'tsvector',
        'users fts column should be of type tsvector'
    );

SELECT
    *
FROM
    finish();

ROLLBACK;