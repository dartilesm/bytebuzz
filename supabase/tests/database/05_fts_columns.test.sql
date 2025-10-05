BEGIN;

-- Plan the tests
SELECT
    plan(15);

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

-- Test 5: users fts column is generated
SELECT
    col_is_generated(
        'public',
        'users',
        'fts',
        'users fts column should be generated'
    );

-- Test 6: posts fts column is generated
SELECT
    col_is_generated(
        'public',
        'posts',
        'fts',
        'posts fts column should be generated'
    );

-- Test 7: users_fts_idx index exists
SELECT
    has_index(
        'public',
        'users',
        'users_fts_idx',
        'users table should have users_fts_idx index'
    );

-- Test 8: posts_fts_idx index exists
SELECT
    has_index(
        'public',
        'posts',
        'posts_fts_idx',
        'posts table should have posts_fts_idx index'
    );

-- Test 9: users_fts_idx is a GIN index
SELECT
    index_type_is(
        'public',
        'users',
        'users_fts_idx',
        'gin',
        'users_fts_idx should be a GIN index'
    );

-- Test 10: posts_fts_idx is a GIN index
SELECT
    index_type_is(
        'public',
        'posts',
        'posts_fts_idx',
        'gin',
        'posts_fts_idx should be a GIN index'
    );

-- Test 11: users_fts_idx is on fts column
SELECT
    index_cols_are(
        'public',
        'users',
        'users_fts_idx',
        ARRAY ['fts'],
        'users_fts_idx should be on fts column'
    );

-- Test 12: posts_fts_idx is on fts column
SELECT
    index_cols_are(
        'public',
        'posts',
        'posts_fts_idx',
        ARRAY ['fts'],
        'posts_fts_idx should be on fts column'
    );

-- Test 13: users fts column is stored (not virtual)
SELECT
    col_is_stored(
        'public',
        'users',
        'fts',
        'users fts column should be stored'
    );

-- Test 14: posts fts column is stored (not virtual)
SELECT
    col_is_stored(
        'public',
        'posts',
        'fts',
        'posts fts column should be stored'
    );

-- Test 15: fts columns are not nullable
SELECT
    col_not_null(
        'public',
        'users',
        'fts',
        'users fts column should not be nullable'
    );

SELECT
    *
FROM
    finish();

ROLLBACK;