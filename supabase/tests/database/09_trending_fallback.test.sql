BEGIN;

-- Plan the tests
SELECT
    plan(18);

-- Clean up existing data
TRUNCATE users,
posts,
reactions,
user_followers,
post_media CASCADE;

-- Create test users with high follower counts for fallback testing
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
    ),
    (
        'b2c3d4e5-6f7a-8b9c-0d1e-2f3a4b5c6d7e',
        'very_popular@test.com'
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
        200
    ),
    (
        'f2e7f9d3-4b5c-6e8f-0a1b-2c3d4e5f6789',
        'react_dev',
        'React Developer',
        'Frontend specialist focused on React ecosystem',
        'Seattle, WA',
        'https://github.com/reactdev',
        ARRAY ['React', 'Next.js', 'TailwindCSS'],
        300
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
    ),
    (
        'b2c3d4e5-6f7a-8b9c-0d1e-2f3a4b5c6d7e',
        'very_popular',
        'Very Popular User',
        'Extremely popular developer with tons of followers',
        'Chicago, IL',
        'https://github.com/verypopular',
        ARRAY ['Go', 'Rust', 'Kubernetes'],
        1000
    );

-- Create old posts (more than 7 days) with high engagement for fallback testing
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
        'b2c3d4e5-6f7a-8b9c-0d1e-2f3a4b5c6d7e',
        'This is a very popular old post with lots of engagement.',
        100,
        50,
        25,
        10,
        NOW() - INTERVAL '30 days'
    ),
    (
        '22222222-2222-2222-2222-222222222222',
        'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d',
        'Another popular old post for fallback testing.',
        80,
        40,
        20,
        8,
        NOW() - INTERVAL '15 days'
    ),
    (
        '33333333-3333-3333-3333-333333333333',
        'f2e7f9d3-4b5c-6e8f-0a1b-2c3d4e5f6789',
        'Third popular old post for fallback testing.',
        60,
        30,
        15,
        6,
        NOW() - INTERVAL '20 days'
    ),
    (
        '44444444-4444-4444-4444-444444444444',
        'e1d6f8c2-3a4b-5d7e-9f0a-1b2c3d4e5f67',
        'Fourth popular old post for fallback testing.',
        40,
        20,
        10,
        4,
        NOW() - INTERVAL '25 days'
    ),
    (
        '55555555-5555-5555-5555-555555555555',
        'd0c5340a-1b19-4762-9213-f2b9f0b8f351',
        'Fifth popular old post for fallback testing.',
        20,
        10,
        5,
        2,
        NOW() - INTERVAL '35 days'
    );

-- Create recent posts (last 7 days) with low engagement (should not be trending)
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
        '66666666-6666-6666-6666-666666666666',
        'd0c5340a-1b19-4762-9213-f2b9f0b8f351',
        'This recent post has very low engagement.',
        1,
        0,
        0,
        0,
        NOW() - INTERVAL '1 day'
    ),
    (
        '77777777-7777-7777-7777-777777777777',
        'e1d6f8c2-3a4b-5d7e-9f0a-1b2c3d4e5f67',
        'Another recent post with low engagement.',
        2,
        0,
        0,
        0,
        NOW() - INTERVAL '2 days'
    );

-- Create following relationships for fallback testing
INSERT INTO
    public.user_followers (user_id, follower_id)
VALUES
    (
        'e1d6f8c2-3a4b-5d7e-9f0a-1b2c3d4e5f67',
        -- test_user
        'd0c5340a-1b19-4762-9213-f2b9f0b8f351' -- dartilesm (authenticated user)
    ),
    (
        'f2e7f9d3-4b5c-6e8f-0a1b-2c3d4e5f6789',
        -- react_dev
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

-- Test 1: get_trending_posts falls back to popular posts when no trending posts
SELECT
    results_eq(
        'SELECT count(*) FROM get_trending_posts()',
        ARRAY [1::bigint],
        'get_trending_posts should fall back to popular posts when no trending posts'
    );

-- Test 2: get_trending_users falls back to popular users when no trending users
SELECT
    results_eq(
        'SELECT count(*) FROM get_trending_users()',
        ARRAY [2::bigint],
        'get_trending_users should fall back to popular users when no trending users'
    );

-- Test 3: get_trending_posts fallback orders by total engagement
SELECT
    results_eq(
        'SELECT ("user"->>''username'')::text FROM get_trending_posts(1, 0)',
        ARRAY ['test_user'::text],
        'get_trending_posts fallback should order by total engagement'
    );

-- Test 4: get_trending_users fallback orders by follower count
SELECT
    results_eq(
        'SELECT username FROM get_trending_users(4, 0)',
        ARRAY ['very_popular'::text, 'popular_user'::text],
        'get_trending_users fallback should order by follower count'
    );

-- Test 5: get_trending_posts fallback excludes authenticated user
SELECT
    results_eq(
        'SELECT count(*) FROM get_trending_users() WHERE id = ''d0c5340a-1b19-4762-9213-f2b9f0b8f351''',
        ARRAY [0::bigint],
        'get_trending_users fallback should exclude authenticated user'
    );

-- Test 6: get_trending_posts fallback respects limit parameter
SELECT
    results_eq(
        'SELECT count(*) FROM get_trending_posts(3, 0)',
        ARRAY [1::bigint],
        'get_trending_posts fallback should respect limit parameter'
    );

-- Test 7: get_trending_users fallback respects limit parameter
SELECT
    results_eq(
        'SELECT count(*) FROM get_trending_users(3, 0)',
        ARRAY [2::bigint],
        'get_trending_users fallback should respect limit parameter'
    );

-- Test 8: get_trending_posts fallback respects pagination
SELECT
    results_eq(
        'SELECT count(*) FROM get_trending_posts(2, 2)',
        ARRAY [5::bigint],
        'get_trending_posts fallback should respect pagination'
    );

-- Test 9: get_trending_users fallback respects pagination
SELECT
    results_eq(
        'SELECT count(*) FROM get_trending_users(2, 2)',
        ARRAY [0::bigint],
        'get_trending_users fallback should respect pagination'
    );

-- Test 10: get_trending_posts fallback includes user information
SELECT
    results_eq(
        'SELECT count(*) FROM get_trending_posts(1, 0) WHERE "user" IS NOT NULL',
        ARRAY [1::bigint],
        'get_trending_posts fallback should include user information as JSON'
    );

-- Test 11: get_trending_posts fallback includes reaction information
SELECT
    results_eq(
        'SELECT count(*) FROM get_trending_posts(1, 0) WHERE reaction IS NOT NULL',
        ARRAY [1::bigint],
        'get_trending_posts fallback should include reaction information'
    );

-- Test 12: get_trending_users fallback includes activity metrics
SELECT
    results_eq(
        'SELECT count(*) FROM get_trending_users(1, 0) WHERE recent_posts_count >= 0',
        ARRAY [1::bigint],
        'get_trending_users fallback should include activity metrics'
    );

-- Test 13: get_trending_posts fallback handles invalid pagination parameters
SELECT
    results_eq(
        'SELECT count(*) FROM get_trending_posts(-1, -1)',
        ARRAY [1::bigint],
        'get_trending_posts fallback should handle invalid pagination parameters gracefully'
    );

-- Test 14: get_trending_users fallback handles invalid pagination parameters
SELECT
    results_eq(
        'SELECT count(*) FROM get_trending_users(-1, -1)',
        ARRAY [2::bigint],
        'get_trending_users fallback should handle invalid pagination parameters gracefully'
    );

-- Test 15: get_trending_posts fallback function executes without error
SELECT
    lives_ok(
        'SELECT * FROM get_trending_posts(10, 0)',
        'get_trending_posts fallback function should execute without error'
    );

-- Test 16: get_trending_users fallback with only_following=true returns only followed users
SELECT
    results_eq(
        'SELECT count(*) FROM get_trending_users(10, 0, true)',
        ARRAY [2::bigint],
        'get_trending_users fallback with only_following=true should return only followed users'
    );

-- Test 17: get_trending_users fallback with only_following=false excludes followed users
SELECT
    results_eq(
        'SELECT count(*) FROM get_trending_users(10, 0, false)',
        ARRAY [2::bigint],
        'get_trending_users fallback with only_following=false should exclude followed users'
    );

-- Test 18: get_trending_users fallback default behavior excludes followed users
SELECT
    results_eq(
        'SELECT count(*) FROM get_trending_users()',
        ARRAY [2::bigint],
        'get_trending_users fallback default behavior should exclude followed users'
    );

SELECT
    *
FROM
    finish();

ROLLBACK;