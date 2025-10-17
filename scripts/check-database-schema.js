#!/usr/bin/env node

/**
 * Script to check the current database schema for organizations table
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env.local file manually
function loadEnvFile() {
  try {
    const envPath = path.join(__dirname, '..', '.env.local');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    
    lines.forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        process.env[key] = valueParts.join('=');
      }
    });
  } catch (error) {
    console.log('Could not load .env.local file');
  }
}

loadEnvFile();

async function checkDatabaseSchema() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables');
    console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env.local');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('🔍 Checking database schema...');

  try {
    // Check if organizations table exists and get its columns
    const { data: columns, error } = await supabase
      .rpc('exec_sql', { 
        sql: `
          SELECT column_name, data_type, is_nullable 
          FROM information_schema.columns 
          WHERE table_name = 'organizations' 
          ORDER BY ordinal_position;
        `
      });

    if (error) {
      console.error('❌ Error checking schema:', error.message);
      
      // Try alternative approach
      console.log('🔄 Trying alternative approach...');
      
      // Try to select from organizations table to see what columns exist
      const { data: testData, error: testError } = await supabase
        .from('organizations')
        .select('*')
        .limit(1);
      
      console.log('Test query result:', { testData, testError });
      
      if (testError) {
        console.error('❌ Cannot access organizations table:', testError.message);
        console.log('\n📋 Possible issues:');
        console.log('1. Organizations table does not exist');
        console.log('2. RLS policies are blocking access');
        console.log('3. Database connection issues');
        console.log('\n🔧 Solutions:');
        console.log('1. Run the migration: node scripts/apply-organization-migration.js');
        console.log('2. Or manually run the SQL from migration-add-organization-fields.sql');
        return;
      }
      
      console.log('✅ Organizations table exists and is accessible');
      return;
    }

    console.log('✅ Database schema check successful');
    console.log('\n📋 Organizations table columns:');
    
    if (columns && columns.length > 0) {
      columns.forEach(col => {
        console.log(`   - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
      });
      
      // Check if new columns exist
      const hasType = columns.some(col => col.column_name === 'type');
      const hasProductsServices = columns.some(col => col.column_name === 'products_services');
      const hasObjectives = columns.some(col => col.column_name === 'objectives');
      const hasWebsiteUrl = columns.some(col => col.column_name === 'website_url');
      
      console.log('\n🔍 Migration status:');
      console.log(`   - type: ${hasType ? '✅' : '❌'}`);
      console.log(`   - products_services: ${hasProductsServices ? '✅' : '❌'}`);
      console.log(`   - objectives: ${hasObjectives ? '✅' : '❌'}`);
      console.log(`   - website_url: ${hasWebsiteUrl ? '✅' : '❌'}`);
      
      if (!hasType || !hasProductsServices || !hasObjectives || !hasWebsiteUrl) {
        console.log('\n⚠️  Migration needed! Run: node scripts/apply-organization-migration.js');
      } else {
        console.log('\n✅ All new columns are present!');
      }
    } else {
      console.log('   No columns found (table might be empty)');
    }

  } catch (error) {
    console.error('❌ Error during schema check:', error.message);
  }
}

// Check if we're running this script directly
if (require.main === module) {
  checkDatabaseSchema();
}

module.exports = { checkDatabaseSchema };
