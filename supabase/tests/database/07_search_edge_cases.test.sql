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

-- Create test users with edge case data
INSERT INTO
    auth.users (id, email)
VALUES
    (
        'd0c5340a-1b19-4762-9213-f2b9f0b8f351',
        'dartilesm@test.com'
    ),
    (
        'e1d6f8c2-3a4b-5d7e-9f0a-1b2c3d4e5f67',
        'test_user@test.com'
    );

INSERT INTO
    public.users (
        id,
        username,
        display_name,
        bio,
        location,
        github_url,
        top_technologies
    )
VALUES
    (
        'd0c5340a-1b19-4762-9213-f2b9f0b8f351',
        'dartilesm',
        'Diego Artiles',
        'Full-stack developer passionate about React and TypeScript development',
        'San Francisco, CA',
        'https://github.com/dartilesm',
        ARRAY ['React', 'TypeScript', 'Node.js']
    ),
    (
        'e1d6f8c2-3a4b-5d7e-9f0a-1b2c3d4e5f67',
        'test_user',
        'Test User',
        NULL,
        -- NULL bio
        NULL,
        -- NULL location
        NULL,
        -- NULL github_url
        NULL -- NULL top_technologies
    );

-- Create test posts with edge case data
INSERT INTO
    public.posts (id, user_id, content, star_count, reply_count)
VALUES
    (
        '11111111-1111-1111-1111-111111111111',
        'd0c5340a-1b19-4762-9213-f2b9f0b8f351',
        'Just learned about React hooks! They are amazing for state management.',
        5,
        2
    ),
    (
        '22222222-2222-2222-2222-222222222222',
        'e1d6f8c2-3a4b-5d7e-9f0a-1b2c3d4e5f67',
        NULL,
        -- NULL content
        0,
        0
    ),
    (
        '33333333-3333-3333-3333-333333333333',
        'd0c5340a-1b19-4762-9213-f2b9f0b8f351',
        '',
        -- Empty string content
        0,
        0
    );

-- Set up test environment
SET
    client_min_messages TO warning;

SET
    ROLE authenticated;

-- Set up authenticated user context
SET
    LOCAL request.jwt.claim.sub TO 'd0c5340a-1b19-4762-9213-f2b9f0b8f351';

SET
    LOCAL request.jwt.claims TO '{"sub": "d0c5340a-1b19-4762-9213-f2b9f0b8f351", "role": "authenticated"}';

-- Test 1: search_users handles NULL values gracefully
SELECT
    lives_ok(
        'SELECT * FROM search_users(''test_user'', 10, 0)',
        'search_users should handle NULL values gracefully'
    );

-- Test 2: search_posts handles NULL content gracefully
SELECT
    results_eq(
        'SELECT count(*) FROM search_posts(''test_user'', 10, 0)',
        ARRAY [1::bigint],
        'search_posts should handle NULL content gracefully'
    );

-- Test 3: search_users handles empty string search
SELECT
    results_eq(
        'SELECT count(*) FROM search_users('''')',
        ARRAY [0::bigint],
        'search_users should handle empty string search'
    );

-- Test 4: search_posts handles empty string search
SELECT
    results_eq(
        'SELECT count(*) FROM search_posts('''')',
        ARRAY [0::bigint],
        'search_posts should handle empty string search'
    );

-- Test 5: search_users handles whitespace-only search
SELECT
    results_eq(
        'SELECT count(*) FROM search_users(''   '')',
        ARRAY [0::bigint],
        'search_users should handle whitespace-only search'
    );

-- Test 6: search_posts handles whitespace-only search
SELECT
    results_eq(
        'SELECT count(*) FROM search_posts(''   '')',
        ARRAY [0::bigint],
        'search_posts should handle whitespace-only search'
    );

-- Test 7: search_users handles very long search terms
SELECT
    results_eq(
        'SELECT count(*) FROM search_users(''this is a very long search term that contains many words and should be handled gracefully by the search function'')',
        ARRAY [0::bigint],
        'search_users should handle very long search terms'
    );

-- Test 8: search_posts handles very long search terms
SELECT
    results_eq(
        'SELECT count(*) FROM search_posts(''this is a very long search term that contains many words and should be handled gracefully by the search function'')',
        ARRAY [0::bigint],
        'search_posts should handle very long search terms'
    );

-- Test 9: search_users handles special characters
SELECT
    results_eq(
        'SELECT count(*) FROM search_users(''@#$%^&*()'')',
        ARRAY [0::bigint],
        'search_users should handle special characters'
    );

-- Test 10: search_posts handles special characters
SELECT
    results_eq(
        'SELECT count(*) FROM search_posts(''@#$%^&*()'')',
        ARRAY [0::bigint],
        'search_posts should handle special characters'
    );

-- Test 11: search_users handles negative limit
SELECT
    results_eq(
        'SELECT count(*) FROM search_users(''dartilesm'', -1, 0)',
        ARRAY [1::bigint],
        'search_users should handle negative limit gracefully'
    );

-- Test 12: search_posts handles negative limit
SELECT
    results_eq(
        'SELECT count(*) FROM search_posts(''React'', -1, 0)',
        ARRAY [1::bigint],
        'search_posts should handle negative limit gracefully'
    );

-- Test 13: search_users handles negative offset
SELECT
    results_eq(
        'SELECT count(*) FROM search_users(''dartilesm'', 10, -1)',
        ARRAY [1::bigint],
        'search_users should handle negative offset gracefully'
    );

-- Test 14: search_posts handles negative offset
SELECT
    results_eq(
        'SELECT count(*) FROM search_posts(''React'', 10, -1)',
        ARRAY [1::bigint],
        'search_posts should handle negative offset gracefully'
    );

-- Test 15: search functions handle zero limit
SELECT
    results_eq(
        'SELECT count(*) FROM search_users(''dartilesm'', 0, 0)',
        ARRAY [1::bigint],
        'search_users should handle zero limit gracefully'
    );

SELECT
    *
FROM
    finish();

ROLLBACK;