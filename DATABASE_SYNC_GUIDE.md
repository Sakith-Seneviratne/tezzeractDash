# 🗄️ Database Sync Guide

## The Problem

Your application was saving data to **localStorage only**, not to the Supabase database. This caused errors when trying to save content suggestions:

```
insert or update on table "content_suggestions" violates foreign key constraint
Key is not present in table "organizations".
```

## The Solution

I've implemented a **dual-save system** that saves to both localStorage (for offline/immediate access) AND Supabase (for persistence/sharing).

---

## 🔧 What Was Fixed

### 1. **Organization Form** (`src/components/organization-form.tsx`)
- ✅ Now saves to localStorage (as before)
- ✅ **NEW:** Also saves to Supabase database via `/api/organization`
- ✅ Works even if database is unavailable (graceful fallback)

### 2. **Organization API** (`src/app/api/organization/route.ts`)
- ✅ **NEW:** Handles creating/updating organizations in Supabase
- ✅ Checks if organization exists (update) or is new (insert)
- ✅ Returns success even on database errors (doesn't break user flow)

### 3. **Content Suggestions Save** (`src/app/api/suggestions/save/route.ts`)
- ✅ Already working! Saves content suggestions to database
- ✅ Gracefully handles database errors

---

## 📋 Steps to Fix Your Current Setup

### **Step 1: Sync Existing Organization to Database**

You have organization data in localStorage but not in the database. Let's fix that:

1. **Open the sync tool** in your browser:
   ```
   http://localhost:3000/sync-organization.html
   ```

2. **Click "Sync to Database"**

3. **Verify** - You should see:
   ```
   ✅ Success!
   Organization synced to database successfully!
   Organization ID: 24b0a0bc-7f86-4608-8370-620e8bd1b675
   ```

### **Step 2: Verify in Supabase**

1. **Go to Supabase Dashboard** → Table Editor → `organizations`
2. **Check** that your organization appears with ID: `24b0a0bc-7f86-4608-8370-620e8bd1b675`

### **Step 3: Test Content Suggestions**

1. **Generate content suggestions** at `/setup`
2. **Check console** - should see:
   ```
   ✅ Saved 3 suggestions to database
   Successfully saved 3 suggestions to database
   ```
3. **Verify in Supabase** → Table Editor → `content_suggestions`
4. **Your suggestions should appear!** 🎉

---

## 🔍 How It Works Now

### **Data Flow:**

```
User Creates/Updates Organization
    ↓
1. Save to localStorage (immediate)
    ↓
2. Save to Supabase (persistent)
    ↓
User Generates Content Suggestions
    ↓
3. Save to localStorage (immediate display)
    ↓
4. Save to Supabase (organization_id exists now!)
    ↓
✅ Success! Data in both places
```

### **Graceful Degradation:**

If Supabase is unavailable:
- ✅ Data still saves to localStorage
- ✅ App continues to work
- ⚠️ Warning logged to console
- 📝 User can sync later when database is available

---

## 🧪 Testing Checklist

- [ ] Run `http://localhost:3000/sync-organization.html`
- [ ] Click "Sync to Database"
- [ ] Verify organization in Supabase `organizations` table
- [ ] Generate content suggestions at `/setup`
- [ ] Check console for "Successfully saved X suggestions to database"
- [ ] Verify suggestions in Supabase `content_suggestions` table
- [ ] Check calendar at `/calendar` - suggestions should appear
- [ ] Test "Add to Calendar" from suggestions page

---

## 🐛 Troubleshooting

### **Issue: "infinite recursion detected in policy"**
**Solution:** Run the RLS fix script (`scripts/fix-rls-policies.sql`) in Supabase SQL Editor

### **Issue: "Key is not present in table 'organizations'"**
**Solution:** Run the sync tool at `http://localhost:3000/sync-organization.html`

### **Issue: Organization data is empty**
**Solution:** 
1. Go to `/setup/organization`
2. Fill out the organization form
3. Click "Save"
4. Run the sync tool

### **Issue: Suggestions not appearing in calendar**
**Solution:** Check that dates are in `YYYY-MM-DD` format. Use the date fix tool if needed.

---

## 📊 Database Schema

### **organizations table:**
```sql
- id (uuid, primary key)
- name (text)
- slug (text)
- type (text)
- products_services (text)
- objectives (text)
- website_url (text)
- settings (jsonb)
- created_at (timestamp)
- updated_at (timestamp)
```

### **content_suggestions table:**
```sql
- id (uuid, primary key)
- organization_id (uuid, foreign key → organizations.id)
- posting_date (date)
- title (text)
- platform (text)
- content_type (text)
- objective (text)
- content_pillar (text)
- description (text)
- creative_guidance (text)
- caption (text)
- hashtags (text[])
- status (text)
- generated_by (text)
- created_at (timestamp)
```

---

## ✅ Next Steps

After syncing your organization:

1. **Test the full flow:**
   - Create organization → Generate suggestions → Add to calendar
   
2. **Verify database persistence:**
   - Check Supabase tables after each action
   
3. **Optional: Clean up old data:**
   - If you have duplicate/test data in localStorage, you can clear it and re-sync

---

## 🎉 Success Indicators

You'll know everything is working when:

- ✅ Organization form shows "Organization also saved to database!" in console
- ✅ Content generation shows "Successfully saved X suggestions to database"
- ✅ Supabase tables contain your data
- ✅ Calendar displays all content items
- ✅ No errors in browser console

Happy syncing! 🚀

