#!/usr/bin/env node

/**
 * Script to test organization creation without RLS policies
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

async function testOrganizationCreation() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('🧪 Testing organization creation...');

  try {
    // Test data
    const testOrg = {
      name: 'Test Organization',
      slug: 'test-organization-' + Date.now(),
      type: 'startup',
      products_services: 'Test products and services',
      objectives: 'Test objectives and goals',
      website_url: 'https://test.com',
      settings: {}
    };

    console.log('Creating test organization:', testOrg);

    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .insert(testOrg)
      .select()
      .single();

    if (orgError) {
      console.error('❌ Organization creation failed:', orgError.message);
      console.error('Error details:', orgError);
      
      // Check if it's a column issue
      if (orgError.message.includes('column') && orgError.message.includes('does not exist')) {
        console.log('\n🔧 Solution: The database columns need to be created.');
        console.log('Run the migration manually in your Supabase dashboard:');
        console.log('1. Go to SQL Editor');
        console.log('2. Copy the SQL from migration-add-organization-fields.sql');
        console.log('3. Execute it');
      }
      
      return;
    }

    console.log('✅ Organization created successfully!');
    console.log('Created organization:', org);

    // Clean up - delete the test organization
    const { error: deleteError } = await supabase
      .from('organizations')
      .delete()
      .eq('id', org.id);

    if (deleteError) {
      console.log('⚠️  Could not clean up test organization:', deleteError.message);
    } else {
      console.log('🧹 Test organization cleaned up');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

testOrganizationCreation();
