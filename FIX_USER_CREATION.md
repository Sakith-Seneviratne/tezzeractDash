# 🔧 Fix: Users Not Appearing in Database

## 🐛 The Problem

When users sign up through the `/signup` page:
- ✅ They're created in Supabase's `auth.users` table (internal auth)
- ❌ They're **NOT** automatically added to your `public.users` table
- ❌ This causes issues when trying to link organizations and other data to users

---

## ✅ The Solution

Create a **database trigger** that automatically adds new auth users to your `public.users` table.

---

## 🚀 How to Fix (2 minutes)

### **Step 1: Run the Trigger Script**

1. **Open Supabase Dashboard** → Your Project
2. **Go to SQL Editor**
3. **Click "New Query"**
4. **Copy and paste** the entire contents of `scripts/create-user-trigger.sql`
5. **Click "Run"**

You should see:
```
Triggers created successfully! New users will automatically be added to public.users table.
```

### **Step 2: Verify the Fix**

#### **A. Check Existing Users**

1. **Supabase Dashboard** → **Authentication** → **Users**
2. You should see users who signed up (in `auth.users`)

#### **B. Migrate Existing Users**

If you have users in `auth.users` but not in `public.users`, run this:

```sql
-- Migrate existing auth users to public.users table
INSERT INTO public.users (id, email, full_name, avatar_url, created_at)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'full_name', '') as full_name,
  COALESCE(raw_user_meta_data->>'avatar_url', '') as avatar_url,
  created_at
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.users);

-- Verify migration
SELECT COUNT(*) as migrated_users FROM public.users;
```

#### **C. Test New Signup**

1. **Go to** `http://localhost:3000/signup`
2. **Create a new account:**
   - Full Name: `Test User`
   - Email: `newtest@example.com`
   - Password: `password123`
3. **Check Supabase:**
   - **Table Editor** → `users` table
   - You should see the new user! ✅

---

## 🎯 What the Trigger Does

### **On User Signup:**

```
User fills signup form
    ↓
Supabase creates user in auth.users
    ↓
🔥 TRIGGER FIRES 🔥
    ↓
Automatically creates record in public.users
    ↓
✅ User is ready to use the app!
```

### **On User Update:**

```
User updates profile (name, avatar)
    ↓
Supabase updates auth.users
    ↓
🔥 TRIGGER FIRES 🔥
    ↓
Automatically updates public.users
    ↓
✅ Data stays in sync!
```

---

## 📋 Understanding the Two User Tables

### **1. `auth.users` (Supabase Internal)**
- Created automatically by Supabase Auth
- Stores authentication credentials
- Handles login, password, email verification
- **You cannot modify this table directly**

### **2. `public.users` (Your Custom Table)**
- Your custom user data
- References `auth.users(id)`
- Used for relationships (organizations, content, etc.)
- **This is where you query user data**

---

## 🔍 Debugging

### **Check if trigger exists:**

```sql
SELECT 
  trigger_name, 
  event_manipulation, 
  event_object_table 
FROM information_schema.triggers 
WHERE trigger_name IN ('on_auth_user_created', 'on_auth_user_updated');
```

Should return:
```
on_auth_user_created    INSERT    users
on_auth_user_updated    UPDATE    users
```

### **Check if function exists:**

```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name IN ('handle_new_user', 'handle_user_update');
```

Should return:
```
handle_new_user
handle_user_update
```

### **Manually test the trigger:**

1. Sign up a new user
2. Check both tables:

```sql
-- Check auth.users
SELECT id, email, created_at 
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 5;

-- Check public.users
SELECT id, email, full_name, created_at 
FROM public.users 
ORDER BY created_at DESC 
LIMIT 5;
```

The IDs should match! ✅

---

## 🎉 After the Fix

Once the trigger is set up:

1. ✅ **New signups** automatically create records in both tables
2. ✅ **Profile updates** (name, avatar) sync automatically
3. ✅ **Users can be linked** to organizations, content, etc.
4. ✅ **No manual intervention** needed

---

## 🔄 Next Steps

After fixing this, you should also:

1. **Update organization creation** to link to the user:
   ```typescript
   const { data: { user } } = await supabase.auth.getUser();
   
   // Create organization
   const { data: org } = await supabase
     .from('organizations')
     .insert({ name: '...' })
     .select()
     .single();
   
   // Link user as owner
   await supabase
     .from('organization_members')
     .insert({
       organization_id: org.id,
       user_id: user.id,
       role: 'owner'
     });
   ```

2. **Filter data by user's organizations:**
   ```sql
   SELECT * FROM content_suggestions
   WHERE organization_id IN (
     SELECT organization_id 
     FROM organization_members 
     WHERE user_id = auth.uid()
   );
   ```

---

## ⚠️ Important Notes

1. **Run the trigger script ONCE** in your Supabase SQL Editor
2. **Existing users** need to be migrated using the migration query
3. **New users** will automatically be added from now on
4. **Don't delete** the trigger - it's needed for all future signups!

---

**Questions?** The trigger is now the "source of truth" for user creation. Every signup will automatically populate both tables! 🚀

