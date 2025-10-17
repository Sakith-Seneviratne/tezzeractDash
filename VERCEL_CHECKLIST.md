# ✅ Vercel Deployment Checklist

## Pre-Deployment Checklist

### 📁 Code Preparation
- [ ] Code is pushed to GitHub repository
- [ ] All dependencies are in `package.json`
- [ ] No TypeScript errors (`npm run build` succeeds)
- [ ] `.env.local` file exists with all required variables
- [ ] `vercel.json` configuration file is created

### 🔑 Environment Variables Required
- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key
- [ ] `NEXT_PUBLIC_APP_URL` - Will be your Vercel URL
- [ ] `GEMINI_API_KEY` - Your Google Gemini API key
- [ ] `NEXT_PUBLIC_LINKEDIN_CLIENT_ID` - LinkedIn OAuth client ID
- [ ] `NEXT_PUBLIC_META_APP_ID` - Meta app ID
- [ ] `NEXT_PUBLIC_GOOGLE_CLIENT_ID` - Google OAuth client ID
- [ ] `TWITTER_CLIENT_ID` - Twitter OAuth client ID
- [ ] `TWITTER_CLIENT_SECRET` - Twitter OAuth secret
- [ ] `GOOGLE_CLIENT_SECRET` - Google OAuth secret
- [ ] `META_APP_SECRET` - Meta app secret

### 🔗 OAuth Configuration
- [ ] LinkedIn redirect URI updated: `https://your-app.vercel.app/api/auth/linkedin/callback`
- [ ] Google redirect URI updated: `https://your-app.vercel.app/api/auth/google/callback`
- [ ] Meta redirect URI updated: `https://your-app.vercel.app/api/auth/meta/callback`
- [ ] Twitter redirect URI updated: `https://your-app.vercel.app/api/auth/twitter/callback`

## Deployment Steps

### 1. GitHub Setup
- [ ] Create GitHub repository
- [ ] Push code to GitHub
- [ ] Verify all files are committed

### 2. Vercel Setup
- [ ] Sign up at [vercel.com](https://vercel.com)
- [ ] Connect GitHub account
- [ ] Import your repository
- [ ] Configure build settings (should auto-detect Next.js)

### 3. Environment Variables
- [ ] Add all environment variables in Vercel dashboard
- [ ] Set `NEXT_PUBLIC_APP_URL` to your Vercel domain
- [ ] Verify all variables are correctly set

### 4. OAuth Updates
- [ ] Update LinkedIn OAuth settings
- [ ] Update Google OAuth settings
- [ ] Update Meta OAuth settings
- [ ] Update Twitter OAuth settings

### 5. Testing
- [ ] Visit your Vercel URL
- [ ] Test organization setup
- [ ] Test content suggestions generation
- [ ] Test OAuth connections
- [ ] Verify all features work correctly

## Post-Deployment

### 🎯 Domain Setup (Optional)
- [ ] Configure custom domain if desired
- [ ] Update OAuth redirect URIs with custom domain
- [ ] Update `NEXT_PUBLIC_APP_URL` environment variable

### 📊 Monitoring
- [ ] Check Vercel analytics
- [ ] Monitor function logs
- [ ] Set up error tracking if needed

## 🚨 Common Issues & Solutions

### Build Failures
- **Issue**: TypeScript errors
- **Solution**: Run `npm run build` locally and fix errors

### Environment Variables
- **Issue**: Variables not loading
- **Solution**: Check variable names match exactly, no typos

### OAuth Redirects
- **Issue**: OAuth redirects failing
- **Solution**: Verify redirect URIs are exactly correct

### API Errors
- **Issue**: Gemini API not working
- **Solution**: Check API key is correct and has proper permissions

## 📞 Support

If you encounter issues:
1. Check Vercel function logs
2. Verify all environment variables
3. Test OAuth redirects manually
4. Check browser console for errors

## 🎉 Success Indicators

Your deployment is successful when:
- ✅ App loads at your Vercel URL
- ✅ Organization setup works
- ✅ Content suggestions generate with Gemini AI
- ✅ OAuth connections work for all platforms
- ✅ All features function as expected

---

**Ready to deploy?** Run `./scripts/deploy-to-vercel.sh` to get started! 🚀
