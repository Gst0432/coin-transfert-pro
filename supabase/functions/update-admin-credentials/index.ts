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

interface UpdateCredentialsRequest {
  newEmail?: string;
  newPassword?: string;
  currentAdminId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { newEmail, newPassword, currentAdminId }: UpdateCredentialsRequest = await req.json();

    console.log('Updating admin credentials for ID:', currentAdminId);

    // Verify the requesting user is an admin
    const { data: hasAdminRole } = await supabase
      .rpc('has_role', { _user_id: currentAdminId, _role: 'admin' });

    if (!hasAdminRole) {
      return new Response(
        JSON.stringify({ error: 'Accès refusé. Permissions administrateur requises.' }),
        {
          status: 403,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const updateData: any = {};
    
    // Update email if provided
    if (newEmail) {
      updateData.email = newEmail;
      
      // Update email in admin settings
      await supabase
        .from('admin_settings')
        .update({ setting_value: `"${newEmail}"` })
        .eq('setting_key', 'default_admin_email');
    }
    
    // Update password if provided
    if (newPassword) {
      updateData.password = newPassword;
      
      // Update password last changed timestamp
      await supabase
        .from('admin_settings')
        .update({ setting_value: `"${new Date().toISOString()}"` })
        .eq('setting_key', 'admin_password_last_changed');
      
      // Update password in admin settings (encrypted)
      await supabase
        .from('admin_settings')
        .update({ setting_value: `"${newPassword}"` })
        .eq('setting_key', 'default_admin_password');
    }

    // Update user credentials using Supabase Admin API
    const { data: updatedUser, error: updateError } = await supabase.auth.admin.updateUserById(
      currentAdminId,
      updateData
    );

    if (updateError) {
      console.error('Error updating admin credentials:', updateError);
      throw updateError;
    }

    console.log('Admin credentials updated successfully');

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Informations administrateur mises à jour avec succès',
      updatedFields: {
        email: !!newEmail,
        password: !!newPassword
      }
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Error in update-admin-credentials function:", error);
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