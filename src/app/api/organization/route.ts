import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { organization } = body;

    if (!organization) {
      return NextResponse.json(
        { error: 'Missing organization data' },
        { status: 400 }
      );
    }

    console.log('Saving organization to database:', organization.id);

    const supabase = await createClient();
    
    if (!supabase) {
      return NextResponse.json({ 
        success: true, 
        message: 'Saved to localStorage only (database not configured)'
      }, { status: 200 });
    }

    // Check if organization already exists
    const { data: existingOrg } = await supabase
      .from('organizations')
      .select('id')
      .eq('id', organization.id)
      .single();

    let result;
    
    if (existingOrg) {
      // Update existing organization
      result = await supabase
        .from('organizations')
        .update({
          name: organization.name,
          slug: organization.slug,
          type: organization.type,
          products_services: organization.products_services,
          objectives: organization.objectives,
          website_url: organization.website_url,
          settings: organization.settings || {}
        })
        .eq('id', organization.id)
        .select();
    } else {
      // Insert new organization
      result = await supabase
        .from('organizations')
        .insert({
          id: organization.id,
          name: organization.name,
          slug: organization.slug,
          type: organization.type,
          products_services: organization.products_services,
          objectives: organization.objectives,
          website_url: organization.website_url,
          settings: organization.settings || {}
        })
        .select();
    }

    const { data, error } = result;

    if (error) {
      console.error('Error saving organization to database:', error);
      return NextResponse.json({ 
        success: true, 
        message: 'Saved to localStorage only (database error)',
        db_error: error.message
      }, { status: 200 });
    }

    console.log('Successfully saved organization to database');

    return NextResponse.json({ 
      success: true,
      organization: data?.[0]
    }, { status: 201 });
  } catch (error) {
    console.error('Error in organization save API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

