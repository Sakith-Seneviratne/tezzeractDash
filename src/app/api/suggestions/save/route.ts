import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface Suggestion {
  posting_date?: string;
  postingDate?: string;
  title: string;
  platform: string;
  content_type?: string;
  contentType?: string;
  objective: string;
  content_pillar?: string;
  contentPillar?: string;
  description: string;
  creative_guidance?: string;
  creativeGuidance?: string;
  caption?: string;
  hashtags?: string[];
  generated_by?: string;
  id?: string;
}

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

    // Verify that the organization exists in the database
    console.log('Verifying organization exists:', organization_id);
    const { data: orgData, error: orgError } = await supabase
      .from('organizations')
      .select('id')
      .eq('id', organization_id)
      .single();

    if (orgError || !orgData) {
      console.error('Organization not found in database:', {
        organization_id,
        error: orgError?.message,
        hint: 'The organization_id from localStorage does not exist in the organizations table'
      });
      
      return NextResponse.json({ 
        success: true, 
        saved_count: 0,
        message: 'Organization not found in database. Please sync your organization first.',
        db_error: 'Organization not found',
        db_error_details: `Organization ID ${organization_id} does not exist in the organizations table`,
        db_error_hint: 'Go to Setup > Organization to sync your organization to the database',
        needs_org_sync: true
      }, { status: 200 });
    }

    console.log('✅ Organization verified:', orgData.id);

    // Prepare suggestions for database insert
    const suggestionsToInsert = suggestions.map((suggestion: Suggestion) => ({
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

