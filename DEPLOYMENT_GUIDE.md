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

**IMPORTANT**: Do NOT add environment variables in `vercel.json`. Instead, add them directly in the Vercel dashboard.

In Vercel dashboard, go to **Settings > Environment Variables** and add each variable:

| Variable Name | Value | Environment |
|---------------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `your_supabase_url` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `your_supabase_anon_key` | Production, Preview, Development |
| `NEXT_PUBLIC_APP_URL` | `https://your-app-name.vercel.app` | Production, Preview, Development |
| `NEXT_PUBLIC_LINKEDIN_CLIENT_ID` | `your_linkedin_client_id` | Production, Preview, Development |
| `NEXT_PUBLIC_META_APP_ID` | `your_meta_app_id` | Production, Preview, Development |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | `your_google_client_id` | Production, Preview, Development |
| `TWITTER_CLIENT_ID` | `your_twitter_client_id` | Production, Preview, Development |
| `TWITTER_CLIENT_SECRET` | `your_twitter_secret` | Production, Preview, Development |
| `GOOGLE_CLIENT_SECRET` | `your_google_secret` | Production, Preview, Development |
| `META_APP_SECRET` | `your_meta_secret` | Production, Preview, Development |
| `GEMINI_API_KEY` | `your_gemini_api_key` | Production, Preview, Development |

**Steps to add variables:**
1. Go to your project in Vercel dashboard
2. Click **Settings** tab
3. Click **Environment Variables** in the sidebar
4. Click **Add New**
5. Enter the variable name and value
6. Select all environments (Production, Preview, Development)
7. Click **Save**
8. Repeat for each variable

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

1. **Environment Variable Error: "references Secret which does not exist"**
   - **Problem**: `vercel.json` references secrets that don't exist
   - **Solution**: Remove the `env` section from `vercel.json` and add variables directly in Vercel dashboard
   - **Fix**: Use the updated `vercel.json` (without env section) and add variables in Settings > Environment Variables

2. **Build Failures:**
   - Check Node.js version compatibility
   - Verify all dependencies are in `package.json`
   - Check for TypeScript errors

3. **Environment Variables:**
   - Ensure all required variables are set in Vercel dashboard (not in vercel.json)
   - Check variable names match exactly
   - Verify no typos in values
   - Make sure variables are enabled for all environments (Production, Preview, Development)

4. **OAuth Issues:**
   - Verify redirect URIs are correct
   - Check client IDs and secrets
   - Ensure OAuth apps are properly configured

5. **API Errors:**
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
