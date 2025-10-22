-- ⚠️ WARNING: This will DELETE ALL USERS from your database
-- Only use this in DEVELOPMENT for testing purposes!
-- 
-- This script:
-- 1. Deletes all users from public.users table
-- 2. Deletes all users from auth.users table (Supabase Auth)
-- 3. Cleans up any related data

-- Step 1: Delete from public.users first
-- (This table references auth.users with CASCADE, so it should be deleted first)
DELETE FROM public.users;

-- Step 2: Delete from auth.users (Supabase Auth)
-- This will also cascade delete from public.users if there are any left
DELETE FROM auth.users;

-- Verify deletion
SELECT 
  (SELECT COUNT(*) FROM auth.users) as auth_users,
  (SELECT COUNT(*) FROM public.users) as public_users;

-- You should see:
-- auth_users: 0
-- public_users: 0

