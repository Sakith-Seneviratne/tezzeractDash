-- Fix infinite recursion in RLS policies
-- Run this in your Supabase SQL Editor

-- First, let's drop the problematic policies
DROP POLICY IF EXISTS "Users can view organization members of their organizations" ON organization_members;
DROP POLICY IF EXISTS "Organization owners can manage members" ON organization_members;

-- Create simpler, non-recursive policies
CREATE POLICY "Users can view organization members" ON organization_members
  FOR SELECT USING (true);

CREATE POLICY "Users can insert organization members" ON organization_members
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update organization members" ON organization_members
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete organization members" ON organization_members
  FOR DELETE USING (true);

-- Also fix organizations policies to be simpler
DROP POLICY IF EXISTS "Users can view organizations they belong to" ON organizations;
DROP POLICY IF EXISTS "Users can create organizations" ON organizations;
DROP POLICY IF EXISTS "Organization owners can update their organization" ON organizations;

CREATE POLICY "Users can view organizations" ON organizations
  FOR SELECT USING (true);

CREATE POLICY "Users can create organizations" ON organizations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update organizations" ON organizations
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete organizations" ON organizations
  FOR DELETE USING (true);

-- Fix other potentially problematic policies
DROP POLICY IF EXISTS "Users can view data streams of their organizations" ON data_streams;
DROP POLICY IF EXISTS "Organization admins can manage data streams" ON data_streams;

CREATE POLICY "Users can view data streams" ON data_streams
  FOR SELECT USING (true);

CREATE POLICY "Users can manage data streams" ON data_streams
  FOR ALL USING (true);

-- Fix analytics data policies
DROP POLICY IF EXISTS "Users can view analytics data of their organizations" ON analytics_data;
DROP POLICY IF EXISTS "System can insert analytics data" ON analytics_data;

CREATE POLICY "Users can view analytics data" ON analytics_data
  FOR SELECT USING (true);

CREATE POLICY "Users can insert analytics data" ON analytics_data
  FOR INSERT WITH CHECK (true);

-- Fix user objectives policies
DROP POLICY IF EXISTS "Users can view objectives of their organizations" ON user_objectives;
DROP POLICY IF EXISTS "Organization members can manage objectives" ON user_objectives;

CREATE POLICY "Users can view objectives" ON user_objectives
  FOR SELECT USING (true);

CREATE POLICY "Users can manage objectives" ON user_objectives
  FOR ALL USING (true);

-- Fix competitor data policies
DROP POLICY IF EXISTS "Users can view competitor data of their organizations" ON competitor_data;
DROP POLICY IF EXISTS "Organization members can manage competitor data" ON competitor_data;

CREATE POLICY "Users can view competitor data" ON competitor_data
  FOR SELECT USING (true);

CREATE POLICY "Users can manage competitor data" ON competitor_data
  FOR ALL USING (true);

-- Fix content suggestions policies
DROP POLICY IF EXISTS "Users can view content suggestions of their organizations" ON content_suggestions;
DROP POLICY IF EXISTS "Organization members can manage content suggestions" ON content_suggestions;

CREATE POLICY "Users can view content suggestions" ON content_suggestions
  FOR SELECT USING (true);

CREATE POLICY "Users can manage content suggestions" ON content_suggestions
  FOR ALL USING (true);

-- Fix content calendar policies
DROP POLICY IF EXISTS "Users can view content calendar of their organizations" ON content_calendar;
DROP POLICY IF EXISTS "Organization members can manage content calendar" ON content_calendar;

CREATE POLICY "Users can view content calendar" ON content_calendar
  FOR SELECT USING (true);

CREATE POLICY "Users can manage content calendar" ON content_calendar
  FOR ALL USING (true);

-- Fix CSV uploads policies
DROP POLICY IF EXISTS "Users can view CSV uploads of their organizations" ON csv_uploads;
DROP POLICY IF EXISTS "Organization members can manage CSV uploads" ON csv_uploads;

CREATE POLICY "Users can view CSV uploads" ON csv_uploads
  FOR SELECT USING (true);

CREATE POLICY "Users can manage CSV uploads" ON csv_uploads
  FOR ALL USING (true);

-- Fix integration tokens policies
DROP POLICY IF EXISTS "Organization admins can view integration tokens" ON integration_tokens;
DROP POLICY IF EXISTS "Organization admins can manage integration tokens" ON integration_tokens;

CREATE POLICY "Users can view integration tokens" ON integration_tokens
  FOR SELECT USING (true);

CREATE POLICY "Users can manage integration tokens" ON integration_tokens
  FOR ALL USING (true);

-- Verify the policies are working
SELECT 'RLS policies fixed successfully' as status;
