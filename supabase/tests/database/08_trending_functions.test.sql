BEGIN;

-- Plan the tests
SELECT
    plan(25);

-- Clean up existing data
TRUNCATE users,
posts,
reactions,
user_followers,
post_media CASCADE;

-- Create test users
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
    ),
    (
        'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d',
        'popular_user@test.com'
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
        'Software engineer working with JavaScript and Python',
        'New York, NY',
        'https://github.com/testuser',
        ARRAY ['JavaScript', 'Python', 'Docker'],
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
    ),
    (
        'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d',
        'popular_user',
        'Popular User',
        'Very popular developer with many followers',
        'Los Angeles, CA',
        'https://github.com/popular',
        ARRAY ['Vue', 'Angular', 'Svelte'],
        500
    );

-- Create recent posts (last 7 days) with high engagement
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
        'Working on a new JavaScript project with modern ES6 features.',
        8,
        3,
        2,
        1,
        NOW() - INTERVAL '1 day'
    ),
    (
        '33333333-3333-3333-3333-333333333333',
        'f2e7f9d3-4b5c-6e8f-0a1b-2c3d4e5f6789',
        'TypeScript makes React development so much better! Type safety is crucial.',
        15,
        8,
        5,
        3,
        NOW() - INTERVAL '3 days'
    ),
    (
        '44444444-4444-4444-4444-444444444444',
        'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d',
        'Building a full-stack application with Node.js and React.',
        5,
        2,
        1,
        0,
        NOW() - INTERVAL '5 days'
    );

-- Create older posts (more than 7 days) with high engagement for fallback testing
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
        '55555555-5555-5555-5555-555555555555',
        'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d',
        'This is a very popular old post with lots of engagement.',
        100,
        50,
        25,
        10,
        NOW() - INTERVAL '30 days'
    ),
    (
        '66666666-6666-6666-6666-666666666666',
        'd0c5340a-1b19-4762-9213-f2b9f0b8f351',
        'Another popular old post for fallback testing.',
        80,
        40,
        20,
        8,
        NOW() - INTERVAL '15 days'
    );

-- Create posts with low engagement (should not appear in trending)
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
        '77777777-7777-7777-7777-777777777777',
        'e1d6f8c2-3a4b-5d7e-9f0a-1b2c3d4e5f67',
        'This post has very low engagement.',
        1,
        0,
        0,
        0,
        NOW() - INTERVAL '1 day'
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

-- Test 1: get_trending_posts function exists
SELECT
    has_function(
        'public',
        'get_trending_posts',
        ARRAY ['integer', 'integer'],
        'get_trending_posts function should exist'
    );

-- Test 2: get_trending_users function exists
SELECT
    has_function(
        'public',
        'get_trending_users',
        ARRAY ['integer', 'integer'],
        'get_trending_users function should exist'
    );

-- Test 3: get_trending_posts returns recent high-engagement posts
SELECT
    results_eq(
        'SELECT count(*) FROM get_trending_posts()',
        ARRAY [4::bigint],
        'get_trending_posts should return recent high-engagement posts'
    );

-- Test 4: get_trending_users returns users with recent high-engagement posts
SELECT
    results_eq(
        'SELECT count(*) FROM get_trending_users()',
        ARRAY [3::bigint],
        'get_trending_users should return users with recent high-engagement posts'
    );

-- Test 5: get_trending_posts excludes authenticated user from results
SELECT
    results_eq(
        'SELECT count(*) FROM get_trending_users() WHERE id = ''d0c5340a-1b19-4762-9213-f2b9f0b8f351''',
        ARRAY [0::bigint],
        'get_trending_users should exclude authenticated user from results'
    );

-- Test 6: get_trending_posts respects limit parameter
SELECT
    results_eq(
        'SELECT count(*) FROM get_trending_posts(2, 0)',
        ARRAY [2::bigint],
        'get_trending_posts should respect limit parameter'
    );

-- Test 7: get_trending_users respects limit parameter
SELECT
    results_eq(
        'SELECT count(*) FROM get_trending_users(2, 0)',
        ARRAY [2::bigint],
        'get_trending_users should respect limit parameter'
    );

-- Test 8: get_trending_posts respects pagination
SELECT
    results_eq(
        'SELECT count(*) FROM get_trending_posts(2, 2)',
        ARRAY [2::bigint],
        'get_trending_posts should respect pagination'
    );

-- Test 9: get_trending_users respects pagination
SELECT
    results_eq(
        'SELECT count(*) FROM get_trending_users(2, 2)',
        ARRAY [1::bigint],
        'get_trending_users should respect pagination'
    );

-- Test 10: get_trending_posts orders by engagement score
SELECT
    results_eq(
        'SELECT engagement_score FROM get_trending_posts(1, 0)',
        ARRAY [83::integer],
        'get_trending_posts should order by engagement score (highest first)'
    );

-- Test 11: get_trending_users orders by recent engagement
SELECT
    results_eq(
        'SELECT username FROM get_trending_users(1, 0)',
        ARRAY ['react_dev'::text],
        'get_trending_users should order by recent engagement (highest first)'
    );

-- Test 12: get_trending_posts includes user information
SELECT
    results_eq(
        'SELECT count(*) FROM get_trending_posts(1, 0) WHERE "user" IS NOT NULL',
        ARRAY [1::bigint],
        'get_trending_posts should include user information as JSON'
    );

-- Test 13: get_trending_posts includes reaction information
SELECT
    results_eq(
        'SELECT count(*) FROM get_trending_posts(1, 0) WHERE reaction IS NOT NULL',
        ARRAY [1::bigint],
        'get_trending_posts should include reaction information'
    );

-- Test 14: get_trending_users includes recent activity metrics
SELECT
    results_eq(
        'SELECT count(*) FROM get_trending_users(1, 0) WHERE recent_posts_count > 0',
        ARRAY [1::bigint],
        'get_trending_users should include recent activity metrics'
    );

-- Test 15: get_trending_posts handles invalid pagination parameters
SELECT
    results_eq(
        'SELECT count(*) FROM get_trending_posts(-1, -1)',
        ARRAY [4::bigint],
        'get_trending_posts should handle invalid pagination parameters gracefully'
    );

-- Test 16: get_trending_users handles invalid pagination parameters
SELECT
    results_eq(
        'SELECT count(*) FROM get_trending_users(-1, -1)',
        ARRAY [3::bigint],
        'get_trending_users should handle invalid pagination parameters gracefully'
    );

-- Test 17: get_trending_posts handles zero limit
SELECT
    results_eq(
        'SELECT count(*) FROM get_trending_posts(0, 0)',
        ARRAY [4::bigint],
        'get_trending_posts should handle zero limit gracefully'
    );

-- Test 18: get_trending_users handles zero limit
SELECT
    results_eq(
        'SELECT count(*) FROM get_trending_users(0, 0)',
        ARRAY [3::bigint],
        'get_trending_users should handle zero limit gracefully'
    );

-- Test 19: get_trending_posts returns correct data structure
SELECT
    col_type_is(
        'public',
        'posts',
        'id',
        'uuid',
        'get_trending_posts should return posts with uuid id'
    );

-- Test 20: get_trending_users returns correct data structure
SELECT
    col_type_is(
        'public',
        'users',
        'id',
        'text',
        'get_trending_users should return users with text id'
    );

-- Test 21: get_trending_posts excludes low engagement posts
SELECT
    results_eq(
        'SELECT count(*) FROM get_trending_posts() WHERE content LIKE ''%low engagement%''',
        ARRAY [0::bigint],
        'get_trending_posts should exclude low engagement posts'
    );

-- Test 22: get_trending_posts includes only top-level posts
SELECT
    results_eq(
        'SELECT count(*) FROM get_trending_posts() WHERE parent_post_id IS NOT NULL',
        ARRAY [0::bigint],
        'get_trending_posts should include only top-level posts'
    );

-- Test 23: get_trending_users includes only users with recent posts
SELECT
    results_eq(
        'SELECT count(*) FROM get_trending_users() WHERE recent_posts_count > 0',
        ARRAY [3::bigint],
        'get_trending_users should include only users with recent posts'
    );

-- Test 24: get_trending_posts function executes without error
SELECT
    lives_ok(
        'SELECT * FROM get_trending_posts(10, 0)',
        'get_trending_posts function should execute without error'
    );

-- Test 25: get_trending_users function executes without error
SELECT
    lives_ok(
        'SELECT * FROM get_trending_users(10, 0)',
        'get_trending_users function should execute without error'
    );

SELECT
    *
FROM
    finish();

ROLLBACK;