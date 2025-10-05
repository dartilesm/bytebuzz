BEGIN;

-- Plan the tests
SELECT
    plan(20);

-- Clean up existing data
TRUNCATE users,
posts,
reactions,
user_followers,
post_media CASCADE;

-- Create test users with various searchable content
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
        'Software engineer working with JavaScript and Python programming',
        'New York, NY',
        'https://github.com/testuser',
        ARRAY ['JavaScript', 'Python', 'Docker']
    ),
    (
        'f2e7f9d3-4b5c-6e8f-0a1b-2c3d4e5f6789',
        'react_dev',
        'React Developer',
        'Frontend specialist focused on React ecosystem and modern web development',
        'Seattle, WA',
        'https://github.com/reactdev',
        ARRAY ['React', 'Next.js', 'TailwindCSS']
    );

-- Create test posts with various content
INSERT INTO
    public.posts (id, user_id, content, star_count, reply_count)
VALUES
    (
        '11111111-1111-1111-1111-111111111111',
        'd0c5340a-1b19-4762-9213-f2b9f0b8f351',
        'Just learned about React hooks! They are amazing for state management in modern applications.',
        5,
        2
    ),
    (
        '22222222-2222-2222-2222-222222222222',
        'e1d6f8c2-3a4b-5d7e-9f0a-1b2c3d4e5f67',
        'Working on a new JavaScript project with modern ES6 features and async programming.',
        3,
        1
    ),
    (
        '33333333-3333-3333-3333-333333333333',
        'f2e7f9d3-4b5c-6e8f-0a1b-2c3d4e5f6789',
        'TypeScript makes React development so much better! Type safety is crucial for large applications.',
        8,
        4
    ),
    (
        '44444444-4444-4444-4444-444444444444',
        'd0c5340a-1b19-4762-9213-f2b9f0b8f351',
        'Building a full-stack application with Node.js and React. The development process is smooth.',
        2,
        0
    ),
    (
        '55555555-5555-5555-5555-555555555555',
        'e1d6f8c2-3a4b-5d7e-9f0a-1b2c3d4e5f67',
        'Python is great for backend development and data science projects.',
        1,
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

-- Test 1: Full-text search finds users by word stemming (development -> develop)
SELECT
    results_eq(
        'SELECT count(*) FROM search_users(''development'')',
        ARRAY [1::bigint],
        'Full-text search should find users with word stemming (development -> develop)'
    );

-- Test 2: Full-text search finds users by word stemming (developing -> develop)
SELECT
    results_eq(
        'SELECT count(*) FROM search_users(''developing'')',
        ARRAY [1::bigint],
        'Full-text search should find users with word stemming (developing -> develop)'
    );

-- Test 3: Full-text search finds posts by word stemming (applications -> application)
SELECT
    results_eq(
        'SELECT count(*) FROM search_posts(''applications'')',
        ARRAY [3::bigint],
        'Full-text search should find posts with word stemming (applications -> application)'
    );

-- Test 4: Full-text search finds posts by word stemming (programming -> program)
SELECT
    results_eq(
        'SELECT count(*) FROM search_posts(''programming'')',
        ARRAY [1::bigint],
        'Full-text search should find posts with word stemming (programming -> program)'
    );

-- Test 5: Full-text search handles multiple words (React development)
SELECT
    results_eq(
        'SELECT count(*) FROM search_users(''React development'')',
        ARRAY [1::bigint],
        'Full-text search should handle multiple words (React development)'
    );

-- Test 6: Full-text search handles multiple words (JavaScript programming)
SELECT
    results_eq(
        'SELECT count(*) FROM search_posts(''JavaScript programming'')',
        ARRAY [1::bigint],
        'Full-text search should handle multiple words (JavaScript programming)'
    );

-- Test 7: Full-text search is case insensitive
SELECT
    results_eq(
        'SELECT count(*) FROM search_users(''REACT'')',
        ARRAY [1::bigint],
        'Full-text search should be case insensitive'
    );

-- Test 8: Full-text search is case insensitive for posts
SELECT
    results_eq(
        'SELECT count(*) FROM search_posts(''TYPESCRIPT'')',
        ARRAY [1::bigint],
        'Full-text search should be case insensitive for posts'
    );

-- Test 9: Partial search fallback works for users
SELECT
    results_eq(
        'SELECT count(*) FROM search_users(''dart'')',
        ARRAY [1::bigint],
        'Partial search fallback should work for users'
    );

-- Test 10: Partial search fallback works for posts
SELECT
    results_eq(
        'SELECT count(*) FROM search_posts(''hooks'')',
        ARRAY [1::bigint],
        'Partial search fallback should work for posts'
    );

-- Test 11: Search by GitHub URL works
SELECT
    results_eq(
        'SELECT count(*) FROM search_users(''github.com/dartilesm'')',
        ARRAY [1::bigint],
        'Search by GitHub URL should work'
    );

-- Test 12: Search by partial GitHub URL works
SELECT
    results_eq(
        'SELECT count(*) FROM search_users(''github.com'')',
        ARRAY [3::bigint],
        'Search by partial GitHub URL should work'
    );

-- Test 13: Search results are ranked by relevance
SELECT
    results_eq(
        'SELECT username FROM search_users(''dartilesm'', 1, 0)',
        ARRAY ['dartilesm'::text],
        'Search results should be ranked by relevance (exact match first)'
    );

-- Test 14: Search results are ranked by relevance for posts
SELECT
    results_eq(
        'SELECT content FROM search_posts(''React hooks'', 1, 0)',
        ARRAY ['Just learned about React hooks! They are amazing for state management in modern applications.'::text],
        'Search results should be ranked by relevance for posts'
    );

-- Test 15: Search handles special characters
SELECT
    results_eq(
        'SELECT count(*) FROM search_users(''@dartilesm'')',
        ARRAY [1::bigint],
        'Search should handle special characters gracefully'
    );

-- Test 16: Search handles very long search terms
SELECT
    results_eq(
        'SELECT count(*) FROM search_users(''this is a very long search term that should not match anything'')',
        ARRAY [0::bigint],
        'Search should handle very long search terms'
    );

-- Test 17: Search handles numbers
SELECT
    results_eq(
        'SELECT count(*) FROM search_users(''123'')',
        ARRAY [0::bigint],
        'Search should handle numbers'
    );

-- Test 18: Search handles mixed case with spaces
SELECT
    results_eq(
        'SELECT count(*) FROM search_users(''React Developer'')',
        ARRAY [1::bigint],
        'Search should handle mixed case with spaces'
    );

-- Test 19: Search handles mixed case with spaces for posts
SELECT
    results_eq(
        'SELECT count(*) FROM search_posts(''React Hooks'')',
        ARRAY [1::bigint],
        'Search should handle mixed case with spaces for posts'
    );

-- Test 20: Search returns empty array for non-existent terms
SELECT
    results_eq(
        'SELECT count(*) FROM search_users(''nonexistentuser'')',
        ARRAY [0::bigint],
        'Search should return empty array for non-existent terms'
    );

SELECT
    *
FROM
    finish();

ROLLBACK;