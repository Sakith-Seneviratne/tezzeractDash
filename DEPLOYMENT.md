# Deployment Guide

## Environment Variables Setup

### Required Environment Variables

Create a `.env.local` file in your project root with the following variables:

```bash
# Supabase Configuration
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

# Encryption (generate a random 32-character string)
ENCRYPTION_KEY=your_32_character_encryption_key
```

### Vercel Deployment

1. **Connect to Vercel:**
   ```bash
   npm install -g vercel
   vercel login
   vercel
   ```

2. **Set Environment Variables in Vercel:**
   - Go to your Vercel dashboard
   - Navigate to your project settings
   - Add all environment variables from the list above
   - Update `NEXT_PUBLIC_APP_URL` to your production domain

3. **Deploy:**
   ```bash
   vercel --prod
   ```

## Supabase Setup

### 1. Create Supabase Project
- Go to [supabase.com](https://supabase.com)
- Create a new project
- Note down your project URL and anon key

### 2. Run Database Schema
Execute the SQL from `supabase-schema.sql` in your Supabase SQL editor.

### 3. Configure Authentication
- Go to Authentication > Settings
- Add your production domain to "Site URL"
- Add your production domain to "Redirect URLs"

### 4. Set up Storage Buckets
Create the following storage buckets:
- `avatars` (public)
- `organization-logos` (public)
- `csv-uploads` (private)

## Platform Integration Setup

### Meta (Facebook/Instagram)
1. Go to [Facebook Developers](https://developers.facebook.com)
2. Create a new app
3. Add Facebook Login and Instagram Basic Display products
4. Configure OAuth redirect URIs:
   - `https://yourdomain.com/api/auth/meta/callback`
5. Get App ID and App Secret

### LinkedIn
1. Go to [LinkedIn Developers](https://www.linkedin.com/developers)
2. Create a new app
3. Add "Sign In with LinkedIn" product
4. Configure OAuth redirect URIs:
   - `https://yourdomain.com/api/auth/linkedin/callback`
5. Get Client ID and Client Secret

### Google Analytics
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google Analytics Reporting API
4. Create OAuth 2.0 credentials
5. Configure redirect URIs:
   - `https://yourdomain.com/api/auth/google/callback`
6. Get Client ID and Client Secret

## Security Checklist

### ✅ Implemented Security Measures

1. **Environment Variables**
   - All sensitive data stored in environment variables
   - No API keys exposed to client-side code

2. **Row Level Security (RLS)**
   - All database tables have RLS policies
   - Organization-level data isolation
   - User-level access control

3. **Authentication**
   - Supabase Auth with secure session management
   - Protected routes with middleware
   - Organization-based access control

4. **API Security**
   - Server-side API routes for sensitive operations
   - Token refresh handling
   - Error handling without exposing sensitive data

5. **Data Encryption**
   - OAuth tokens stored securely
   - Sensitive configuration data encrypted

### 🔒 Additional Security Recommendations

1. **Rate Limiting**
   ```bash
   npm install @upstash/ratelimit @upstash/redis
   ```

2. **CORS Configuration**
   - Configure CORS for production domains only

3. **Content Security Policy**
   - Add CSP headers for XSS protection

4. **Database Security**
   - Regular backups
   - Monitor for suspicious activity
   - Use connection pooling

## Performance Optimization

### ✅ Implemented Optimizations

1. **Next.js Optimizations**
   - App Router for better performance
   - Server-side rendering where appropriate
   - Image optimization with Next.js Image component

2. **Database Optimizations**
   - Proper indexing on frequently queried columns
   - Efficient queries with proper joins
   - Connection pooling with Supabase

3. **Frontend Optimizations**
   - Lazy loading of components
   - Efficient state management
   - Optimized bundle size

### 🚀 Additional Performance Recommendations

1. **Caching**
   ```bash
   npm install @vercel/kv
   ```

2. **CDN**
   - Use Vercel's global CDN
   - Optimize static assets

3. **Monitoring**
   ```bash
   npm install @vercel/analytics
   ```

## Monitoring and Analytics

### Error Tracking
```bash
npm install @sentry/nextjs
```

### Performance Monitoring
```bash
npm install @vercel/analytics
```

## Backup Strategy

1. **Database Backups**
   - Enable automatic backups in Supabase
   - Regular manual exports

2. **Code Backups**
   - Git repository with proper branching
   - Regular commits and tags

3. **Environment Backup**
   - Document all environment variables
   - Store securely (password manager)

## Troubleshooting

### Common Issues

1. **OAuth Redirect Errors**
   - Check redirect URIs in platform settings
   - Verify environment variables

2. **Database Connection Issues**
   - Check Supabase project status
   - Verify RLS policies

3. **Build Errors**
   - Check all environment variables are set
   - Verify TypeScript types

### Support

- Check Vercel deployment logs
- Monitor Supabase dashboard
- Review browser console for client-side errors

## Production Checklist

- [ ] All environment variables configured
- [ ] Database schema deployed
- [ ] OAuth apps configured with production URLs
- [ ] Storage buckets created
- [ ] Domain configured in Vercel
- [ ] SSL certificate active
- [ ] Error tracking configured
- [ ] Performance monitoring enabled
- [ ] Backup strategy implemented
- [ ] Security audit completed
