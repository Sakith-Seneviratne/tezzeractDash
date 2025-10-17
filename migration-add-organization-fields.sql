-- Migration: Add new organization fields
-- Run this in your Supabase SQL editor or psql

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
ADD CONSTRAINT check_organization_type 
CHECK (type IN ('startup', 'small_business', 'medium_business', 'enterprise', 'non_profit', 'agency', 'freelancer', 'other') OR type IS NULL);

-- Update the RLS policies to include the new fields (they should already work with existing policies)
-- The existing policies will automatically include the new columns

-- Create an index on organization type for better query performance
CREATE INDEX IF NOT EXISTS idx_organizations_type ON organizations(type);

-- Verify the changes
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'organizations' 
ORDER BY ordinal_position;
