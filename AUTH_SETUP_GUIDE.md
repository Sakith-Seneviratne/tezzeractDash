# 🔐 Authentication Setup Guide

## Overview

Your Tezzeract Dashboard now has a complete authentication system powered by Supabase Auth with the following features:

- ✅ Email/password signup and login
- ✅ Google OAuth login
- ✅ User profile display (name & avatar) in top right
- ✅ Protected dashboard routes
- ✅ Logout functionality
- ✅ Automatic session management
- ✅ Middleware protection

---

## 🎯 What Was Implemented

### 1. **Login Page** (`/login`)
- Email and password authentication
- Google OAuth integration
- Link to signup page
- Forgot password link
- Beautiful gradient UI with error handling

### 2. **Signup Page** (`/signup`)
- User registration with full name, email, and password
- Google OAuth signup
- Password validation (min 6 characters)
- Email confirmation handling
- Automatic redirect to organization setup

### 3. **User Profile Display**
- User avatar or initials in top right corner
- Dropdown menu with user info
- Settings link
- Logout button
- Works with both email and OAuth users

### 4. **Protected Routes**
- Middleware automatically redirects unauthenticated users to `/login`
- Dashboard routes require authentication
- Auth state persisted across page refreshes
- Real-time session updates

### 5. **Auth Callback** (`/auth/callback`)
- Handles OAuth redirects from Google
- Exchanges auth code for session
- Redirects to dashboard after successful auth

---

## 🚀 How to Use

### **For Users:**

#### **Sign Up:**
1. Go to `http://localhost:3000/signup`
2. Enter your full name, email, and password
3. Click "Create Account" or "Continue with Google"
4. You'll be redirected to complete your organization profile

#### **Login:**
1. Go to `http://localhost:3000/login`
2. Enter your email and password
3. Click "Sign In" or "Continue with Google"
4. You'll be redirected to the dashboard

#### **Logout:**
1. Click on your profile (top right)
2. Click "Logout"
3. You'll be redirected to the login page

---

## ⚙️ Configuration Requirements

### **1. Supabase Environment Variables**

Make sure these are set in your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### **2. Supabase Auth Settings**

In your Supabase Dashboard → Authentication → URL Configuration:

- **Site URL:** `http://localhost:3000`
- **Redirect URLs:**
  - `http://localhost:3000/auth/callback`
  - `http://localhost:3000/login`
  - Add production URLs when deploying

### **3. Email Templates (Optional)**

In Supabase Dashboard → Authentication → Email Templates:
- Customize confirmation email
- Customize password reset email
- Add your branding

### **4. Google OAuth Setup (Optional)**

To enable "Continue with Google":

1. **Go to Supabase Dashboard** → Authentication → Providers → Google
2. **Enable Google** provider
3. **Get credentials from Google Cloud Console:**
   - Create OAuth 2.0 Client ID
   - Add authorized redirect URI: `https://<your-project-ref>.supabase.co/auth/v1/callback`
4. **Copy Client ID and Client Secret** to Supabase
5. **Save**

---

## 📁 File Structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx          # Login page
│   │   └── signup/
│   │       └── page.tsx          # Signup page
│   ├── auth/
│   │   └── callback/
│   │       └── route.ts          # OAuth callback handler
│   ├── (dashboard)/
│   │   └── layout.tsx            # Dashboard layout with user profile
│   ├── page.tsx                  # Root page (redirects to login)
│   └── middleware.ts             # Route protection
├── lib/
│   └── supabase/
│       ├── client.ts             # Browser client
│       ├── server.ts             # Server client
│       └── middleware.ts         # Session management
```

---

## 🔒 How Authentication Works

### **Flow Diagram:**

```
User visits /dashboard
    ↓
Middleware checks auth
    ↓
No session? → Redirect to /login
    ↓
User logs in
    ↓
Supabase creates session
    ↓
Redirect to /dashboard
    ↓
Dashboard layout fetches user
    ↓
Display user profile
    ↓
✅ User can access protected routes
```

### **Session Management:**

1. **Login/Signup** creates a Supabase session
2. **Session stored** in cookies (httpOnly, secure)
3. **Middleware refreshes** session on each request
4. **Dashboard layout subscribes** to auth state changes
5. **Logout** clears session and redirects to login

---

## 🎨 User Profile Features

### **Avatar Display:**
- If user has `avatar_url` (from Google OAuth), shows profile picture
- Otherwise, shows initials (first letter of name/email)
- Circular design with primary color background

### **User Display Name:**
- Uses `full_name` from user metadata (if available)
- Falls back to email username (before @)
- Falls back to "User" if nothing available

### **Dropdown Menu:**
- User name and email
- Settings link
- Logout button (red text for emphasis)

---

## 🧪 Testing Checklist

- [ ] Visit `http://localhost:3000` → should redirect to `/login`
- [ ] Try to visit `/dashboard` without login → should redirect to `/login`
- [ ] Create new account via signup page
- [ ] Verify email confirmation (if enabled in Supabase)
- [ ] Login with email/password
- [ ] Check user profile appears in top right
- [ ] Click user profile → dropdown appears
- [ ] Click Settings → goes to settings page
- [ ] Click Logout → redirects to login and clears session
- [ ] Refresh page while logged in → should stay logged in
- [ ] Test Google OAuth (if configured)

---

## 🐛 Troubleshooting

### **Issue: "Supabase client not initialized"**
**Solution:** Check that `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set in `.env.local`

### **Issue: Google OAuth not working**
**Solution:** 
1. Verify Google provider is enabled in Supabase
2. Check redirect URI matches exactly
3. Ensure Google Cloud Console credentials are correct

### **Issue: User gets logged out on refresh**
**Solution:** 
1. Check middleware is enabled
2. Verify cookies are being set (check browser dev tools)
3. Make sure `updateSession` is being called

### **Issue: Email confirmation not received**
**Solution:** 
1. Check spam folder
2. Verify email templates in Supabase
3. Check SMTP settings (if using custom SMTP)
4. For development, disable email confirmation in Supabase → Authentication → Providers → Email → "Confirm email" toggle

### **Issue: Redirect loop between /login and /dashboard**
**Solution:** 
1. Clear browser cookies
2. Check middleware logic
3. Verify Supabase session is being created properly

---

## 🔄 Next Steps

### **Immediate:**
- [ ] Configure Google OAuth (optional)
- [ ] Customize email templates
- [ ] Test all auth flows
- [ ] Add user profile update functionality

### **For Production:**
1. **Update Supabase URLs:**
   - Add production URL to Site URL
   - Add production URL to Redirect URLs

2. **Enable RLS Policies:**
   - Create user-specific RLS policies
   - Ensure users can only access their own data

3. **Email Configuration:**
   - Set up custom SMTP (optional)
   - Customize email templates with branding

4. **Security:**
   - Enable 2FA (if needed)
   - Set up rate limiting
   - Configure password policies

---

## 📊 User Data Flow

### **When User Signs Up:**

```
1. User fills signup form
2. Supabase creates user in auth.users
3. User metadata stored (full_name, avatar_url)
4. Session created and stored in cookies
5. User redirected to /setup/organization
6. Organization created and linked to user.id
```

### **When User Logs In:**

```
1. User enters credentials
2. Supabase validates and creates session
3. Session stored in cookies
4. User redirected to /dashboard
5. Dashboard fetches user data
6. User profile displayed
```

---

## 🎉 Success Indicators

You'll know auth is working when:

- ✅ Can't access `/dashboard` without logging in
- ✅ User profile shows in top right after login
- ✅ Logout button works and redirects to login
- ✅ Session persists across page refreshes
- ✅ Google OAuth works (if configured)
- ✅ No console errors related to auth

---

## 📚 Additional Resources

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Next.js + Supabase SSR](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Google OAuth Setup](https://supabase.com/docs/guides/auth/social-login/auth-google)

---

**Happy authenticating! 🚀**

Your users can now securely access the dashboard, and all data will be properly linked to their accounts.

