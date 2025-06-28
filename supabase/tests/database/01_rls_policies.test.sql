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
    ),
    (
        'e1d6f8c2-3a4b-5d7e-9f0a-1b2c3d4e5f67',
        'test_user@test.com'
    );

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

-- Set up test environment
SET
    client_min_messages TO warning;

SET
    ROLE authenticated;

-- Test as first user
SET
    LOCAL request.jwt.claim.sub TO 'd0c5340a-1b19-4762-9213-f2b9f0b8f351';

SET
    LOCAL request.jwt.claims TO '{"sub": "d0c5340a-1b19-4762-9213-f2b9f0b8f351", "role": "authenticated"}';

-- Test post creation
SELECT
    lives_ok(
        'INSERT INTO posts (id, user_id, content) VALUES (''11111111-1111-1111-1111-111111111111'', auth.uid(), ''Test post by first user'')',
        'Authenticated user can create their own post'
    );

-- Test post media creation
SELECT
    lives_ok(
        'INSERT INTO post_media (id, post_id, media_type, file_url, file_path) VALUES (''22222222-2222-2222-2222-222222222222'', ''11111111-1111-1111-1111-111111111111'', ''image'', ''https://example.com/image.jpg'', ''public/image.jpg'')',
        'Authenticated user can add media to their own post'
    );

-- Test reaction creation
SELECT
    lives_ok(
        'INSERT INTO reactions (id, user_id, post_id, reaction_type) VALUES (''33333333-3333-3333-3333-333333333333'', auth.uid(), ''11111111-1111-1111-1111-111111111111'', ''star'')',
        'Authenticated user can create their own reaction'
    );

-- Test following another user
SELECT
    lives_ok(
        'INSERT INTO user_followers (user_id, follower_id) VALUES (''e1d6f8c2-3a4b-5d7e-9f0a-1b2c3d4e5f67'', auth.uid())',
        'Authenticated user can follow another user'
    );

-- Switch to second user
SET
    LOCAL request.jwt.claim.sub TO 'e1d6f8c2-3a4b-5d7e-9f0a-1b2c3d4e5f67';

SET
    LOCAL request.jwt.claims TO '{"sub": "e1d6f8c2-3a4b-5d7e-9f0a-1b2c3d4e5f67", "role": "authenticated"}';

-- Test posts access
SELECT
    results_eq(
        'SELECT count(*) FROM posts',
        ARRAY [1::bigint],
        'All users can read posts'
    );

-- Test post media access
SELECT
    results_eq(
        'SELECT count(*) FROM post_media',
        ARRAY [1::bigint],
        'All users can read post media'
    );

-- Test reactions access
SELECT
    results_eq(
        'SELECT count(*) FROM reactions',
        ARRAY [1::bigint],
        'All users can read reactions'
    );

-- Test user_followers access
SELECT
    results_eq(
        'SELECT count(*) FROM user_followers',
        ARRAY [1::bigint],
        'All users can read followers'
    );

-- Test unauthorized post creation
SELECT
    throws_ok(
        'INSERT INTO posts (id, user_id, content) VALUES (''44444444-4444-4444-4444-444444444444'', ''d0c5340a-1b19-4762-9213-f2b9f0b8f351'', ''Malicious post'')',
        '42501',
        'new row violates row-level security policy for table "posts"',
        'User cannot create post for another user'
    );

-- Test unauthorized post media creation
SELECT
    throws_ok(
        'INSERT INTO post_media (id, post_id, media_type, file_url, file_path) VALUES (''55555555-5555-5555-5555-555555555555'', ''11111111-1111-1111-1111-111111111111'', ''image'', ''https://example.com/hack.jpg'', ''public/hack.jpg'')',
        '42501',
        'new row violates row-level security policy for table "post_media"',
        'User cannot add media to another users post'
    );

-- -- Test unauthorized reaction modification
-- SELECT
--     throws_ok(
--         'UPDATE reactions SET reaction_type = ''coffee'' WHERE id = ''33333333-3333-3333-3333-333333333333''',
--         '42501',
--         'new row violates row-level security policy for table "reactions"',
--         'User cannot modify another users reaction'
--     );
-- -- Test unauthorized post update
-- SELECT
--     throws_ok(
--         'UPDATE posts SET content = ''Hacked!'' WHERE id = ''11111111-1111-1111-1111-111111111111''',
--         '42501',
--         'new row violates row-level security policy for table "posts"',
--         'User cannot update another users post'
--     );
-- -- Test unauthorized post media update
-- SELECT
--     throws_ok(
--         'UPDATE post_media SET file_url = ''https://example.com/hacked.jpg'' WHERE id = ''22222222-2222-2222-2222-222222222222''',
--         '42501',
--         'new row violates row-level security policy for table "post_media"',
--         'User cannot update another users post media'
--     );
SELECT
    *
FROM
    finish();

ROLLBACK;