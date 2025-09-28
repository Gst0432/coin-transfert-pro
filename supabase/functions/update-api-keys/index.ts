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

interface UpdateApiKeysRequest {
  adminId: string;
  apiKeys: {
    moneroo?: string | null;
    monerooLive?: string | null;
    nowpayments?: string | null;
  };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { adminId, apiKeys }: UpdateApiKeysRequest = await req.json();

    console.log('Updating API keys for admin ID:', adminId);

    // Verify the requesting user is an admin
    const { data: hasAdminRole } = await supabase
      .rpc('has_role', { _user_id: adminId, _role: 'admin' });

    if (!hasAdminRole) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Accès refusé. Permissions administrateur requises.' 
        }),
        {
          status: 403,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const updatedKeys: string[] = [];

    // Update Moneroo API Key (Sandbox) if provided
    if (apiKeys.moneroo && apiKeys.moneroo.trim().length > 0) {
      try {
        const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/v1/secrets`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: 'MONEROO_API_KEY',
            value: apiKeys.moneroo.trim()
          })
        });

        if (response.ok) {
          updatedKeys.push('MONEROO_API_KEY');
          console.log('MONEROO_API_KEY updated successfully');
        } else {
          console.error('Failed to update MONEROO_API_KEY:', await response.text());
        }
      } catch (error) {
        console.error('Error updating MONEROO_API_KEY:', error);
      }
    }

    // Update Moneroo Live API Key if provided
    if (apiKeys.monerooLive && apiKeys.monerooLive.trim().length > 0) {
      try {
        const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/v1/secrets`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: 'MONEROO_LIVE_API_KEY',
            value: apiKeys.monerooLive.trim()
          })
        });

        if (response.ok) {
          updatedKeys.push('MONEROO_LIVE_API_KEY');
          console.log('MONEROO_LIVE_API_KEY updated successfully');
        } else {
          console.error('Failed to update MONEROO_LIVE_API_KEY:', await response.text());
        }
      } catch (error) {
        console.error('Error updating MONEROO_LIVE_API_KEY:', error);
      }
    }

    // Update NOWPayments API Key if provided
    if (apiKeys.nowpayments && apiKeys.nowpayments.trim().length > 0) {
      try {
        const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/v1/secrets`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: 'NOWPAYMENTS_API_KEY',
            value: apiKeys.nowpayments.trim()
          })
        });

        if (response.ok) {
          updatedKeys.push('NOWPAYMENTS_API_KEY');
          console.log('NOWPAYMENTS_API_KEY updated successfully');
        } else {
          console.error('Failed to update NOWPAYMENTS_API_KEY:', await response.text());
        }
      } catch (error) {
        console.error('Error updating NOWPAYMENTS_API_KEY:', error);
      }
    }

    if (updatedKeys.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Aucune clé API valide fournie ou erreur lors de la mise à jour' 
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log('API keys updated successfully:', updatedKeys);

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Clés API mises à jour avec succès: ${updatedKeys.join(', ')}`,
      updatedKeys
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Error in update-api-keys function:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'Erreur interne du serveur'
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);