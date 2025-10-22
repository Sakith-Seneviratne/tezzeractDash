# ⚡ Supabase Auth Quick Setup

## 🎯 Goal
Enable email/password authentication for your Tezzeract Dashboard so users can sign up and login.

---

## ✅ Prerequisites

1. **Supabase project** already created
2. **Environment variables** in `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
   ```

---

## 🚀 Quick Setup Steps

### **Step 1: Configure Supabase Auth Settings**

1. **Go to Supabase Dashboard** → Your Project
2. **Authentication** → **URL Configuration**
3. **Set these URLs:**

   ```
   Site URL: http://localhost:3000
   
   Redirect URLs (one per line):
   http://localhost:3000/auth/callback
   http://localhost:3000/login
   http://localhost:3000/dashboard
   ```

4. **Click "Save"**

### **Step 2: Disable Email Confirmation (Development Only)**

For easier testing during development:

1. **Authentication** → **Providers** → **Email**
2. **Toggle OFF** "Confirm email"
3. **Click "Save"**

⚠️ **Re-enable this in production!**

### **Step 3: Test the Auth Flow**

1. **Start your dev server:**
   ```bash
   npm run dev
   ```

2. **Go to:** `http://localhost:3000/signup`

3. **Create an account:**
   - Full Name: John Doe
   - Email: test@example.com
   - Password: password123

4. **You should be:**
   - Redirected to `/setup/organization`
   - Able to see your name in the top right

5. **Test logout:**
   - Click your profile (top right)
   - Click "Logout"
   - Should redirect to `/login`

6. **Test login:**
   - Enter same credentials
   - Click "Sign In"
   - Should redirect to `/dashboard`

---

## 🎨 Optional: Enable Google OAuth

### **Step 1: Create Google OAuth Credentials**

1. **Go to Google Cloud Console:** https://console.cloud.google.com
2. **APIs & Services** → **Credentials**
3. **Create Credentials** → **OAuth 2.0 Client ID**
4. **Application type:** Web application
5. **Name:** Tezzeract Dashboard
6. **Authorized redirect URIs:**
   ```
   https://xxxxx.supabase.co/auth/v1/callback
   ```
   (Replace `xxxxx` with your Supabase project ref)

7. **Click "Create"**
8. **Copy** Client ID and Client Secret

### **Step 2: Configure in Supabase**

1. **Supabase Dashboard** → **Authentication** → **Providers**
2. **Find "Google"** → Toggle **ON**
3. **Paste:**
   - Client ID
   - Client Secret
4. **Click "Save"**

### **Step 3: Test Google Login**

1. **Go to:** `http://localhost:3000/login`
2. **Click:** "Continue with Google"
3. **Should:**
   - Redirect to Google login
   - Come back to your dashboard
   - Show your Google profile picture!

---

## 🔧 Troubleshooting

### **Can't access dashboard after login**

**Check console** for errors. Most common:
- Supabase env vars missing/incorrect
- Browser cookies disabled

**Solution:**
```bash
# Verify env vars are set
cat .env.local

# Should show:
# NEXT_PUBLIC_SUPABASE_URL=https://...
# NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### **Google OAuth redirect error**

**Error:** `redirect_uri_mismatch`

**Solution:**
1. Go to Google Cloud Console
2. Check authorized redirect URI matches **exactly**:
   ```
   https://<your-project-ref>.supabase.co/auth/v1/callback
   ```
3. Copy from Supabase → Authentication → Providers → Google → "Callback URL"

### **"Email not confirmed" error**

If you disabled email confirmation but still get this error:

1. **Supabase Dashboard** → **Authentication** → **Users**
2. **Find your user** → Click the `...` menu
3. **Select** "Confirm email"

---

## 🎉 You're Done!

Your auth system is now ready:
- ✅ Users can sign up
- ✅ Users can login
- ✅ Protected dashboard routes
- ✅ User profile display
- ✅ Logout functionality

---

## 📝 Next: Connect User Data to Database

Since you now have authenticated users, update your database operations to use `user.id`:

```typescript
// Example: Save organization with user ID
const { data: { user } } = await supabase.auth.getUser();

await supabase
  .from('organizations')
  .insert({
    user_id: user.id,  // 👈 Link to user
    name: 'My Organization',
    // ...
  });
```

See `AUTH_SETUP_GUIDE.md` for complete integration instructions.

---

**Questions?** Check `AUTH_SETUP_GUIDE.md` for detailed documentation!

