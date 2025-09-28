import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Setting up default admin...');

    // Check if admin setup is already completed
    const { data: setupStatus } = await supabase
      .from('admin_settings')
      .select('setting_value')
      .eq('setting_key', 'admin_setup_completed')
      .single();

    if (setupStatus?.setting_value === true) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Admin already exists' 
      }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Get default admin credentials from settings
    const { data: emailSetting } = await supabase
      .from('admin_settings')
      .select('setting_value')
      .eq('setting_key', 'default_admin_email')
      .single();

    const { data: passwordSetting } = await supabase
      .from('admin_settings')
      .select('setting_value')
      .eq('setting_key', 'default_admin_password')
      .single();

    const adminEmail = emailSetting?.setting_value || 'admin@exchange.com';
    const adminPassword = passwordSetting?.setting_value || 'Admin123!';

    console.log('Creating admin user with email:', adminEmail);

    // Create admin user using Supabase Admin API
    const { data: adminUser, error: createError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: {
        display_name: 'Administrateur Principal'
      }
    });

    if (createError) {
      console.error('Error creating admin user:', createError);
      
      // If user already exists, try to get the existing user
      if (createError.message.includes('User already registered')) {
        const { data: existingUsers } = await supabase.auth.admin.listUsers();
        const existingAdmin = existingUsers.users.find(u => u.email === adminEmail);
        
        if (existingAdmin) {
          console.log('Admin user already exists, using existing user');
          // Continue with role assignment
        } else {
          throw new Error('Admin user exists but could not be found');
        }
      } else {
        throw createError;
      }
    }

    // Get the created/existing user
    const { data: users } = await supabase.auth.admin.listUsers();
    const adminUserRecord = users.users.find(u => u.email === adminEmail);

    if (!adminUserRecord) {
      throw new Error('Could not find admin user after creation');
    }

    console.log('Admin user found/created:', adminUserRecord.id);

    // Create profile for admin
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: adminUserRecord.id,
        display_name: 'Administrateur Principal',
        phone_number: '+22700000000'
      });

    if (profileError) {
      console.error('Error creating admin profile:', profileError);
    }

    // Assign admin role
    const { error: roleError } = await supabase
      .from('user_roles')
      .upsert({
        user_id: adminUserRecord.id,
        role: 'admin'
      });

    if (roleError) {
      console.error('Error assigning admin role:', roleError);
      throw roleError;
    }

    // Mark admin setup as completed
    await supabase
      .from('admin_settings')
      .update({ setting_value: true })
      .eq('setting_key', 'admin_setup_completed');

    // Update password last changed timestamp
    await supabase
      .from('admin_settings')
      .update({ setting_value: `"${new Date().toISOString()}"` })
      .eq('setting_key', 'admin_password_last_changed');

    console.log('Default admin setup completed successfully');

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Admin créé avec succès',
      adminId: adminUserRecord.id,
      email: adminEmail
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Error in setup-default-admin function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);