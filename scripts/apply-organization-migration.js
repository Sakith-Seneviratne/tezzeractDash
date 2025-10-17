#!/usr/bin/env node

/**
 * Script to apply organization fields migration to Supabase
 * Run this script to add new fields to your existing organizations table
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function applyMigration() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables');
    console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env.local');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('🚀 Applying organization fields migration...');

  try {
    // Check if the columns already exist
    const { data: columns, error: columnsError } = await supabase
      .rpc('get_table_columns', { table_name: 'organizations' });

    if (columnsError) {
      console.log('📝 Adding new columns to organizations table...');
      
      // Execute the migration SQL
      const migrationSQL = `
        ALTER TABLE organizations 
        ADD COLUMN IF NOT EXISTS type TEXT,
        ADD COLUMN IF NOT EXISTS products_services TEXT,
        ADD COLUMN IF NOT EXISTS objectives TEXT,
        ADD COLUMN IF NOT EXISTS website_url TEXT;

        ALTER TABLE organizations 
        ADD CONSTRAINT check_organization_type 
        CHECK (type IN ('startup', 'small_business', 'medium_business', 'enterprise', 'non_profit', 'agency', 'freelancer', 'other') OR type IS NULL);

        CREATE INDEX IF NOT EXISTS idx_organizations_type ON organizations(type);
      `;

      const { error: migrationError } = await supabase.rpc('exec_sql', { 
        sql: migrationSQL 
      });

      if (migrationError) {
        console.error('❌ Migration failed:', migrationError.message);
        console.log('\n📋 Manual migration required:');
        console.log('1. Go to your Supabase dashboard');
        console.log('2. Open the SQL Editor');
        console.log('3. Run the SQL from migration-add-organization-fields.sql');
        process.exit(1);
      }
    }

    console.log('✅ Migration applied successfully!');
    console.log('📋 New organization fields added:');
    console.log('   - type (organization type)');
    console.log('   - products_services (what you offer)');
    console.log('   - objectives (business goals)');
    console.log('   - website_url (organization website)');

  } catch (error) {
    console.error('❌ Error during migration:', error.message);
    console.log('\n📋 Manual migration required:');
    console.log('1. Go to your Supabase dashboard');
    console.log('2. Open the SQL Editor');
    console.log('3. Run the SQL from migration-add-organization-fields.sql');
  }
}

// Check if we're running this script directly
if (require.main === module) {
  applyMigration();
}

module.exports = { applyMigration };
