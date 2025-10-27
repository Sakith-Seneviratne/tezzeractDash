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

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        message: 'User not authenticated'
      }, { status: 401 });
    }

    // Ensure user exists in users table (create if doesn't exist)
    const { error: userError } = await supabase
      .from('users')
      .upsert({
        id: user.id,
        email: user.email || '',
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
        avatar_url: user.user_metadata?.avatar_url || null
      }, {
        onConflict: 'id'
      });

    if (userError) {
      console.error('Error ensuring user exists:', userError);
      // Continue anyway - might work without this
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
      
      // Add creator as organization member (owner)
      if (result.data && result.data.length > 0) {
        const memberResult = await supabase
          .from('organization_members')
          .insert({
            organization_id: organization.id,
            user_id: user.id,
            role: 'owner'
          });
        
        if (memberResult.error) {
          console.error('Error adding user as organization member:', memberResult.error);
          // Continue anyway - organization was created
        } else {
          console.log('User added as organization owner');
        }
      }
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

