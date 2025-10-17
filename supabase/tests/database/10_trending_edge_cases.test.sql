BEGIN;

-- Plan the tests
SELECT
    plan(23);

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
    ),
    (
        'f2e7f9d3-4b5c-6e8f-0a1b-2c3d4e5f6789',
        'react_dev@test.com'
    );

INSERT INTO
    public.users (
        id,
        username,
        display_name,
        bio,
        location,
        github_url,
        top_technologies,
        follower_count
    )
VALUES
    (
        'd0c5340a-1b19-4762-9213-f2b9f0b8f351',
        'dartilesm',
        'Diego Artiles',
        'Full-stack developer passionate about React and TypeScript',
        'San Francisco, CA',
        'https://github.com/dartilesm',
        ARRAY ['React', 'TypeScript', 'Node.js'],
        100
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
        NULL,
        -- NULL top_technologies
        50
    ),
    (
        'f2e7f9d3-4b5c-6e8f-0a1b-2c3d4e5f6789',
        'react_dev',
        'React Developer',
        'Frontend specialist focused on React ecosystem',
        'Seattle, WA',
        'https://github.com/reactdev',
        ARRAY ['React', 'Next.js', 'TailwindCSS'],
        75
    );

-- Create test posts with edge case data
INSERT INTO
    public.posts (
        id,
        user_id,
        content,
        star_count,
        coffee_count,
        reply_count,
        repost_count,
        created_at
    )
VALUES
    (
        '11111111-1111-1111-1111-111111111111',
        'd0c5340a-1b19-4762-9213-f2b9f0b8f351',
        'Just learned about React hooks! They are amazing for state management.',
        10,
        5,
        3,
        2,
        NOW() - INTERVAL '2 days'
    ),
    (
        '22222222-2222-2222-2222-222222222222',
        'e1d6f8c2-3a4b-5d7e-9f0a-1b2c3d4e5f67',
        NULL,
        -- NULL content
        0,
        0,
        0,
        0,
        NOW() - INTERVAL '1 day'
    ),
    (
        '33333333-3333-3333-3333-333333333333',
        'f2e7f9d3-4b5c-6e8f-0a1b-2c3d4e5f6789',
        '',
        -- Empty string content
        0,
        0,
        0,
        0,
        NOW() - INTERVAL '3 days'
    ),
    (
        '44444444-4444-4444-4444-444444444444',
        'd0c5340a-1b19-4762-9213-f2b9f0b8f351',
        'This post has very low engagement.',
        1,
        0,
        0,
        0,
        NOW() - INTERVAL '1 day'
    );

-- Create following relationships for edge case testing
INSERT INTO
    public.user_followers (user_id, follower_id)
VALUES
    (
        'e1d6f8c2-3a4b-5d7e-9f0a-1b2c3d4e5f67',
        -- test_user
        'd0c5340a-1b19-4762-9213-f2b9f0b8f351' -- dartilesm (authenticated user)
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

-- Test 1: get_trending_posts handles NULL content gracefully
SELECT
    lives_ok(
        'SELECT * FROM get_trending_posts(10, 0)',
        'get_trending_posts should handle NULL content gracefully'
    );

-- Test 2: get_trending_users handles NULL values gracefully
SELECT
    lives_ok(
        'SELECT * FROM get_trending_users(10, 0)',
        'get_trending_users should handle NULL values gracefully'
    );

-- Test 3: get_trending_posts handles empty string content
SELECT
    results_eq(
        'SELECT count(*) FROM get_trending_posts() WHERE content = ''''',
        ARRAY [0::bigint],
        'get_trending_posts should handle empty string content'
    );

-- Test 4: get_trending_users handles NULL bio gracefully
SELECT
    results_eq(
        'SELECT count(*) FROM get_trending_users() WHERE bio IS NULL',
        ARRAY [0::bigint],
        'get_trending_users should handle NULL bio gracefully'
    );

-- Test 5: get_trending_posts handles negative limit
SELECT
    results_eq(
        'SELECT count(*) FROM get_trending_posts(-1, 0)',
        ARRAY [1::bigint],
        'get_trending_posts should handle negative limit gracefully'
    );

-- Test 6: get_trending_users handles negative limit
SELECT
    results_eq(
        'SELECT count(*) FROM get_trending_users(-1, 0)',
        ARRAY [1::bigint],
        'get_trending_users should handle negative limit gracefully'
    );

-- Test 7: get_trending_posts handles negative offset
SELECT
    results_eq(
        'SELECT count(*) FROM get_trending_posts(10, -1)',
        ARRAY [1::bigint],
        'get_trending_posts should handle negative offset gracefully'
    );

-- Test 8: get_trending_users handles negative offset
SELECT
    results_eq(
        'SELECT count(*) FROM get_trending_users(10, -1)',
        ARRAY [1::bigint],
        'get_trending_users should handle negative offset gracefully'
    );

-- Test 9: get_trending_posts handles zero limit
SELECT
    results_eq(
        'SELECT count(*) FROM get_trending_posts(0, 0)',
        ARRAY [1::bigint],
        'get_trending_posts should handle zero limit gracefully'
    );

-- Test 10: get_trending_users handles zero limit
SELECT
    results_eq(
        'SELECT count(*) FROM get_trending_users(0, 0)',
        ARRAY [1::bigint],
        'get_trending_users should handle zero limit gracefully'
    );

-- Test 11: get_trending_posts handles very large limit
SELECT
    results_eq(
        'SELECT count(*) FROM get_trending_posts(1000, 0)',
        ARRAY [1::bigint],
        'get_trending_posts should handle very large limit gracefully'
    );

-- Test 12: get_trending_users handles very large limit
SELECT
    results_eq(
        'SELECT count(*) FROM get_trending_users(1000, 0)',
        ARRAY [1::bigint],
        'get_trending_users should handle very large limit gracefully'
    );

-- Test 13: get_trending_posts handles very large offset
SELECT
    results_eq(
        'SELECT count(*) FROM get_trending_posts(10, 1000)',
        ARRAY [0::bigint],
        'get_trending_posts should handle very large offset gracefully'
    );

-- Test 14: get_trending_users handles very large offset
SELECT
    results_eq(
        'SELECT count(*) FROM get_trending_users(10, 1000)',
        ARRAY [0::bigint],
        'get_trending_users should handle very large offset gracefully'
    );

-- Test 15: get_trending_posts excludes low engagement posts
SELECT
    results_eq(
        'SELECT count(*) FROM get_trending_posts() WHERE content LIKE ''%low engagement%''',
        ARRAY [0::bigint],
        'get_trending_posts should exclude low engagement posts'
    );

-- Test 16: get_trending_users excludes authenticated user
SELECT
    results_eq(
        'SELECT count(*) FROM get_trending_users() WHERE id = ''d0c5340a-1b19-4762-9213-f2b9f0b8f351''',
        ARRAY [0::bigint],
        'get_trending_users should exclude authenticated user'
    );

-- Test 17: get_trending_posts includes only top-level posts
SELECT
    results_eq(
        'SELECT count(*) FROM get_trending_posts() WHERE parent_post_id IS NOT NULL',
        ARRAY [0::bigint],
        'get_trending_posts should include only top-level posts'
    );

-- Test 18: get_trending_users includes only users with recent posts
SELECT
    results_eq(
        'SELECT count(*) FROM get_trending_users() WHERE recent_posts_count > 0',
        ARRAY [1::bigint],
        'get_trending_users should include only users with recent posts'
    );

-- Test 19: get_trending_posts function executes without error
SELECT
    lives_ok(
        'SELECT * FROM get_trending_posts(10, 0)',
        'get_trending_posts function should execute without error'
    );

-- Test 20: get_trending_users function executes without error
SELECT
    lives_ok(
        'SELECT * FROM get_trending_users(10, 0)',
        'get_trending_users function should execute without error'
    );

-- Test 21: get_trending_users handles only_following parameter with NULL values
SELECT
    lives_ok(
        'SELECT * FROM get_trending_users(10, 0, true)',
        'get_trending_users should handle only_following parameter with NULL values'
    );

-- Test 22: get_trending_users handles only_following parameter with edge case data
SELECT
    results_eq(
        'SELECT count(*) FROM get_trending_users(10, 0, false)',
        ARRAY [1::bigint],
        'get_trending_users should handle only_following parameter with edge case data'
    );

-- Test 23: get_trending_users handles only_following parameter with invalid pagination
SELECT
    results_eq(
        'SELECT count(*) FROM get_trending_users(-1, -1, true)',
        ARRAY [1::bigint],
        'get_trending_users should handle only_following parameter with invalid pagination'
    );

SELECT
    *
FROM
    finish();

ROLLBACK;