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
        'f2e7g9d3-4b5c-6e8f-0a1b-2c3d4e5f6789',
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
        top_technologies
    )
VALUES
    (
        'd0c5340a-1b19-4762-9213-f2b9f0b8f351',
        'dartilesm',
        'Diego Artiles',
        'Full-stack developer passionate about React and TypeScript',
        'San Francisco, CA',
        'https://github.com/dartilesm',
        ARRAY ['React', 'TypeScript', 'Node.js']
    ),
    (
        'e1d6f8c2-3a4b-5d7e-9f0a-1b2c3d4e5f67',
        'test_user',
        'Test User',
        'Software engineer working with JavaScript and Python',
        'New York, NY',
        'https://github.com/testuser',
        ARRAY ['JavaScript', 'Python', 'Docker']
    ),
    (
        'f2e7g9d3-4b5c-6e8f-0a1b-2c3d4e5f6789',
        'react_dev',
        'React Developer',
        'Frontend specialist focused on React ecosystem',
        'Seattle, WA',
        'https://github.com/reactdev',
        ARRAY ['React', 'Next.js', 'TailwindCSS']
    );

-- Create test posts
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
        'Working on a new JavaScript project with modern ES6 features.',
        3,
        1
    ),
    (
        '33333333-3333-3333-3333-333333333333',
        'f2e7g9d3-4b5c-6e8f-0a1b-2c3d4e5f6789',
        'TypeScript makes React development so much better! Type safety is crucial.',
        8,
        4
    ),
    (
        '44444444-4444-4444-4444-444444444444',
        'd0c5340a-1b19-4762-9213-f2b9f0b8f351',
        'Building a full-stack application with Node.js and React.',
        2,
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

-- Test 1: search_users function exists
SELECT
    has_function(
        'public',
        'search_users',
        ARRAY ['text', 'integer', 'integer'],
        'search_users function should exist'
    );

-- Test 2: search_posts function exists
SELECT
    has_function(
        'public',
        'search_posts',
        ARRAY ['text', 'integer', 'integer'],
        'search_posts function should exist'
    );

-- Test 3: search_users returns empty array for empty search term
SELECT
    results_eq(
        'SELECT count(*) FROM search_users('''')',
        ARRAY [0::bigint],
        'search_users should return empty array for empty search term'
    );

-- Test 4: search_posts returns empty array for empty search term
SELECT
    results_eq(
        'SELECT count(*) FROM search_posts('''')',
        ARRAY [0::bigint],
        'search_posts should return empty array for empty search term'
    );

-- Test 5: search_users returns empty array for null search term
SELECT
    results_eq(
        'SELECT count(*) FROM search_users(NULL)',
        ARRAY [0::bigint],
        'search_users should return empty array for null search term'
    );

-- Test 6: search_posts returns empty array for null search term
SELECT
    results_eq(
        'SELECT count(*) FROM search_posts(NULL)',
        ARRAY [0::bigint],
        'search_posts should return empty array for null search term'
    );

-- Test 7: search_users finds users by username
SELECT
    results_eq(
        'SELECT count(*) FROM search_users(''dartilesm'')',
        ARRAY [1::bigint],
        'search_users should find user by exact username'
    );

-- Test 8: search_users finds users by partial username
SELECT
    results_eq(
        'SELECT count(*) FROM search_users(''dart'')',
        ARRAY [1::bigint],
        'search_users should find user by partial username'
    );

-- Test 9: search_users finds users by display name
SELECT
    results_eq(
        'SELECT count(*) FROM search_users(''Diego'')',
        ARRAY [1::bigint],
        'search_users should find user by display name'
    );

-- Test 10: search_users finds users by github_url
SELECT
    results_eq(
        'SELECT count(*) FROM search_users(''github.com/dartilesm'')',
        ARRAY [1::bigint],
        'search_users should find user by github_url'
    );

-- Test 11: search_users finds multiple users with React in technologies
SELECT
    results_eq(
        'SELECT count(*) FROM search_users(''React'')',
        ARRAY [2::bigint],
        'search_users should find multiple users with React in technologies'
    );

-- Test 12: search_posts finds posts by content
SELECT
    results_eq(
        'SELECT count(*) FROM search_posts(''React hooks'')',
        ARRAY [1::bigint],
        'search_posts should find post by content'
    );

-- Test 13: search_posts finds posts by author username
SELECT
    results_eq(
        'SELECT count(*) FROM search_posts(''dartilesm'')',
        ARRAY [2::bigint],
        'search_posts should find posts by author username'
    );

-- Test 14: search_posts finds posts by author display name
SELECT
    results_eq(
        'SELECT count(*) FROM search_posts(''React Developer'')',
        ARRAY [1::bigint],
        'search_posts should find posts by author display name'
    );

-- Test 15: search_posts finds posts with TypeScript content
SELECT
    results_eq(
        'SELECT count(*) FROM search_posts(''TypeScript'')',
        ARRAY [1::bigint],
        'search_posts should find posts with TypeScript content'
    );

-- Test 16: search_users pagination - first page
SELECT
    results_eq(
        'SELECT count(*) FROM search_users(''dev'', 2, 0)',
        ARRAY [2::bigint],
        'search_users pagination should return 2 results for first page'
    );

-- Test 17: search_users pagination - second page
SELECT
    results_eq(
        'SELECT count(*) FROM search_users(''dev'', 2, 2)',
        ARRAY [1::bigint],
        'search_users pagination should return 1 result for second page'
    );

-- Test 18: search_posts pagination - first page
SELECT
    results_eq(
        'SELECT count(*) FROM search_posts(''React'', 2, 0)',
        ARRAY [2::bigint],
        'search_posts pagination should return 2 results for first page'
    );

-- Test 19: search_posts pagination - second page
SELECT
    results_eq(
        'SELECT count(*) FROM search_posts(''React'', 2, 2)',
        ARRAY [1::bigint],
        'search_posts pagination should return 1 result for second page'
    );

-- Test 20: search_users returns correct user data structure
SELECT
    has_column(
        'public',
        'search_users',
        'id',
        'search_users should return id column'
    );

SELECT
    has_column(
        'public',
        'search_users',
        'username',
        'search_users should return username column'
    );

SELECT
    has_column(
        'public',
        'search_users',
        'rank',
        'search_users should return rank column'
    );

-- Test 21: search_posts returns correct post data structure
SELECT
    has_column(
        'public',
        'search_posts',
        'id',
        'search_posts should return id column'
    );

SELECT
    has_column(
        'public',
        'search_posts',
        'content',
        'search_posts should return content column'
    );

SELECT
    has_column(
        'public',
        'search_posts',
        'user',
        'search_posts should return user column'
    );

SELECT
    has_column(
        'public',
        'search_posts',
        'rank',
        'search_posts should return rank column'
    );

-- Test 22: search_users respects limit parameter
SELECT
    results_eq(
        'SELECT count(*) FROM search_users(''dev'', 1, 0)',
        ARRAY [1::bigint],
        'search_users should respect limit parameter'
    );

-- Test 23: search_posts respects limit parameter
SELECT
    results_eq(
        'SELECT count(*) FROM search_posts(''React'', 1, 0)',
        ARRAY [1::bigint],
        'search_posts should respect limit parameter'
    );

-- Test 24: search_users handles invalid pagination parameters
SELECT
    results_eq(
        'SELECT count(*) FROM search_users(''dev'', -1, -1)',
        ARRAY [3::bigint],
        'search_users should handle invalid pagination parameters gracefully'
    );

-- Test 25: search_posts handles invalid pagination parameters
SELECT
    results_eq(
        'SELECT count(*) FROM search_posts(''React'', -1, -1)',
        ARRAY [3::bigint],
        'search_posts should handle invalid pagination parameters gracefully'
    );

SELECT
    *
FROM
    finish();

ROLLBACK;