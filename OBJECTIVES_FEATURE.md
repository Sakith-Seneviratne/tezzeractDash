# Objectives Feature Documentation

## Overview

The Objectives feature allows users to define business goals and targets that are used to generate personalized content suggestions aligned with their business strategy.

## How It Works

### 1. Adding Objectives

Navigate to **Setup** → **Objectives** tab:
- Fill in the objective form:
  - **Objective Type** (required): Brand Awareness, Engagement, Lead Generation, Sales, etc.
  - **Description** (required): Describe your objective
  - **Target Impressions**: Your impression goal
  - **Target Reach**: Your reach goal  
  - **Start Date**: When this objective begins
  - **End Date**: When this objective ends
- Click "Add Objective" to save

### 2. Data Storage

Objectives are saved in two places:
- **LocalStorage**: Key `organization_objectives`
- **Supabase Database**: (optional) Table `user_objectives`

### 3. Using Objectives for Content Suggestions

When you generate content suggestions:
1. The system loads all saved objectives
2. Sends them to the AI with full details:
   - Type (e.g., "BRAND AWARENESS")
   - Description
   - Date range (if provided)
   - Target metrics (impressions, reach)
3. AI generates content aligned with your objectives

## Objective Data Structure

```typescript
interface Objective {
  id: string;                    // Unique identifier
  type: string;                  // Objective type
  description: string;           // Objective description
  target_impressions: number;    // Target impressions
  target_reach: number;          // Target reach
  start_date?: string;           // Start date (YYYY-MM-DD)
  end_date?: string;             // End date (YYYY-MM-DD)
}
```

## Objective Types

Available objective types:
- **Brand Awareness**: Increase visibility and recognition
- **Engagement**: Drive interactions and conversations
- **Lead Generation**: Capture potential customers
- **Sales**: Drive direct sales
- **Website Traffic**: Increase site visits
- **Community Building**: Grow and engage audience
- **Product Launch**: Promote new product/service
- **Event Promotion**: Market events

## Example Flow

### Step 1: Create Objectives
```
Type: Brand Awareness
Description: Increase brand recognition by 20% in Q1
Target Impressions: 50,000
Target Reach: 25,000
Start Date: 2024-01-01
End Date: 2024-03-31
```

### Step 2: Generate Content
When you click "Generate Suggestions", the AI receives:
```
BUSINESS OBJECTIVES:
- BRAND AWARENESS: Increase brand recognition by 20% in Q1 
  [2024-01-01 to 2024-03-31] 
  (Target: 50,000 impressions, 25,000 reach)
```

### Step 3: AI-Generated Content
The AI creates content suggestions that:
- Target brand awareness specifically
- Are scheduled within your date range
- Aim to achieve your target metrics
- Include appropriate platforms and content types

## Integration with Content Suggestions

The objectives data is used in the Gemini AI prompt:

```javascript
const prompt = `
BUSINESS OBJECTIVES:
${objectives.map(obj => {
  const dateRange = obj.start_date && obj.end_date 
    ? ` [${obj.start_date} to ${obj.end_date}]` 
    : '';
  return `- ${obj.type.toUpperCase()}: ${obj.description}${dateRange} 
    (Target: ${obj.target_impressions} impressions, ${obj.target_reach} reach)`;
}).join('\n')}
...
`;
```

## Features

✅ **Multiple Objectives**: Add as many objectives as needed
✅ **Date Ranges**: Set specific timeframes for each objective  
✅ **Target Metrics**: Define specific KPI goals
✅ **Auto-Save**: Objectives save automatically to localStorage
✅ **AI Integration**: Used directly in content generation
✅ **Easy Management**: View, edit, or delete objectives anytime

## Validation

When generating content:
- ❌ Cannot generate without objectives
- ⚠️ Warning shown if no objectives exist
- ✅ Validates objectives have required fields (type, description)

## Best Practices

1. **Be Specific**: Clear descriptions help AI understand your goals
2. **Set Realistic Targets**: Use achievable impression/reach numbers
3. **Use Date Ranges**: Helps AI schedule content appropriately  
4. **Multiple Objectives**: Different goals for different campaigns
5. **Regular Updates**: Keep objectives current and relevant

## Example Objectives

### Brand Awareness Campaign
```
Type: Brand Awareness
Description: Launch new product line with focus on young professionals
Start Date: 2024-02-01
End Date: 2024-02-28
Target Impressions: 100,000
Target Reach: 50,000
```

### Lead Generation
```
Type: Lead Generation  
Description: Generate leads for spring webinar series
Start Date: 2024-03-01
End Date: 2024-03-31
Target Impressions: 25,000
Target Reach: 15,000
```

### Event Promotion
```
Type: Event Promotion
Description: Promote annual conference and drive registrations
Start Date: 2024-04-01
End Date: 2024-05-15
Target Impressions: 75,000
Target Reach: 40,000
```

---

## Files Involved

1. **`src/components/setup/objectives-manager.tsx`** - Add/manage objectives
2. **`src/components/setup/content-suggestions.tsx`** - Load and use objectives
3. **`src/app/api/llm/content-suggestions/route.ts`** - AI prompt with objectives
4. **`supabase-schema.sql`** - Database table `user_objectives`

---

**Need Help?** Make sure to add at least one objective before generating content suggestions!

