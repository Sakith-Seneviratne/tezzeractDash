# 🚀 Vercel Deployment Guide

This guide will help you deploy your Tezzeract Dashboard to Vercel for free.

## 📋 Prerequisites

1. **GitHub Account** - Your code needs to be on GitHub
2. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
3. **Environment Variables** - All your API keys and secrets

## 🔧 Step 1: Prepare Your Code

### 1.1 Create Environment Variables File

Create a `.env.example` file in your project root:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# App Configuration
NEXT_PUBLIC_APP_URL=https://your-app-name.vercel.app

# OAuth Credentials
NEXT_PUBLIC_LINKEDIN_CLIENT_ID=your_linkedin_client_id
NEXT_PUBLIC_META_APP_ID=your_meta_app_id
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id

# API Keys
TWITTER_CLIENT_ID=your_twitter_client_id
TWITTER_CLIENT_SECRET=your_twitter_client_secret
GOOGLE_CLIENT_SECRET=your_google_client_secret
META_APP_SECRET=your_meta_app_secret

# Gemini AI API Key
GEMINI_API_KEY=your_gemini_api_key_here
```

### 1.2 Update OAuth Redirect URIs

Update your OAuth app settings to include your Vercel domain:

**LinkedIn:**
- Add: `https://your-app-name.vercel.app/api/auth/linkedin/callback`

**Google:**
- Add: `https://your-app-name.vercel.app/api/auth/google/callback`

**Meta (Facebook):**
- Add: `https://your-app-name.vercel.app/api/auth/meta/callback`

**Twitter/X:**
- Add: `https://your-app-name.vercel.app/api/auth/twitter/callback`

## 🚀 Step 2: Deploy to Vercel

### 2.1 Push to GitHub

```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Commit changes
git commit -m "Initial commit for Vercel deployment"

# Add your GitHub repository
git remote add origin https://github.com/yourusername/tezzeract-dashboard.git

# Push to GitHub
git push -u origin main
```

### 2.2 Deploy on Vercel

1. **Go to [vercel.com](https://vercel.com)**
2. **Click "New Project"**
3. **Import from GitHub** - Select your repository
4. **Configure Project:**
   - Framework Preset: `Next.js`
   - Root Directory: `./` (default)
   - Build Command: `npm run build`
   - Output Directory: `.next` (default)

### 2.3 Add Environment Variables

In Vercel dashboard, go to **Settings > Environment Variables** and add:

| Variable | Value | Description |
|----------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `your_supabase_url` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `your_supabase_anon_key` | Your Supabase anon key |
| `NEXT_PUBLIC_APP_URL` | `https://your-app-name.vercel.app` | Your Vercel app URL |
| `NEXT_PUBLIC_LINKEDIN_CLIENT_ID` | `your_linkedin_client_id` | LinkedIn OAuth client ID |
| `NEXT_PUBLIC_META_APP_ID` | `your_meta_app_id` | Meta app ID |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | `your_google_client_id` | Google OAuth client ID |
| `TWITTER_CLIENT_ID` | `your_twitter_client_id` | Twitter OAuth client ID |
| `TWITTER_CLIENT_SECRET` | `your_twitter_secret` | Twitter OAuth secret |
| `GOOGLE_CLIENT_SECRET` | `your_google_secret` | Google OAuth secret |
| `META_APP_SECRET` | `your_meta_secret` | Meta app secret |
| `GEMINI_API_KEY` | `your_gemini_api_key` | Google Gemini API key |

## 🔧 Step 3: Configure OAuth Apps

### 3.1 Update Redirect URIs

After deployment, update all your OAuth applications with the new Vercel URL:

**LinkedIn Developer Console:**
1. Go to [LinkedIn Developer Console](https://www.linkedin.com/developers/)
2. Select your app
3. Go to "Auth" tab
4. Add redirect URI: `https://your-app-name.vercel.app/api/auth/linkedin/callback`

**Google Cloud Console:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to "APIs & Services" > "Credentials"
4. Edit your OAuth 2.0 client
5. Add redirect URI: `https://your-app-name.vercel.app/api/auth/google/callback`

**Meta for Developers:**
1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Select your app
3. Go to "Facebook Login" > "Settings"
4. Add redirect URI: `https://your-app-name.vercel.app/api/auth/meta/callback`

**Twitter Developer Portal:**
1. Go to [Twitter Developer Portal](https://developer.twitter.com/)
2. Select your app
3. Go to "App settings" > "Authentication settings"
4. Add callback URL: `https://your-app-name.vercel.app/api/auth/twitter/callback`

## 🎯 Step 4: Test Your Deployment

1. **Visit your Vercel URL**: `https://your-app-name.vercel.app`
2. **Test the setup flow**:
   - Go to `/setup`
   - Fill in organization details
   - Add business objectives
   - Test content suggestions generation
3. **Test OAuth flows**:
   - Try connecting each platform
   - Verify redirects work correctly

## 🔧 Step 5: Domain Configuration (Optional)

### 5.1 Custom Domain

1. **In Vercel Dashboard:**
   - Go to your project
   - Click "Settings" > "Domains"
   - Add your custom domain
   - Follow DNS configuration instructions

2. **Update Environment Variables:**
   - Change `NEXT_PUBLIC_APP_URL` to your custom domain
   - Update OAuth redirect URIs with custom domain

## 📊 Step 6: Monitoring & Analytics

### 6.1 Vercel Analytics

- **Built-in Analytics**: Vercel provides basic analytics
- **Real User Monitoring**: Track performance and errors
- **Function Logs**: Monitor API function performance

### 6.2 Environment Management

- **Preview Deployments**: Every PR gets a preview URL
- **Environment Variables**: Different values for production/preview
- **Secrets Management**: Secure storage of sensitive data

## 🚨 Troubleshooting

### Common Issues:

1. **Build Failures:**
   - Check Node.js version compatibility
   - Verify all dependencies are in `package.json`
   - Check for TypeScript errors

2. **Environment Variables:**
   - Ensure all required variables are set
   - Check variable names match exactly
   - Verify no typos in values

3. **OAuth Issues:**
   - Verify redirect URIs are correct
   - Check client IDs and secrets
   - Ensure OAuth apps are properly configured

4. **API Errors:**
   - Check function logs in Vercel dashboard
   - Verify API keys are valid
   - Check rate limits

## 💰 Cost Information

### Vercel Free Tier Includes:
- ✅ **Unlimited personal projects**
- ✅ **100GB bandwidth per month**
- ✅ **100GB-hours of serverless function execution**
- ✅ **Automatic HTTPS**
- ✅ **Global CDN**
- ✅ **Preview deployments**

### When You Might Need to Upgrade:
- High traffic (>100GB bandwidth/month)
- Heavy serverless function usage
- Team collaboration features
- Advanced analytics

## 🎉 Success!

Once deployed, your app will be available at:
- **Production**: `https://your-app-name.vercel.app`
- **Preview**: `https://your-app-name-git-branch.vercel.app` (for each branch)

Your Tezzeract Dashboard is now live and ready to use! 🚀
