BEGIN;

-- Plan the tests
SELECT
    plan(10);

-- Clean up existing data
TRUNCATE TABLE public.user_followers CASCADE;

TRUNCATE TABLE public.reactions CASCADE;

TRUNCATE TABLE public.posts CASCADE;

TRUNCATE TABLE public.users CASCADE;

TRUNCATE TABLE auth.users CASCADE;

-- Test RLS is enabled
SELECT
    has_table_privilege('anon', 'users', 'SELECT') IS FALSE,
    'anon cannot select from users by default';

SELECT
    has_table_privilege('authenticated', 'users', 'SELECT') IS FALSE,
    'authenticated cannot select from users by default';

-- Setup test users
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

-- Setup public users
INSERT INTO
    public.users (id, username, display_name)
VALUES
    (
        'd0c5340a-1b19-4762-9213-f2b9f0b8f351',
        'dartilesm',
        'Diego Artiles'
    ),
    (
        'e1d6f8c2-3a4b-5d7e-9f0a-1b2c3d4e5f67',
        'test_user',
        'Test User'
    );

-- Set role and user context for first user
SET
    ROLE authenticated;

SET
    LOCAL request.jwt.claim.sub TO 'd0c5340a-1b19-4762-9213-f2b9f0b8f351';

SET
    LOCAL request.jwt.claims TO '{"sub": "d0c5340a-1b19-4762-9213-f2b9f0b8f351", "role": "authenticated"}';

-- Insert test data as first user
INSERT INTO
    posts (id, user_id, content)
VALUES
    (
        '11111111-1111-1111-1111-111111111111',
        auth.uid() :: text,
        'Test post 1'
    ),
    (
        '22222222-2222-2222-2222-222222222222',
        auth.uid() :: text,
        'Test post 2'
    ),
    (
        '33333333-3333-3333-3333-333333333333',
        auth.uid() :: text,
        'Test post 3'
    );

-- Switch to second user
SET
    LOCAL request.jwt.claim.sub TO 'e1d6f8c2-3a4b-5d7e-9f0a-1b2c3d4e5f67';

SET
    LOCAL request.jwt.claims TO '{"sub": "e1d6f8c2-3a4b-5d7e-9f0a-1b2c3d4e5f67", "role": "authenticated"}';

-- Insert test data as second user
INSERT INTO
    posts (id, user_id, content)
VALUES
    (
        '44444444-4444-4444-4444-444444444444',
        auth.uid() :: text,
        'Test post 4'
    );

-- Insert reactions
INSERT INTO
    reactions (id, user_id, post_id, reaction_type)
VALUES
    (
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        auth.uid() :: text,
        '11111111-1111-1111-1111-111111111111',
        'star'
    );

-- Switch back to first user
SET
    LOCAL request.jwt.claim.sub TO 'd0c5340a-1b19-4762-9213-f2b9f0b8f351';

SET
    LOCAL request.jwt.claims TO '{"sub": "d0c5340a-1b19-4762-9213-f2b9f0b8f351", "role": "authenticated"}';

INSERT INTO
    reactions (id, user_id, post_id, reaction_type)
VALUES
    (
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        auth.uid() :: text,
        '44444444-4444-4444-4444-444444444444',
        'star'
    );

-- Insert follower relationship
INSERT INTO
    user_followers (user_id, follower_id)
VALUES
    (
        'e1d6f8c2-3a4b-5d7e-9f0a-1b2c3d4e5f67',
        auth.uid() :: text
    );

-- Test posts access
SELECT
    results_eq(
        'SELECT COUNT(*) FROM posts WHERE user_id = ''d0c5340a-1b19-4762-9213-f2b9f0b8f351''',
        ARRAY [3::bigint],
        'User should see their own 3 posts'
    );

-- Test reactions access
SELECT
    results_eq(
        'SELECT COUNT(*) FROM reactions WHERE user_id = ''d0c5340a-1b19-4762-9213-f2b9f0b8f351''',
        ARRAY [1::bigint],
        'User should see their own 1 reaction'
    );

-- Test user_followers access
SELECT
    results_eq(
        'SELECT COUNT(*) FROM user_followers WHERE follower_id = ''d0c5340a-1b19-4762-9213-f2b9f0b8f351''',
        ARRAY [1::bigint],
        'User should see their own following relationship'
    );

-- Test as second user
SET
    LOCAL request.jwt.claim.sub TO 'e1d6f8c2-3a4b-5d7e-9f0a-1b2c3d4e5f67';

SET
    LOCAL request.jwt.claims TO '{"sub": "e1d6f8c2-3a4b-5d7e-9f0a-1b2c3d4e5f67", "role": "authenticated"}';

-- Test posts access
SELECT
    results_eq(
        'SELECT COUNT(*) FROM posts WHERE user_id = ''e1d6f8c2-3a4b-5d7e-9f0a-1b2c3d4e5f67''',
        ARRAY [1::bigint],
        'User should see their own 1 post'
    );

-- Test reactions access
SELECT
    results_eq(
        'SELECT COUNT(*) FROM reactions WHERE user_id = ''e1d6f8c2-3a4b-5d7e-9f0a-1b2c3d4e5f67''',
        ARRAY [1::bigint],
        'User should see their own 1 reaction'
    );

-- Test user_followers access
SELECT
    results_eq(
        'SELECT COUNT(*) FROM user_followers WHERE user_id = ''e1d6f8c2-3a4b-5d7e-9f0a-1b2c3d4e5f67''',
        ARRAY [1::bigint],
        'User should see who follows them'
    );

-- Test post creation
SELECT
    lives_ok(
        'INSERT INTO posts (id, user_id, content) VALUES (''55555555-5555-5555-5555-555555555555'', auth.uid()::text, ''Test post'')',
        'Authenticated user can create their own post'
    );

-- Test reaction creation
SELECT
    lives_ok(
        'INSERT INTO reactions (id, user_id, post_id, reaction_type) VALUES (''cccccccc-cccc-cccc-cccc-cccccccccccc'', auth.uid()::text, ''22222222-2222-2222-2222-222222222222'', ''star'')',
        'Authenticated user can create their own reaction'
    );

-- Test user_followers creation
SELECT
    lives_ok(
        'INSERT INTO user_followers (user_id, follower_id) VALUES (''d0c5340a-1b19-4762-9213-f2b9f0b8f351'', auth.uid()::text)',
        'Authenticated user can follow another user'
    );

-- Test unauthorized access
SELECT
    throws_ok(
        'INSERT INTO posts (id, user_id, content) VALUES (''66666666-6666-6666-6666-666666666666'', ''d0c5340a-1b19-4762-9213-f2b9f0b8f351'', ''Test post'')',
        '42501',
        'new row violates row-level security policy for table "posts"',
        'User cannot create post for another user'
    );

-- -- Test unauthorized update access
-- SELECT
--     throws_ok(
--         'UPDATE posts SET content = ''Hacked!'' WHERE id = ''11111111-1111-1111-1111-111111111111'' AND user_id = ''d0c5340a-1b19-4762-9213-f2b9f0b8f351''',
--         '42501',
--         'new row violates row-level security policy for table "posts"',
--         'User cannot update another users post'
--     );
-- Test unauthorized delete access
-- SELECT
--     throws_ok(
--         'DELETE FROM posts WHERE id = ''11111111-1111-1111-1111-111111111111''',
--         '42501',
--         'new row violates row-level security policy for table "posts"',
--         'User cannot delete another users post'
--     );
SELECT
    *
FROM
    finish();

ROLLBACK;