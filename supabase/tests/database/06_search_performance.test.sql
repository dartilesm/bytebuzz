BEGIN;

-- Plan the tests
SELECT
    plan(10);

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
    );

-- Create multiple test posts for performance testing
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
        'd0c5340a-1b19-4762-9213-f2b9f0b8f351',
        'Working on a new JavaScript project with modern ES6 features.',
        3,
        1
    ),
    (
        '33333333-3333-3333-3333-333333333333',
        'd0c5340a-1b19-4762-9213-f2b9f0b8f351',
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
    ),
    (
        '55555555-5555-5555-5555-555555555555',
        'd0c5340a-1b19-4762-9213-f2b9f0b8f351',
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

-- Test 1: search_users function executes without error
SELECT
    lives_ok(
        'SELECT * FROM search_users(''dartilesm'', 10, 0)',
        'search_users function should execute without error'
    );

-- Test 2: search_posts function executes without error
SELECT
    lives_ok(
        'SELECT * FROM search_posts(''React'', 10, 0)',
        'search_posts function should execute without error'
    );

-- Test 3: search_users with pagination executes without error
SELECT
    lives_ok(
        'SELECT * FROM search_users(''dev'', 5, 0)',
        'search_users with pagination should execute without error'
    );

-- Test 4: search_posts with pagination executes without error
SELECT
    lives_ok(
        'SELECT * FROM search_posts(''JavaScript'', 5, 0)',
        'search_posts with pagination should execute without error'
    );

-- Test 5: search_users with large limit executes without error
SELECT
    lives_ok(
        'SELECT * FROM search_users(''dev'', 100, 0)',
        'search_users with large limit should execute without error'
    );

-- Test 6: search_posts with large limit executes without error
SELECT
    lives_ok(
        'SELECT * FROM search_posts(''development'', 100, 0)',
        'search_posts with large limit should execute without error'
    );

-- Test 7: search_users with large offset executes without error
SELECT
    lives_ok(
        'SELECT * FROM search_users(''dev'', 10, 100)',
        'search_users with large offset should execute without error'
    );

-- Test 8: search_posts with large offset executes without error
SELECT
    lives_ok(
        'SELECT * FROM search_posts(''development'', 10, 100)',
        'search_posts with large offset should execute without error'
    );

-- Test 9: search_users returns correct data types
SELECT
    col_type_is(
        'public',
        'search_users',
        'id',
        'text',
        'search_users should return id as text'
    );

-- Test 10: search_posts returns correct data types
SELECT
    col_type_is(
        'public',
        'search_posts',
        'id',
        'uuid',
        'search_posts should return id as uuid'
    );

SELECT
    *
FROM
    finish();

ROLLBACK;