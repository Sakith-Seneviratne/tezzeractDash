# Organization Fields Migration

This migration adds new fields to the `organizations` table to support the enhanced organization setup form.

## New Fields Added

- `type` - Organization type (startup, small_business, medium_business, enterprise, non_profit, agency, freelancer, other)
- `products_services` - Description of what the organization offers
- `objectives` - Main business objectives and goals  
- `website_url` - Organization website URL

## How to Apply the Migration

### Option 1: Automatic Migration (Recommended)

Run the migration script:

```bash
node scripts/apply-organization-migration.js
```

### Option 2: Manual Migration

If the automatic migration fails, you can apply it manually:

1. **Go to your Supabase Dashboard**
2. **Open the SQL Editor**
3. **Copy and paste the SQL from `migration-add-organization-fields.sql`**
4. **Execute the SQL**

### Option 3: Fresh Database Setup

If you're setting up a new database, use the updated schema:

```bash
# Run the complete schema with all organization fields
psql -h your-db-host -U postgres -d postgres -f supabase-schema.sql
```

## Verification

After applying the migration, verify the changes by running:

```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'organizations' 
ORDER BY ordinal_position;
```

You should see the new columns:
- `type`
- `products_services` 
- `objectives`
- `website_url`

## Rollback (if needed)

If you need to rollback the migration:

```sql
ALTER TABLE organizations 
DROP COLUMN IF EXISTS type,
DROP COLUMN IF EXISTS products_services,
DROP COLUMN IF EXISTS objectives,
DROP COLUMN IF EXISTS website_url;
```

## Notes

- The migration uses `IF NOT EXISTS` clauses to prevent errors if columns already exist
- Existing data will not be affected
- New fields are nullable, so existing organizations will continue to work
- The `type` field has a CHECK constraint to ensure valid values
