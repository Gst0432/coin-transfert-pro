import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();

    if (!email) {
      throw new Error('Email is required');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    console.log('Making user admin:', email);

    // First, find the user by email
    const userResponse = await fetch(
      `${supabaseUrl}/rest/v1/auth.users?email=eq.${encodeURIComponent(email)}`,
      {
        headers: {
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'apikey': supabaseServiceKey,
        },
      }
    );

    const users = await userResponse.json();
    
    if (!users || users.length === 0) {
      throw new Error('User not found');
    }

    const userId = users[0].id;

    // Check if user already has admin role
    const checkRoleResponse = await fetch(
      `${supabaseUrl}/rest/v1/user_roles?user_id=eq.${userId}&role=eq.admin`,
      {
        headers: {
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'apikey': supabaseServiceKey,
        },
      }
    );

    const existingRoles = await checkRoleResponse.json();
    
    if (existingRoles && existingRoles.length > 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'User is already an admin',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Add admin role
    const addRoleResponse = await fetch(
      `${supabaseUrl}/rest/v1/user_roles`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Content-Type': 'application/json',
          'apikey': supabaseServiceKey,
        },
        body: JSON.stringify({
          user_id: userId,
          role: 'admin'
        }),
      }
    );

    if (!addRoleResponse.ok) {
      const errorText = await addRoleResponse.text();
      throw new Error(`Failed to add admin role: ${errorText}`);
    }

    console.log('Successfully made user admin:', email);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'User has been made admin successfully',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error making user admin:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});