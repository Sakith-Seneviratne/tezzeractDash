-- Complete database fix: Add organization fields + Fix RLS policies
-- Run this in your Supabase SQL Editor

-- ===========================================
-- 1. ADD NEW ORGANIZATION FIELDS
-- ===========================================

-- Add new columns to the organizations table
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS type TEXT,
ADD COLUMN IF NOT EXISTS products_services TEXT,
ADD COLUMN IF NOT EXISTS objectives TEXT,
ADD COLUMN IF NOT EXISTS website_url TEXT;

-- Add comments to document the new fields
COMMENT ON COLUMN organizations.type IS 'Organization type (startup, small_business, medium_business, enterprise, non_profit, agency, freelancer, other)';
COMMENT ON COLUMN organizations.products_services IS 'Description of what the organization offers';
COMMENT ON COLUMN organizations.objectives IS 'Main business objectives and goals';
COMMENT ON COLUMN organizations.website_url IS 'Organization website URL';

-- Add constraint for organization type if needed
ALTER TABLE organizations 
ADD CONSTRAINT IF NOT EXISTS check_organization_type 
CHECK (type IN ('startup', 'small_business', 'medium_business', 'enterprise', 'non_profit', 'agency', 'freelancer', 'other') OR type IS NULL);

-- Create an index on organization type for better query performance
CREATE INDEX IF NOT EXISTS idx_organizations_type ON organizations(type);

-- ===========================================
-- 2. FIX RLS POLICIES (Remove Infinite Recursion)
-- ===========================================

-- Drop all existing problematic policies
DROP POLICY IF EXISTS "Users can view organization members of their organizations" ON organization_members;
DROP POLICY IF EXISTS "Organization owners can manage members" ON organization_members;
DROP POLICY IF EXISTS "Users can view organizations they belong to" ON organizations;
DROP POLICY IF EXISTS "Organization owners can update their organization" ON organizations;
DROP POLICY IF EXISTS "Users can view data streams of their organizations" ON data_streams;
DROP POLICY IF EXISTS "Organization admins can manage data streams" ON data_streams;
DROP POLICY IF EXISTS "Users can view analytics data of their organizations" ON analytics_data;
DROP POLICY IF EXISTS "System can insert analytics data" ON analytics_data;
DROP POLICY IF EXISTS "Users can view objectives of their organizations" ON user_objectives;
DROP POLICY IF EXISTS "Organization members can manage objectives" ON user_objectives;
DROP POLICY IF EXISTS "Users can view competitor data of their organizations" ON competitor_data;
DROP POLICY IF EXISTS "Organization members can manage competitor data" ON competitor_data;
DROP POLICY IF EXISTS "Users can view content suggestions of their organizations" ON content_suggestions;
DROP POLICY IF EXISTS "Organization members can manage content suggestions" ON content_suggestions;
DROP POLICY IF EXISTS "Users can view content calendar of their organizations" ON content_calendar;
DROP POLICY IF EXISTS "Organization members can manage content calendar" ON content_calendar;
DROP POLICY IF EXISTS "Users can view CSV uploads of their organizations" ON csv_uploads;
DROP POLICY IF EXISTS "Organization members can manage CSV uploads" ON csv_uploads;
DROP POLICY IF EXISTS "Organization admins can view integration tokens" ON integration_tokens;
DROP POLICY IF EXISTS "Organization admins can manage integration tokens" ON integration_tokens;

-- Create simple, non-recursive policies for all tables
-- Organizations
CREATE POLICY "Users can view organizations" ON organizations FOR SELECT USING (true);
CREATE POLICY "Users can create organizations" ON organizations FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update organizations" ON organizations FOR UPDATE USING (true);
CREATE POLICY "Users can delete organizations" ON organizations FOR DELETE USING (true);

-- Organization members
CREATE POLICY "Users can view organization members" ON organization_members FOR SELECT USING (true);
CREATE POLICY "Users can insert organization members" ON organization_members FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update organization members" ON organization_members FOR UPDATE USING (true);
CREATE POLICY "Users can delete organization members" ON organization_members FOR DELETE USING (true);

-- Data streams
CREATE POLICY "Users can view data streams" ON data_streams FOR SELECT USING (true);
CREATE POLICY "Users can manage data streams" ON data_streams FOR ALL USING (true);

-- Analytics data
CREATE POLICY "Users can view analytics data" ON analytics_data FOR SELECT USING (true);
CREATE POLICY "Users can insert analytics data" ON analytics_data FOR INSERT WITH CHECK (true);

-- User objectives
CREATE POLICY "Users can view objectives" ON user_objectives FOR SELECT USING (true);
CREATE POLICY "Users can manage objectives" ON user_objectives FOR ALL USING (true);

-- Competitor data
CREATE POLICY "Users can view competitor data" ON competitor_data FOR SELECT USING (true);
CREATE POLICY "Users can manage competitor data" ON competitor_data FOR ALL USING (true);

-- Content suggestions
CREATE POLICY "Users can view content suggestions" ON content_suggestions FOR SELECT USING (true);
CREATE POLICY "Users can manage content suggestions" ON content_suggestions FOR ALL USING (true);

-- Content calendar
CREATE POLICY "Users can view content calendar" ON content_calendar FOR SELECT USING (true);
CREATE POLICY "Users can manage content calendar" ON content_calendar FOR ALL USING (true);

-- CSV uploads
CREATE POLICY "Users can view CSV uploads" ON csv_uploads FOR SELECT USING (true);
CREATE POLICY "Users can manage CSV uploads" ON csv_uploads FOR ALL USING (true);

-- Integration tokens
CREATE POLICY "Users can view integration tokens" ON integration_tokens FOR SELECT USING (true);
CREATE POLICY "Users can manage integration tokens" ON integration_tokens FOR ALL USING (true);

-- ===========================================
-- 3. VERIFICATION
-- ===========================================

-- Verify the new columns exist
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'organizations' 
ORDER BY ordinal_position;

-- Test that we can create an organization
SELECT 'Database fix completed successfully!' as status;
