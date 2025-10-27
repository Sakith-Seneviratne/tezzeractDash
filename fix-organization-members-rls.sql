-- Fix RLS policies for organization_members table
-- Run this in Supabase SQL Editor

-- Enable RLS on organization_members
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their own organization memberships" ON organization_members;
DROP POLICY IF EXISTS "Users can insert their own organization memberships" ON organization_members;
DROP POLICY IF EXISTS "Users can update their own organization memberships" ON organization_members;
DROP POLICY IF EXISTS "Users can delete their own organization memberships" ON organization_members;

-- Allow users to view organization memberships they're part of
CREATE POLICY "Users can view their own organization memberships"
ON organization_members FOR SELECT
USING (auth.uid() = user_id);

-- Allow users to insert themselves as organization members (when creating org)
CREATE POLICY "Users can insert their own organization memberships"
ON organization_members FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow owners/admins to update memberships
CREATE POLICY "Owners and admins can update organization memberships"
ON organization_members FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM organization_members om
    WHERE om.organization_id = organization_members.organization_id
    AND om.user_id = auth.uid()
    AND om.role IN ('owner', 'admin')
  )
);

-- Allow owners to delete memberships
CREATE POLICY "Owners can delete organization memberships"
ON organization_members FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM organization_members om
    WHERE om.organization_id = organization_members.organization_id
    AND om.user_id = auth.uid()
    AND om.role = 'owner'
  )
);

-- Also ensure users table has RLS enabled and policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view themselves" ON users;
DROP POLICY IF EXISTS "Users can insert themselves" ON users;
DROP POLICY IF EXISTS "Users can update themselves" ON users;

CREATE POLICY "Users can view themselves"
ON users FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can insert themselves"
ON users FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update themselves"
ON users FOR UPDATE
USING (auth.uid() = id);


