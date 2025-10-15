# 🚀 Quick Start Guide

## Current Issues & Solutions

### Issue 1: Missing Supabase Environment Variables
**Error**: `Your project's URL and Key are required to create a Supabase client!`

**Solution**:
1. Run the setup script:
   ```bash
   npm run setup
   ```

2. Go to [Supabase Dashboard](https://supabase.com/dashboard)
3. Create a new project
4. Go to Settings > API
5. Copy your Project URL and anon key
6. Update `.env.local` with your actual values:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   ```

### Issue 2: TailwindCSS v4 Compatibility
**Error**: `Cannot apply unknown utility class 'text-white'`

**Solution**: ✅ **FIXED** - Updated `tailwind.config.ts` with standard color definitions

## Complete Setup Steps

### 1. Environment Setup
```bash
# Run the setup script
npm run setup

# Edit .env.local with your actual values
# At minimum, you need:
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### 2. Database Setup
1. Go to your Supabase project
2. Open the SQL Editor
3. Run the SQL from `supabase-schema.sql`
4. Create storage buckets:
   - `avatars` (public)
   - `organization-logos` (public)
   - `csv-uploads` (private)

### 3. Start Development
```bash
npm run dev
```

## Optional: Full Configuration

For full functionality, you'll also need:

### LLM API Keys
- **OpenAI**: Get API key from [OpenAI Platform](https://platform.openai.com/api-keys)
- **Anthropic**: Get API key from [Anthropic Console](https://console.anthropic.com/)
- **Google AI**: Get API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

### Platform Integrations
- **Meta**: Create app at [Facebook Developers](https://developers.facebook.com)
- **LinkedIn**: Create app at [LinkedIn Developers](https://www.linkedin.com/developers)
- **Google Analytics**: Set up OAuth at [Google Cloud Console](https://console.cloud.google.com)

## Troubleshooting

### Port Already in Use
If port 3000 is in use, Next.js will automatically use port 3001. This is normal.

### Build Errors
If you encounter build errors:
1. Check that all environment variables are set
2. Run `npm run lint` to check for code issues
3. Run `npm run audit` for security and performance checks

### Database Connection Issues
1. Verify your Supabase URL and key are correct
2. Check that RLS policies are enabled
3. Ensure your project is not paused

## Next Steps

Once the basic setup is working:
1. Create your first organization
2. Connect a platform integration
3. Generate some content suggestions
4. Set up your content calendar

## Support

- Check the main [README.md](./README.md) for detailed documentation
- Review [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment
- Run `npm run audit` for security and performance checks
