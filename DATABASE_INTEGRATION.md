# Database Integration Guide

## Overview

Content suggestions and calendar items now save to both **localStorage** (for immediate access) and **PostgreSQL/Supabase** (for persistence and multi-device sync).

---

## ✅ What's Integrated

### 1. **Content Suggestions → Database**
When you generate content suggestions:
- ✅ Saved to `localStorage` immediately
- ✅ Saved to Supabase `content_suggestions` table
- ✅ Includes all fields: title, date, platform, caption, hashtags, etc.

### 2. **Add to Calendar → Database**
When you click "Add to Calendar":
- ✅ Saved to `localStorage` for calendar view
- ✅ Saved to Supabase `content_calendar` table
- ✅ Status: "scheduled" by default

### 3. **Organization Data**
- ✅ Automatically generates UUID when creating organization
- ✅ Stored in localStorage with proper ID
- ✅ Used for database relationships

---

## 🔧 Setup Steps

### Step 1: Ensure Organization Has an ID

Your organization data needs a unique ID for database operations.

**Option A: Automatic (New Organizations)**
- When you create a new organization, it automatically gets a UUID
- No action needed!

**Option B: Fix Existing Organization**
1. Open: `http://localhost:3000/fix-organization-id.html`
2. Click "Check Organization Data"
3. If no ID exists, click "Add/Fix Organization ID"
4. Done! ✅

---

## 📊 Database Schema

### Content Suggestions Table
```sql
CREATE TABLE content_suggestions (
  id UUID PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id),
  posting_date DATE NOT NULL,
  title TEXT NOT NULL,
  platform TEXT NOT NULL,
  content_type TEXT NOT NULL,
  objective TEXT NOT NULL,
  content_pillar TEXT NOT NULL,
  description TEXT NOT NULL,
  creative_guidance TEXT NOT NULL,
  caption TEXT NOT NULL,
  hashtags TEXT[],
  status TEXT DEFAULT 'draft',
  generated_by TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Content Calendar Table
```sql
CREATE TABLE content_calendar (
  id UUID PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id),
  posting_date DATE NOT NULL,
  title TEXT NOT NULL,
  platform TEXT NOT NULL,
  content_type TEXT NOT NULL,
  objective TEXT NOT NULL,
  content_pillar TEXT NOT NULL,
  description TEXT NOT NULL,
  creative_guidance TEXT NOT NULL,
  caption TEXT NOT NULL,
  hashtags TEXT[],
  attachments JSONB DEFAULT '[]',
  notes TEXT,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔄 How It Works

### Flow: Generate Content Suggestions

1. **User clicks "Generate Suggestions"**
2. **AI generates content** with proper dates from objectives
3. **Save to localStorage** ✅
   ```javascript
   localStorage.setItem('content_suggestions', JSON.stringify(suggestions));
   ```
4. **Save to Database** ✅
   ```javascript
   POST /api/suggestions/save
   {
     suggestions: [...],
     organization_id: "uuid"
   }
   ```
5. **Success!** Content is now in both places

### Flow: Add to Calendar

1. **User clicks "Add to Calendar"** on a suggestion
2. **Create calendar item** with all details
3. **Save to localStorage** ✅
   ```javascript
   localStorage.setItem('content_calendar', JSON.stringify(calendar));
   ```
4. **Save to Database** ✅
   ```javascript
   POST /api/calendar
   {
     organization_id: "uuid",
     posting_date: "2024-01-15",
     title: "...",
     ...
   }
   ```
5. **Calendar refreshes** to show the new item

---

## 🐛 Troubleshooting

### Issue: "Suggestions not saving to database"

**Check:**
1. Organization has an ID:
   ```javascript
   // In browser console:
   JSON.parse(localStorage.getItem('organization_data')).id
   ```
2. Check console logs:
   - "Saving suggestions to database..."
   - "✅ Saved X suggestions to database"

**Fix:**
- Visit `http://localhost:3000/fix-organization-id.html`
- Click "Add/Fix Organization ID"

### Issue: "Calendar items not showing"

**Check:**
1. localStorage has items:
   ```javascript
   // In browser console:
   JSON.parse(localStorage.getItem('content_calendar'))
   ```
2. Refresh the calendar page

**Fix:**
- Check console for errors
- Make sure dates are in YYYY-MM-DD format
- Verify organization_id exists

### Issue: "Database errors in console"

**This is OK!** The system uses **dual storage**:
- If database fails → localStorage still works ✅
- Content is safe in localStorage
- Fix database connection when convenient

---

## 📝 Console Logs to Watch

### When Generating Content:
```
Generating content suggestions...
Organization data: {id: "uuid", name: "..."}
Objectives: [{...}]
Date range calculation:
- Today: 2024-10-21
- Earliest start: 2024-01-01
- Latest end: 2024-03-31
API response: {suggestions: [...]}
Saving suggestions to database...
✅ Saved 3 suggestions to database
```

### When Adding to Calendar:
```
Successfully added to calendar: {...}
```

---

## 🎯 API Endpoints

### POST /api/suggestions/save
Save generated suggestions to database
```json
{
  "suggestions": [...],
  "organization_id": "uuid"
}
```

### POST /api/calendar
Save calendar item to database
```json
{
  "organization_id": "uuid",
  "posting_date": "2024-01-15",
  "title": "My Post",
  "platform": "instagram",
  ...
}
```

### GET /api/calendar?organization_id=uuid
Retrieve calendar items

### PUT /api/calendar
Update calendar item

### DELETE /api/calendar?id=uuid
Delete calendar item

---

## 🚀 Future Enhancements

- [ ] Load suggestions from database on page load
- [ ] Sync calendar between localStorage and database
- [ ] Real-time updates across devices
- [ ] Bulk operations
- [ ] Export/import functionality

---

## ✅ Verification Checklist

Test everything works:

1. **Create Organization**
   - [ ] Organization has UUID
   - [ ] Saved to localStorage

2. **Add Objectives**
   - [ ] Objectives persist after tab switch
   - [ ] Date ranges set correctly

3. **Generate Content**
   - [ ] Console shows "Saving to database..."
   - [ ] Console shows "✅ Saved X suggestions"
   - [ ] Suggestions appear in list

4. **Add to Calendar**
   - [ ] Success message appears
   - [ ] Content appears in Calendar page
   - [ ] Both Calendar and Table views work

5. **Database Check (Supabase)**
   - [ ] Check `content_suggestions` table
   - [ ] Check `content_calendar` table
   - [ ] Verify organization_id matches

---

**Everything working?** 🎉 Your content is now safely stored in both localStorage AND the database!

