# Add to Calendar Feature Documentation

## Overview

The "Add to Calendar" feature allows users to save generated content suggestions directly to their content calendar for scheduling and planning.

## How It Works

### 1. Generate Content Suggestions

Navigate to **Setup** → **Content Suggestions** tab or **Suggestions** page:
- Make sure you have organization data and objectives set up
- Click "Generate Suggestions" to create AI-powered content ideas

### 2. Add to Calendar

For each generated suggestion, you'll see an "Add to Calendar" button:
- Click the button to save the content to your calendar
- The content will be saved with:
  - Title, posting date, platform
  - Content type, objective, content pillar
  - Full description and creative guidance
  - Caption and hashtags
  - Status: "scheduled"

### 3. View in Calendar

Navigate to **Calendar** page:
- Switch between Calendar View and Table View
- See all your scheduled content
- Edit, update, or delete calendar items
- View stats by platform and status

## Storage

Content is saved in two places:

1. **LocalStorage** (primary): Immediate, always works
2. **Supabase Database** (optional): Persistent across devices

If the database is not configured, content will still work via localStorage.

## Data Structure

```typescript
{
  id: string;
  title: string;
  posting_date: string;
  platform: string;
  content_type: string;
  objective: string;
  content_pillar: string;
  description: string;
  creative_guidance: string;
  caption: string;
  hashtags: string[];
  attachments: any[];
  notes: string;
  status: 'draft' | 'scheduled' | 'published' | 'cancelled';
  created_at: string;
  updated_at: string;
}
```

## API Endpoints

### POST /api/calendar
Create a new calendar item
```json
{
  "organization_id": "uuid",
  "title": "Post Title",
  "posting_date": "2024-01-15",
  "platform": "instagram",
  "content_type": "post",
  "objective": "brand_awareness",
  "content_pillar": "educational",
  "description": "...",
  "creative_guidance": "...",
  "caption": "...",
  "hashtags": ["#tag1", "#tag2"],
  "status": "scheduled"
}
```

### GET /api/calendar?organization_id=uuid
Get all calendar items for an organization

### PUT /api/calendar
Update a calendar item
```json
{
  "id": "item-id",
  "title": "Updated Title",
  ...
}
```

### DELETE /api/calendar?id=item-id
Delete a calendar item

## Features

✅ **Quick Add**: One-click to add suggestions to calendar
✅ **Auto-fill**: All fields populated from suggestion
✅ **Status Tracking**: Draft, Scheduled, Published, Cancelled
✅ **Platform Support**: Facebook, Instagram, LinkedIn, Twitter
✅ **Dual Storage**: LocalStorage + Database
✅ **Calendar Views**: Calendar view and Table view
✅ **Edit & Delete**: Full CRUD operations
✅ **Statistics**: View counts by status and platform

## Testing Checklist

1. ✅ Generate content suggestions
2. ✅ Click "Add to Calendar" button
3. ✅ Verify success message appears
4. ✅ Navigate to Calendar page
5. ✅ Verify content appears in calendar
6. ✅ Test both calendar and table views
7. ✅ Test editing a calendar item
8. ✅ Test deleting a calendar item
9. ✅ Refresh page and verify data persists (localStorage)
10. ✅ Check stats sidebar updates correctly

## Files Modified

1. `src/app/(dashboard)/calendar/page.tsx` - Load from localStorage, save/delete functions
2. `src/app/(dashboard)/suggestions/page.tsx` - Add to calendar implementation
3. `src/components/setup/content-suggestions.tsx` - Already had the feature
4. `src/app/api/calendar/route.ts` - New API endpoints for database operations

## Future Enhancements

- [ ] Toast notifications instead of alerts
- [ ] Bulk add multiple suggestions at once
- [ ] Integration with actual social media scheduling
- [ ] Recurring content templates
- [ ] Content approval workflow
- [ ] Performance analytics after posting
- [ ] AI-powered best posting time suggestions

