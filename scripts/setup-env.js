#!/usr/bin/env node

/**
 * Environment Setup Script
 * Helps users set up their environment variables
 */

const fs = require('fs');
const path = require('path');

const envExample = `# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# LLM Provider API Keys
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
GOOGLE_AI_API_KEY=your_google_ai_api_key

# Platform Integration Credentials
META_APP_ID=your_meta_app_id
META_APP_SECRET=your_meta_app_secret
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Encryption Key (generate a random 32-character string)
ENCRYPTION_KEY=your_32_character_encryption_key`;

function main() {
  console.log('🔧 Setting up environment variables...\n');

  const envPath = '.env.local';
  const envExamplePath = '.env.example';

  // Create .env.example if it doesn't exist
  if (!fs.existsSync(envExamplePath)) {
    fs.writeFileSync(envExamplePath, envExample);
    console.log('✅ Created .env.example file');
  }

  // Check if .env.local exists
  if (fs.existsSync(envPath)) {
    console.log('⚠️  .env.local already exists');
    console.log('   Please update it with your actual values');
  } else {
    // Create .env.local with placeholder values
    fs.writeFileSync(envPath, envExample);
    console.log('✅ Created .env.local file with placeholder values');
    console.log('   Please update it with your actual values');
  }

  console.log('\n📋 Next steps:');
  console.log('1. Go to https://supabase.com/dashboard');
  console.log('2. Create a new project');
  console.log('3. Go to Settings > API');
  console.log('4. Copy your Project URL and anon key');
  console.log('5. Update NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local');
  console.log('6. Run the SQL from supabase-schema.sql in your Supabase SQL editor');
  console.log('7. Restart your development server: npm run dev');

  console.log('\n🔗 Useful links:');
  console.log('- Supabase Dashboard: https://supabase.com/dashboard');
  console.log('- Supabase Docs: https://supabase.com/docs');
  console.log('- OpenAI API: https://platform.openai.com/api-keys');
  console.log('- Anthropic API: https://console.anthropic.com/');
  console.log('- Google AI: https://makersuite.google.com/app/apikey');
}

if (require.main === module) {
  main();
}

module.exports = { main };
