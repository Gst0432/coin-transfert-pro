import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PasswordResetRequest {
  email: string;
  resetUrl: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, resetUrl }: PasswordResetRequest = await req.json();

    // Initialize Supabase client to get settings
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get Resend configuration from app settings
    const { data: settings, error: settingsError } = await supabase
      .from("app_settings")
      .select("setting_key, setting_value")
      .in("setting_key", ["resend_from_email", "password_reset_enabled"]);

    if (settingsError) {
      console.error("Error fetching settings:", settingsError);
      throw new Error("Configuration error");
    }

    // Check if password reset is enabled
    const resetEnabled = settings?.find(s => s.setting_key === "password_reset_enabled")?.setting_value;
    if (resetEnabled !== true) {
      throw new Error("Password reset is disabled");
    }

    // Get from email
    const fromEmailSetting = settings?.find(s => s.setting_key === "resend_from_email")?.setting_value;
    const fromEmail = fromEmailSetting || "onboarding@resend.dev";

    // Send email using Resend API
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `Exchange <${fromEmail}>`,
        to: [email],
        subject: "Réinitialisation de votre mot de passe",
        html: `
          <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
            <h1 style="color: #333; text-align: center; margin-bottom: 30px;">Réinitialisation de mot de passe</h1>
            
            <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 25px;">
              Bonjour,
            </p>
            
            <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 25px;">
              Vous avez demandé la réinitialisation de votre mot de passe pour votre compte Exchange.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                Réinitialiser mon mot de passe
              </a>
            </div>
            
            <p style="color: #555; font-size: 14px; line-height: 1.5; margin-bottom: 15px;">
              Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email en toute sécurité.
            </p>
            
            <p style="color: #555; font-size: 14px; line-height: 1.5; margin-bottom: 15px;">
              Ce lien expirera dans 1 heure pour des raisons de sécurité.
            </p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <p style="color: #888; font-size: 12px; text-align: center;">
              Cet email a été envoyé par Exchange Platform
            </p>
          </div>
        `,
      }),
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.json();
      throw new Error(`Resend API error: ${errorData.message || emailResponse.statusText}`);
    }

    const emailData = await emailResponse.json();

    console.log("Password reset email sent successfully:", emailData);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Email de réinitialisation envoyé",
        id: emailData.id 
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-password-reset function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Erreur lors de l'envoi de l'email" 
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);