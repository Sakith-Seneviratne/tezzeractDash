import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { suggestions, organization_id } = body;

    // Validate required fields
    if (!organization_id || !suggestions || !Array.isArray(suggestions)) {
      return NextResponse.json(
        { error: 'Missing required fields: suggestions and organization_id' },
        { status: 400 }
      );
    }

    console.log(`Saving ${suggestions.length} suggestions to database for org: ${organization_id}`);
    console.log('First suggestion sample:', suggestions[0]);

    // Try to create Supabase client
    const supabase = await createClient();
    
    if (!supabase) {
      console.warn('Supabase client not available - saving to localStorage only');
      return NextResponse.json({ 
        success: true, 
        saved_count: 0,
        message: 'Saved to localStorage only (database not configured)'
      }, { status: 200 });
    }

    // Prepare suggestions for database insert
    const suggestionsToInsert = suggestions.map((suggestion: any) => ({
      organization_id,
      posting_date: suggestion.posting_date || suggestion.postingDate,
      title: suggestion.title,
      platform: suggestion.platform.toLowerCase(),
      content_type: suggestion.content_type || suggestion.contentType,
      objective: suggestion.objective,
      content_pillar: suggestion.content_pillar || suggestion.contentPillar,
      description: suggestion.description,
      creative_guidance: suggestion.creative_guidance || suggestion.creativeGuidance,
      caption: suggestion.caption,
      hashtags: Array.isArray(suggestion.hashtags) ? suggestion.hashtags : [],
      status: 'draft',
      generated_by: suggestion.generated_by || 'gemini'
    }));
    
    console.log('Prepared for insert (first item):', suggestionsToInsert[0]);

    // Insert into content_suggestions table
    const { data, error } = await supabase
      .from('content_suggestions')
      .insert(suggestionsToInsert)
      .select();

    if (error) {
      console.error('❌ FULL DATABASE ERROR:', JSON.stringify(error, null, 2));
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      // Don't fail - just return success for localStorage
      return NextResponse.json({ 
        success: true, 
        saved_count: 0,
        message: 'Saved to localStorage only (database error)',
        db_error: error.message,
        db_error_details: error.details,
        db_error_hint: error.hint,
        db_error_code: error.code
      }, { status: 200 });
    }

    console.log(`Successfully saved ${data?.length || 0} suggestions to database`);

    return NextResponse.json({ 
      success: true, 
      saved_count: data?.length || 0,
      suggestions: data
    }, { status: 201 });
  } catch (error) {
    console.error('Error in suggestions save API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

